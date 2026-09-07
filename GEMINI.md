# Dokumentasi Sistem MONEV KPMA (Universitas Ibn Khaldun Bogor)

Aplikasi **MONEV KPMA** adalah platform Monitoring dan Evaluasi Mutu Akademik Internal berbasis standar **IAPS 5.1** yang mengintegrasikan pengisian evaluasi mandiri Program Studi, audit dokumen oleh Fakultas (GPM), dan analisis mutu eksekutif oleh Kantor Penjaminan Mutu Akademik (KPMA).

---

## 1. Arsitektur & Teknologi

- **Framework:** Next.js 16 (App Router dengan Turbopack)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **Database & ORM:** MySQL dengan Prisma ORM v6 (`prisma/schema.prisma`)
- **Autentikasi & Otorisasi:** NextAuth.js v5 (JWT Strategy, Credentials Provider, Impersonation Support)
- **Penyimpanan Berkas (Cloud Storage):** Integrasi Google Drive via Google Apps Script (GAS) Web App
- **Keamanan Data:** Enkripsi AES pada field jawaban instrumen (`answers`) di basis data

---

## 2. Struktur Menu & Peta Rute Navigasi

Sidebar aplikasi dikelompokkan ke dalam **2 Kategori Utama** yang ergonomis dan bebas dari scroll berlebih:

```
├── MONEV MUTU
│   ├── Dashboard                -> /dashboard
│   ├── Pengisian MONEV          -> /monev
│   ├── Laporan & Eksekutif ▾
│   │   ├── Laporan MONEV        -> /laporan
│   │   ├── Eksekutif (Prodi)    -> /laporan-eksekutif
│   │   ├── Eksekutif (Univ)     -> /laporan-eksekutif/universitas
│   │   └── Analisis KPMA        -> /master/analisis
│   └── Regulasi & Panduan ▾
│       ├── Peraturan SPMI       -> /regulasi/peraturan
│       └── Panduan Instrumen    -> /regulasi/instrumen
│
└── PENGATURAN & MASTER
    ├── Data Master ▾
    │   ├── Siklus Akademik      -> /master/cycles
    │   ├── Fakultas             -> /master/faculty
    │   ├── Program Studi        -> /master/prodi
    │   ├── Jenjang              -> /master/jenjang
    │   ├── Data Instrumen       -> /master/instruments
    │   └── Data Pengguna        -> /master/users
    └── Pengaturan Sistem ▾
        ├── Pengaturan Umum      -> /master/pengaturan
        ├── Penyimpanan Drive    -> /master/settings
        └── Hak Akses (RBAC)     -> /master/permissions
```

---

## 3. Matriks Peran Pengguna (Role-Based Access Control)

| Peran (*Role*) | Deskripsi & Tanggung Jawab Utama | Akses Menu Kunci |
|---|---|---|
| **KPMA** | Administrator universitas penjamin mutu akademik | Seluruh menu sistem, konfigurasi cloud, manajemen siklus & due date, analisis mutu, publikasi massal, dan impersonasi akun. |
| **GPM** | Gugus Penjaminan Mutu Fakultas | Dashboard fakultas, Pengisian MONEV (verifikasi kesesuaian bukti & catatan auditor), Laporan MONEV, Analisis KPMA prodi fakultas, Regulasi. |
| **GKM** | Gugus Kendali Mutu Program Studi / Kaprodi | Dashboard prodi, Pengisian MONEV (evaluasi diri & unggah bukti), Finalisasi & Pakta Integritas, Laporan MONEV, Dokumen Analisis KPMA. |
| **PIMPINAN_FAKULTAS** | Dekan / Wakil Dekan | Monitoring agregat fakultas, Ringkasan Eksekutif Fakultas, Laporan MONEV, Dokumen Analisis KPMA. |
| **PIMPINAN_UNIVERSITAS**| Rektor / Wakil Rektor | Monitoring agregat universitas, Ringkasan Eksekutif Universitas, Laporan MONEV, Dokumen Analisis KPMA. |

---

## 4. Alur Bisnis Kunci

### A. Pengisian & Batas Waktu (*Due Date*) + *Auto-Lock*
1. KPMA menetapkan rentang tanggal mulai (`startDate`) dan tenggat waktu (`endDate`) pada menu **Siklus Akademik**.
2. Banner hitung mundur di `/monev` memandu pengguna mengenai sisa hari pengisian.
3. Begitu melewati batas waktu (atau prodi telah difinalisasi), formulir prodi otomatis berstatus **Terkunci** (hanya-lihat) untuk peran `GKM`.

### B. Finalisasi Pengisian & Pakta Integritas
1. Prodi (`GKM`) yang telah menyelesaikan pengisian butir mengklik **"Kunci & Sahkan Pengisian (Pakta Integritas)"**.
2. PIC prodi mengisi nama dan mencentang pernyataan keabsahan dokumen.
3. Status tersimpan di tabel `monevsubmission`. KPMA dapat membuka kembali kuncian (*Reopen*) jika prodi mengajukan revisi resmi.

### C. Dokumen Analisis KPMA & Publikasi Massal
1. KPMA merumuskan catatan analisis per butir instrumen melalui lembar kerja **Analisis MONEV KPMA** (`/master/analisis`).
2. Status publikasi terbagi 2:
   - **Draft Internal KPMA:** Hanya terlihat oleh tim KPMA.
   - **Terbit (Resmi):** Resmi terlihat oleh Program Studi dan Fakultas.
3. Fitur **"📢 Publikasi Massal per Fakultas"**: Memungkinkan KPMA menerbitkan atau menarik draft seluruh prodi per fakultas (atau seluruh universitas) dalam satu klik.
4. **Akses Dokumen Analisis:**
   - Program Studi dapat membuka dokumen resmi analisis ini langsung melalui sidebar (**Laporan & Eksekutif &rarr; Analisis KPMA**) atau melalui tombol **`[ 📑 Dokumen Analisis KPMA ]`** di halaman daftar laporan dan preview laporan.

---

## 5. Konvensi Kode & Panduan Pengembang

1. **Penamaan Model Prisma:**
   - Model Prisma di skema didefinisikan dengan huruf kecil: `prisma.monevrecord`, `prisma.monevsubmission`, `prisma.cycle`, `prisma.prodi`, `prisma.faculty`.
   - Hindari pemanggilan PascalCase seperti `prisma.monevRecord` karena akan menyebabkan error TypeScript.
2. **Relasi Fakultas - Prodi:**
   - Gunakan nama field relasi `faculty.prodi` (bukan `faculty.prodis`).
3. **Pencocokan Rute Sidebar:**
   - Gunakan fungsi `isHrefActive` di `Sidebar.tsx` untuk membedakan rute yang memiliki awalan kata mirip (contoh: `/laporan`, `/laporan-eksekutif`, `/laporan-eksekutif/universitas`).
4. **Navigasi Universal:**
   - Komponen `Header.tsx` menyediakan tombol navigasi universal `[ ← Kembali ]` dan breadcrumb otomatis pada seluruh halaman di luar dashboard.

---

## 6. Perintah Operasional

```bash
# Menjalankan server dev
npm run dev

# Pengecekan tipe data TypeScript
npx tsc --noEmit

# Sinkronisasi skema ke database MySQL
npx prisma db push

# Regenerasi Prisma Client
npx prisma generate
```
