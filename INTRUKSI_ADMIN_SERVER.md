# Instruksi Update Server - SiMONEV

Dokumen ini berisi panduan singkat untuk Admin Server Pusat guna memperbaiki kesalahan build (TypeScript error) dan memperbarui sistem ke versi terbaru.

## Masalah yang Diperbaiki
Terdapat ketidakcocokan antara skema database terbaru dengan script seeding (`prisma/seed.ts`). Field `tahun_aktif` dan `semester_aktif` telah dipindahkan dari model `Setting` ke model `Cycle`.

## Langkah-langkah Update

Silakan jalankan perintah berikut di direktori utama project:

1. **Sinkronisasi Skema**:
   Pastikan skema database menggunakan SQLite (sesuai `.env` lokal/server):
   ```bash
   npx prisma generate
   ```

3. **Jalankan Build**:
   Build aplikasi untuk memastikan semua tipe data sudah valid:
   ```bash
   npm run build
   ```

4. **Inisialisasi Data (Opsional)**:
   Jika ini adalah instalasi baru atau database perlu di-reset/di-seed ulang:
   ```bash
   npx prisma db seed
   ```

## Kontak
Jika terdapat kendala lebih lanjut terkait build, silakan hubungi tim pengembang.
