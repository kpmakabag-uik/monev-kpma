/**
 * MONEV KPMA - Script Sinkronisasi Database MySQL
 * 
 * Script serbaguna untuk:
 * 1. PULL   : Menarik database dari SERVER ke LOKAL (Development)
 * 2. PUSH   : Mengirim database dari LOKAL ke SERVER (Production)
 * 3. BACKUP : Menyimpan snapshot database ke file .sql
 * 4. IMPORT : Memulihkan/impor file .sql ke database lokal/server
 * 
 * Penggunaan:
 * - Interaktif : node scripts/sync-db.js  (atau npm run db:sync)
 * - Tarik data : npm run db:pull
 * - Kirim data : npm run db:push
 * - Backup     : npm run db:backup
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ==========================================
// 1. HELPER: Load Environment Variables
// ==========================================
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.substring(0, eqIdx).trim();
    let val = trimmed.substring(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnv();

// ==========================================
// 2. HELPER: Parse Database URL
// ==========================================
function parseDbUrl(rawUrl) {
  if (!rawUrl) {
    throw new Error('Database URL tidak boleh kosong.');
  }

  try {
    // Normalisasi awalan jika perlu
    let cleanUrl = rawUrl.trim();
    const parsed = new URL(cleanUrl);

    const isSslNeeded = 
      parsed.searchParams.get('ssl-mode') === 'REQUIRED' ||
      parsed.searchParams.get('ssl') === 'true' ||
      parsed.hostname.includes('aivencloud.com') ||
      parsed.hostname.includes('amazonaws.com') ||
      parsed.port === '28896';

    const dbName = parsed.pathname.replace(/^\//, '').split('?')[0];

    return {
      host: (!parsed.hostname || parsed.hostname === 'localhost') ? '127.0.0.1' : parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || 'root'),
      password: decodeURIComponent(parsed.password || ''),
      database: dbName,
      ssl: isSslNeeded ? { rejectUnauthorized: false } : undefined,
      rawUrl: cleanUrl,
      displayUrl: `mysql://${decodeURIComponent(parsed.username || 'root')}:***@${parsed.hostname}:${parsed.port || 3306}/${dbName}`
    };
  } catch (err) {
    throw new Error(`Format DATABASE_URL tidak valid: "${rawUrl}". Contoh yang benar: mysql://root:password@localhost:3306/monev_db`);
  }
}

// ==========================================
// 3. HELPER: Test Connection
// ==========================================
async function testConnection(config, label = 'Database') {
  try {
    // Coba koneksi langsung ke DB
    const conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl,
      connectTimeout: 7000
    });
    return conn;
  } catch (err) {
    // Jika error karena database belum ada (ER_BAD_DB_ERROR), buat otomatis
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.log(`[INFO] Database "${config.database}" belum ada di ${label}. Mencoba membuat database...`);
      try {
        const rootConn = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          ssl: config.ssl,
          connectTimeout: 7000
        });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await rootConn.end();
        console.log(`[SUKSES] Database "${config.database}" berhasil dibuat di ${label}!`);

        // Hubungkan kembali
        return await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          database: config.database,
          ssl: config.ssl
        });
      } catch (createErr) {
        throw new Error(`Gagal membuat database "${config.database}" di ${label}: ${createErr.message}`);
      }
    }

    if (err.code === 'ECONNREFUSED') {
      throw new Error(
        `[KONEKSI GAGAL] Tidak dapat terhubung ke ${label} (${config.host}:${config.port}).\n` +
        `-> Jika ini database LOKAL: Pastikan modul MySQL di XAMPP / MariaDB sudah berstatus START (Hijau).\n` +
        `-> Jika ini database SERVER: Pastikan port 3306 terbuka atau alamat host sudah benar.`
      );
    }

    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error(
        `[KONEKSI DITOLAK] Username/Password untuk ${label} salah.\n` +
        `-> User: ${config.user}, Host: ${config.host}:${config.port}\n` +
        `-> Periksa kembali konfigurasi di file .env`
      );
    }

    throw new Error(`[KONEKSI GAGAL] Terjadi kesalahan saat menghubungkan ke ${label}: ${err.message}`);
  }
}

// ==========================================
// 4. CORE ENGINE: Sync Databases
// ==========================================
async function syncDatabases(sourceConfig, targetConfig, options = {}) {
  const startTime = Date.now();

  console.log('\n======================================================');
  console.log(` PROSES SINKRONISASI: ${options.directionName || 'DATABASE SYNC'}`);
  console.log('======================================================');
  console.log(`[SUMBER] : ${sourceConfig.displayUrl}`);
  console.log(`[TUJUAN] : ${targetConfig.displayUrl}`);
  console.log('------------------------------------------------------');

  console.log('\n[1/4] Menguji koneksi sumber & tujuan...');
  const sourceConn = await testConnection(sourceConfig, 'SUMBER');
  console.log('  ✔ Berhasil terhubung ke database SUMBER.');

  const targetConn = await testConnection(targetConfig, 'TUJUAN');
  console.log('  ✔ Berhasil terhubung ke database TUJUAN.');

  try {
    console.log('\n[2/4] Mengambil daftar tabel dari sumber...');
    const [tableRows] = await sourceConn.query('SHOW TABLES');
    const tables = tableRows.map(row => Object.values(row)[0]);

    if (tables.length === 0) {
      console.log('  ⚠ Peringatan: Tidak ada tabel yang ditemukan di database sumber.');
      return;
    }

    console.log(`  ✔ Ditemukan ${tables.length} tabel: ${tables.join(', ')}`);

    console.log('\n[3/4] Menyiapkan target (menonaktifkan foreign keys & strict checks)...');
    await targetConn.query('SET FOREIGN_KEY_CHECKS = 0');
    await targetConn.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO,ANSI_QUOTES"');
    try {
      await targetConn.query('SET SESSION sql_require_primary_key = 0');
    } catch (_) {
      // Abaikan jika tidak didukung oleh versi MySQL target
    }

    console.log('\n[4/4] Menyalin skema & data setiap tabel:');
    const summary = [];
    const BATCH_SIZE = 250;

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const stepPrefix = `  [${i + 1}/${tables.length}] \`${table}\``;

      // 1. Ambil DDL skema dari sumber
      const [createRows] = await sourceConn.query(`SHOW CREATE TABLE \`${table}\``);
      let createSql = createRows[0]['Create Table'] || createRows[0]['create table'] || Object.values(createRows[0])[1];

      // Normalisasi jika diperlukan
      await targetConn.query(`DROP TABLE IF EXISTS \`${table}\``);
      await targetConn.query(createSql);

      // 2. Hitung total baris di sumber
      const [countResult] = await sourceConn.query(`SELECT COUNT(*) as total FROM \`${table}\``);
      const totalRows = countResult[0].total;

      if (totalRows === 0) {
        console.log(`${stepPrefix}: 0 baris (struktur berhasil dibuat).`);
        summary.push({ table, rows: 0, status: 'OK (Kosong)' });
        continue;
      }

      // 3. Salin data per batch
      let transferred = 0;
      while (transferred < totalRows) {
        const [rows] = await sourceConn.query(
          `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`,
          [BATCH_SIZE, transferred]
        );

        if (rows.length === 0) break;

        const columns = Object.keys(rows[0]);
        const values = rows.map(r => columns.map(c => r[c]));

        // Buat statement INSERT massal dengan escape otomatis dari mysql2
        const insertSql = mysql.format(
          `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES ?`,
          [values]
        );

        await targetConn.query(insertSql);
        transferred += rows.length;

        process.stdout.write(`\r${stepPrefix}: Menyalin ${transferred}/${totalRows} baris (${Math.round((transferred / totalRows) * 100)}%)...`);
      }

      console.log(`\r${stepPrefix}: ✔ Selesai (${totalRows} baris disinkronkan).          `);
      summary.push({ table, rows: totalRows, status: 'SUKSES' });
    }

    // Aktifkan kembali pengecekan foreign key
    await targetConn.query('SET FOREIGN_KEY_CHECKS = 1');

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n======================================================');
    console.log(` 🎉 SINKRONISASI BERHASIL! (Waktu: ${durationSec} detik)`);
    console.log('======================================================');
    console.table(summary);

  } finally {
    try { await sourceConn.end(); } catch (_) {}
    try { await targetConn.end(); } catch (_) {}
  }
}

// ==========================================
// 5. HELPER: Backup Database to .SQL File
// ==========================================
async function backupDatabase(config, customOutDir = 'backups') {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = path.resolve(process.cwd(), customOutDir);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const safeDbName = config.database.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `backup_${safeDbName}_${timestamp}.sql`;
  const filePath = path.join(outDir, filename);

  console.log(`\n[BACKUP] Menghubungkan ke ${config.displayUrl}...`);
  const conn = await testConnection(config, 'BACKUP');

  try {
    const [tableRows] = await conn.query('SHOW TABLES');
    const tables = tableRows.map(row => Object.values(row)[0]);

    const stream = fs.createWriteStream(filePath, { encoding: 'utf8' });

    stream.write(`-- MONEV KPMA SQL DUMP\n`);
    stream.write(`-- Waktu Backup: ${new Date().toLocaleString('id-ID')}\n`);
    stream.write(`-- Database: ${config.database}\n`);
    stream.write(`-- Host: ${config.host}\n\n`);
    stream.write(`SET NAMES utf8mb4;\n`);
    stream.write(`SET FOREIGN_KEY_CHECKS = 0;\n`);
    stream.write(`SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO,ANSI_QUOTES";\n\n`);

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      console.log(`  [${i + 1}/${tables.length}] Mengekspor tabel \`${table}\`...`);

      const [createRows] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
      const createSql = createRows[0]['Create Table'] || createRows[0]['create table'] || Object.values(createRows[0])[1];
      stream.write(`--\n-- Struktur tabel \`${table}\`\n--\n`);
      stream.write(`DROP TABLE IF EXISTS \`${table}\`;\n`);
      stream.write(`${createSql};\n\n`);

      const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        stream.write(`--\n-- Data untuk tabel \`${table}\`\n--\n`);
        const columns = Object.keys(rows[0]);
        const BATCH = 100;
        for (let b = 0; b < rows.length; b += BATCH) {
          const chunk = rows.slice(b, b + BATCH);
          const values = chunk.map(r => columns.map(c => r[c]));
          const insertSql = mysql.format(
            `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES ?;\n`,
            [values]
          );
          stream.write(insertSql);
        }
        stream.write(`\n`);
      }
    }

    stream.write(`SET FOREIGN_KEY_CHECKS = 1;\n`);
    stream.end();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✔ Backup selesai!`);
    console.log(`📁 File tersimpan di: ${filePath} (${duration} detik)\n`);
    return filePath;
  } finally {
    try { await conn.end(); } catch (_) {}
  }
}

// ==========================================
// 6. HELPER: Import .SQL File
// ==========================================
async function importSqlFile(targetConfig, filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File SQL "${filePath}" tidak ditemukan!`);
  }

  // 1. Coba naikkan max_allowed_packet di target database jika user memiliki izin
  try {
    const preConn = await mysql.createConnection({
      host: targetConfig.host,
      port: targetConfig.port,
      user: targetConfig.user,
      password: targetConfig.password,
      ssl: targetConfig.ssl
    });
    await preConn.query('SET GLOBAL max_allowed_packet = 134217728;'); // 128MB
    await preConn.end();
  } catch (_) {
    // Abaikan jika user bukan root/tidak punya hak SUPER
  }

  console.log(`\n[IMPORT] Membaca file SQL: ${filePath}...`);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`[IMPORT] Menghubungkan ke target: ${targetConfig.displayUrl}...`);
  const conn = await mysql.createConnection({
    host: targetConfig.host,
    port: targetConfig.port,
    user: targetConfig.user,
    password: targetConfig.password,
    database: targetConfig.database,
    ssl: targetConfig.ssl,
    multipleStatements: true
  });

  try {
    console.log(`[IMPORT] Menjalankan query SQL ke database ${targetConfig.database}...`);
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
    await conn.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO,ANSI_QUOTES";');
    try { await conn.query('SET SESSION sql_require_primary_key = 0;'); } catch (_) {}
    await conn.query(sql);
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log(`✔ File SQL "${path.basename(filePath)}" berhasil diimpor ke ${targetConfig.database}!`);
  } finally {
    try { await conn.end(); } catch (_) {}
  }
}

// ==========================================
// 7. CLI INTERACTIVE PROMPT
// ==========================================
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

// ==========================================
// 8. MAIN ENTRY POINT
// ==========================================
async function main() {
  const args = process.argv.slice(2);
  const argMap = {};
  for (const a of args) {
    if (a.startsWith('--')) {
      const [k, v] = a.substring(2).split('=');
      argMap[k] = v === undefined ? true : v;
    }
  }

  const localUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/monev_db';
  const remoteUrl = process.env.REMOTE_DATABASE_URL || process.env.SERVER_DATABASE_URL;

  // Direct CLI mode: --pull
  if (argMap.pull || argMap.direction === 'pull') {
    if (!remoteUrl) {
      console.error('[ERROR] REMOTE_DATABASE_URL belum diatur di file .env!');
      process.exit(1);
    }
    const source = parseDbUrl(remoteUrl);
    const target = parseDbUrl(localUrl);
    await syncDatabases(source, target, { directionName: 'PULL (SERVER -> LOKAL)' });
    return;
  }

  // Direct CLI mode: --push
  if (argMap.push || argMap.direction === 'push') {
    if (!remoteUrl) {
      console.error('[ERROR] REMOTE_DATABASE_URL belum diatur di file .env!');
      process.exit(1);
    }
    if (!argMap.force && !argMap.y && !argMap.yes) {
      const confirm = await askQuestion(
        '\n⚠ PERINGATAN: Anda akan MENIMPA data di SERVER dengan data dari LOKAL!\n' +
        'Ketik "SINKRON" untuk melanjutkan: '
      );
      if (confirm !== 'SINKRON') {
        console.log('Operasi PUSH dibatalkan.');
        return;
      }
    }
    const source = parseDbUrl(localUrl);
    const target = parseDbUrl(remoteUrl);
    await syncDatabases(source, target, { directionName: 'PUSH (LOKAL -> SERVER)' });
    return;
  }

  // Direct CLI mode: --backup
  if (argMap.backup || argMap.action === 'backup') {
    const targetUrl = argMap.target === 'remote' ? remoteUrl : localUrl;
    if (!targetUrl) {
      console.error('[ERROR] URL database untuk backup tidak tersedia.');
      process.exit(1);
    }
    const config = parseDbUrl(targetUrl);
    await backupDatabase(config);
    return;
  }

  // Interactive CLI Menu
  console.clear();
  console.log('======================================================');
  console.log('      MONEV KPMA - TOOL SINKRONISASI DATABASE        ');
  console.log('======================================================');
  console.log(` [Lokal]  : ${localUrl}`);
  console.log(` [Server] : ${remoteUrl || '(Belum diatur di .env: REMOTE_DATABASE_URL)'}`);
  console.log('------------------------------------------------------');
  console.log(' Pilihan Menu:');
  console.log('  [1] 📥 PULL   : Tarik database dari SERVER ke LOKAL');
  console.log('  [2] 📤 PUSH   : Kirim database dari LOKAL ke SERVER (Hati-hati)');
  console.log('  [3] 💾 BACKUP : Buat file cadangan .SQL (Lokal)');
  console.log('  [4] 💾 BACKUP : Buat file cadangan .SQL (Server)');
  console.log('  [5] 📂 IMPORT : Impor file .SQL ke Database Lokal');
  console.log('  [6] ❌ Keluar');
  console.log('------------------------------------------------------');

  const choice = await askQuestion(' Masukkan nomor pilihan [1-6]: ');

  switch (choice) {
    case '1': {
      if (!remoteUrl) {
        console.log('\n[ERROR] Silakan tambahkan REMOTE_DATABASE_URL di file .env terlebih dahulu!');
        break;
      }
      const source = parseDbUrl(remoteUrl);
      const target = parseDbUrl(localUrl);
      await syncDatabases(source, target, { directionName: 'PULL (SERVER -> LOKAL)' });
      break;
    }

    case '2': {
      if (!remoteUrl) {
        console.log('\n[ERROR] Silakan tambahkan REMOTE_DATABASE_URL di file .env terlebih dahulu!');
        break;
      }
      const confirm = await askQuestion(
        '\n⚠ PERINGATAN: Database SERVER akan ditimpa seluruhnya dengan data LOKAL!\n' +
        'Ketik "SINKRON" untuk melanjutkan: '
      );
      if (confirm === 'SINKRON') {
        const source = parseDbUrl(localUrl);
        const target = parseDbUrl(remoteUrl);
        await syncDatabases(source, target, { directionName: 'PUSH (LOKAL -> SERVER)' });
      } else {
        console.log('Operasi dibatalkan.');
      }
      break;
    }

    case '3': {
      const config = parseDbUrl(localUrl);
      await backupDatabase(config);
      break;
    }

    case '4': {
      if (!remoteUrl) {
        console.log('\n[ERROR] REMOTE_DATABASE_URL belum diatur di .env!');
        break;
      }
      const config = parseDbUrl(remoteUrl);
      await backupDatabase(config);
      break;
    }

    case '5': {
      const target = parseDbUrl(localUrl);
      // Cari file sql di direktori saat ini atau backups/
      const cwdFiles = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.sql'));
      const backupDir = path.resolve(process.cwd(), 'backups');
      const backupFiles = fs.existsSync(backupDir) ? fs.readdirSync(backupDir).filter(f => f.endsWith('.sql')) : [];

      console.log('\nFile .SQL yang ditemukan:');
      const allFiles = [
        ...cwdFiles.map(f => path.join('.', f)),
        ...backupFiles.map(f => path.join('backups', f))
      ];

      allFiles.forEach((f, idx) => console.log(`  [${idx + 1}] ${f}`));
      console.log('  [0] Ketik path file manual');

      const fileChoice = await askQuestion('Pilih nomor file: ');
      let chosenPath = '';
      if (fileChoice === '0') {
        chosenPath = await askQuestion('Masukkan path file .sql: ');
      } else {
        const idx = parseInt(fileChoice, 10) - 1;
        if (allFiles[idx]) {
          chosenPath = path.resolve(process.cwd(), allFiles[idx]);
        }
      }

      if (chosenPath && fs.existsSync(chosenPath)) {
        await importSqlFile(target, chosenPath);
      } else {
        console.log('File tidak ditemukan atau pilihan dibatalkan.');
      }
      break;
    }

    case '6':
    default:
      console.log('Keluar.');
      break;
  }
}

// Jalankan program
main().catch(err => {
  console.error('\n❌ TERJADI KESALAHAN:');
  console.error(err.message);
  process.exit(1);
});
