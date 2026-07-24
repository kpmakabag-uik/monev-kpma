# Panduan Deployment SiMONEV KPMA UIKA Bogor

Dokumen ini berisi instruksi teknis untuk hosting aplikasi SiMONEV di server production.

## 1. Prasyarat Server
Pastikan server memiliki komponen berikut:
- **Node.js**: Versi 20.x (LTS recommended).
- **NPM**: Versi terbaru.
- **Database**: MySQL 8.x atau MariaDB 10.x.
- **Port**: Aplikasi berjalan default di port `3000`.

## 2. File yang Harus Disiapkan (Zipping)
Anda dapat menjalankan script `package_project.ps1` untuk membuat file `simonev_deploy.zip` secara otomatis. Script ini akan mengecualikan folder besar seperti `node_modules` dan `.next`.

## 3. Konfigurasi Environment (`.env`)
Admin server perlu membuat file `.env` di root project dengan isi sebagai berikut:

```env
# Secret untuk enkripsi session (Ganti dengan string acak yang kuat)
AUTH_SECRET="monev_super_secret_for_production"

# Set true jika menggunakan domain/https
AUTH_TRUST_HOST="true"

# URL Utama Aplikasi (Ganti dengan domain server)
# Contoh: http://simonev.uika-bogor.ac.id
AUTH_URL="http://localhost:3000"

# Koneksi Database MySQL
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL="mysql://root:password@localhost:3306/monev_db"
```

## 4. Langkah Instalasi di Server
Jalankan perintah berikut secara berurutan di terminal server:

1. **Ekstrak File**: Pindahkan `simonev_deploy.zip` ke server dan ekstrak.
2. **Instal Dependensi**:
   ```bash
   npm install
   ```
3. **Generate Database Client**:
   ```bash
   npx prisma generate
   ```
4. **Build Aplikasi**:
   ```bash
   npm run build
   ```
5. **Setup Database (Hanya untuk instalasi pertama)**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

## 5. Menjalankan di Production (PM2)
Gunakan PM2 agar aplikasi tetap berjalan setelah terminal ditutup:

```bash
npm install -g pm2
pm2 start npm --name "simonev-app" -- start
pm2 save
pm2 startup
```

## 6. Fitur Penting Setelah Deployment
1. **Laporan MONEV**: Fitur laporan siap digunakan setelah data diisi oleh Prodi. Pastikan server memiliki resource yang cukup untuk generate PDF.
2. **Penyimpanan Berkas**: 
   - Jika menggunakan **Google Drive**, pastikan URL Apps Script sudah diatur di menu **Master Data > Pengaturan**.
   - Jika menggunakan **Penyimpanan Lokal**, pastikan folder `public/uploads` di server memiliki izin tulis (write permission):
     ```bash
     chmod -R 775 public/uploads
     ```

## 7. Update Aplikasi di Masa Depan
Jika ada perubahan kode, cukup kirim file terbaru, jalankan `npm install`, `npx prisma generate`, `npm run build`, lalu restart PM2:
```bash
pm2 restart simonev-app
```
