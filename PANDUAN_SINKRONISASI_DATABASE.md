# Panduan Sinkronisasi Database (Lokal & Server) - SiMONEV KPMA

Aplikasi SiMONEV telah dilengkapi script otomatis untuk menyinkronkan basis data antara **komputer lokal (development)** dan **server (production/cloud)** secara aman, cepat, dan terstruktur.

---

## 1. Persiapan Konfigurasi (`.env`)

Buka file `.env` di root direktori proyek, pastikan terdapat konfigurasi URL database lokal dan remote:

```env
# Database Lokal (XAMPP / MySQL Lokal)
DATABASE_URL="mysql://root:@localhost:3306/monev_db"

# Database Server (Production / Cloud / Aiven / Hostinger)
REMOTE_DATABASE_URL="mysql://avnadmin:AVNS_1kmQ_VylaaHZYlxXEjq@mysql-1d01cd1d-monevkpma2026.l.aivencloud.com:28896/defaultdb"
```

> **Catatan:**
> - Jika server production menggunakan Hostinger / cPanel / VPS lain, cukup ganti string `REMOTE_DATABASE_URL` sesuai akun database server Anda.
> - Format standar: `mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`

---

## 2. Cara Menggunakan Script

Anda dapat menjalankan sinkronisasi melalui **3 cara mudah**:

### Cara A: Klik Ganda (*Double-Click*) File Batch di Windows
Cukup klik dua kali file:
```
sync_db.bat
```
Menu interaktif akan terbuka di Command Prompt.

---

### Cara B: Perintah Cepat (*NPM Scripts*)

Jalankan perintah berikut di terminal:

| Perintah | Deskripsi |
|---|---|
| **`npm run db:pull`** | **Tarik data terbaru dari Server ke Komputer Lokal** (Paling sering digunakan saat dev). |
| **`npm run db:push`** | **Kirim data dari Komputer Lokal ke Server** *(Dilengkapi konfirmasi pengaman)*. |
| **`npm run db:backup`** | **Buat cadangan database ke file `.sql`** di folder `backups/`. |
| **`npm run db:sync`** | **Buka Menu Interaktif** (Pilihan lengkap). |

---

### Cara C: Menu Interaktif Terminal

Jalankan:
```bash
npm run db:sync
```
atau:
```bash
node scripts/sync-db.js
```

Tampilan menu interaktif:
```
======================================================
      MONEV KPMA - TOOL SINKRONISASI DATABASE        
======================================================
 [Lokal]  : mysql://root:@localhost:3306/monev_db
 [Server] : mysql://avnadmin:***@mysql-1d01cd1d-monevkpma2026.l.aivencloud.com:28896/defaultdb
------------------------------------------------------
 Pilihan Menu:
  [1] 📥 PULL   : Tarik database dari SERVER ke LOKAL
  [2] 📤 PUSH   : Kirim database dari LOKAL ke SERVER (Hati-hati)
  [3] 💾 BACKUP : Buat file cadangan .SQL (Lokal)
  [4] 💾 BACKUP : Buat file cadangan .SQL (Server)
  [5] 📂 IMPORT : Impor file .SQL ke Database Lokal
  [6] ❌ Keluar
------------------------------------------------------
 Masukkan nomor pilihan [1-6]:
```

---

## 3. Fitur & Keunggulan Script

1. **Auto Batch Insert**: Menyalin ribuan data instrumen dan monev record per 250 baris secara bertahap sehingga tidak membebani memori RAM dan koneksi.
2. **Penonaktifan Relasi Sementara (`FOREIGN_KEY_CHECKS = 0`)**: Memastikan urutan impor tabel tidak gagal akibat kendala relasi foreign key (*circular dependency*).
3. **Kompatibilitas Lintas Mesin (`ANSI_QUOTES`)**: Mengatasi perbedaan tanda kutip antara MySQL Windows (backtick) dan MySQL Cloud/Linux (double quotes).
4. **Auto-Create Database**: Jika database tujuan belum pernah dibuat, script akan otomatis mengeksekusi `CREATE DATABASE` terlebih dahulu.
5. **Konfirmasi Pengaman**: Saat memilih opsi `PUSH` (Lokal -> Server), pengguna diwajibkan mengetik kata kunci `"SINKRON"` agar tidak ada data server yang tidak sengaja tertimpa.

---

## 4. Troubleshooting Kendala Umum

### 🔴 Error: `ECONNREFUSED connect ECONNREFUSED 127.0.0.1:3306`
- **Penyebab**: Modul MySQL di komputer lokal belum dinyalakan.
- **Solusi**: Buka aplikasi **XAMPP Control Panel**, lalu klik tombol **Start** pada baris **MySQL** hingga indikator berwarna hijau.

### 🔴 Error: `ETIMEDOUT` atau `ER_ACCESS_DENIED_ERROR` pada Server
- **Penyebab**: Kredensial username/password salah, atau IP komputer Anda belum diizinkan (*Remote MySQL Whitelist* di cPanel/Hostinger).
- **Solusi**: 
  1. Periksa username dan password di `REMOTE_DATABASE_URL`.
  2. Jika menggunakan cPanel / Hostinger, buka menu **Remote MySQL**, tambahkan tanda `%` (atau IP publik Anda) agar server menerima koneksi dari luar.
