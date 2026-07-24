# Panduan Persiapan Database MySQL (XAMPP)

Jika Anda melihat error **PrismaClientInitializationError (Can't reach database server)**, silakan ikuti langkah-langkah berikut:

## 1. Pastikan Server MySQL Berjalan
Hasil pengecekan terakhir menunjukkan koneksi ke port `3306` gagal (`TcpTestSucceeded: False`). 
- Buka **XAMPP Control Panel**.
- Pastikan modul **MySQL** sudah dalam status **Start** (berwarna hijau).

## 2. Siapkan Database
Aplikasi dikonfigurasi untuk mencari database bernama `monev_db`.
- Buka [http://localhost/phpmyadmin](http://localhost/phpmyadmin) di browser Anda.
- Klik menu **New** di sidebar kiri.
- Masukkan nama database: **`monev_db`**.
- Klik tombol **Create**.

## 3. Inisialisasi Tabel
Setelah MySQL menyala dan database dibuat, jalankan perintah berikut di terminal project:
```bash
npx prisma db push
```
Perintah ini akan menyinkronkan skema `prisma/schema.prisma` ke database MySQL Anda.

## 4. Jalankan Aplikasi
Setelah database siap, jalankan aplikasi dengan:
```bash
npm run dev
```
