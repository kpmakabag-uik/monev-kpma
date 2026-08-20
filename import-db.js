const mysql = require('mysql2/promise');
const fs = require('fs');

async function importDb() {
  const connection = await mysql.createConnection({
    uri: 'mysql://avnadmin:AVNS_1kmQ_VylaaHZYlxXEjq@mysql-1d01cd1d-monevkpma2026.l.aivencloud.com:28896/defaultdb?ssl-mode=REQUIRED',
    multipleStatements: true
  });

  console.log('Connected to Aiven!');

  const sql = fs.readFileSync('fresh_dump_fixed.sql', 'utf8');
  console.log('Importing SQL dump...');
  
  try {
    await connection.query('SET SESSION sql_require_primary_key = 0;');
    await connection.query(sql);
    console.log('Import SUCCESS!');
  } catch (e) {
    console.error('Import ERROR:', e.message);
  }

  await connection.end();
}

importDb();
