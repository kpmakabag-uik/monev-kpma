# Panduan Penggunaan Sistem MONEV (Alur Pengisian & Verifikasi)

Dokumen ini adalah panduan standar operasional untuk pengguna aplikasi MONEV (Monev Mutu Perguruan Tinggi). Proses ini melibatkan dua pihak utama: **Tim Program Studi (GKM/Kaprodi)** sebagai pengisi data, dan **Tim Auditor (GPM/KPMA)** sebagai verifikator.

---

## TAHAP 1: Pengisian Evaluasi Diri oleh Program Studi (Role: GKM)

**Tugas Utama:** Melakukan evaluasi mandiri (klaim), memberikan penjelasan, dan melampirkan dokumen bukti.

### 1. Membuka Daftar Instrumen
1. Login menggunakan akun Prodi (Role: GKM).
2. Buka menu **Data Form MONEV**.
3. Anda akan melihat tabel berisi daftar instrumen evaluasi. Perhatikan kolom **"Progres Prodi"**. Terdapat 3 bar yang harus Anda penuhi hingga mencapai warna **Hijau (100%)**:
   - **Pengisian:** Target seluruh pertanyaan harus dijawab.
   - **Keterangan / Temuan:** Target memberikan penjelasan/evaluasi deskriptif pada pertanyaan.
   - **Bukti Terunggah:** Target melampirkan dokumen khusus untuk butir yang diklaim "Ya".

### 2. Mengisi Form Evaluasi
1. Klik tombol **"Buka Form"** pada salah satu instrumen.
2. Untuk setiap butir pertanyaan:
   - Pilih opsi **Ya** atau **Tidak** pada kolom pengisian.
   - Jika Anda memilih **Ya**, Anda **wajib** melakukan 2 hal tambahan:
     - **Mengisi Keterangan/Temuan:** Tuliskan kalimat penjelas (minimal 3 kata / 10 karakter). *Sistem tidak akan menghitung progres Anda jika Anda menulis asal-asalan seperti "aaa" atau sekadar "tidak ada".*
     - **Mengunggah Bukti Dokumen:** Klik *Choose Files* dan unggah dokumen pendukung (maksimal 10MB per file).

### 3. Menyimpan dan Memantau Progres
1. Setelah selesai mengisi (atau ingin mencicil sebagian), klik tombol **Simpan Data**.
2. Anda akan dikembalikan ke halaman Tabel Instrumen. 
3. Perhatikan pergerakan bar pada kolom **Progres Prodi**. Lanjutkan pengisian pada waktu lain jika bar belum mencapai 100%.

---

## TAHAP 2: Verifikasi & Audit oleh Tim Penjamin Mutu (Role: GPM / KPMA)

**Tugas Utama:** Melakukan kroscek antara klaim Prodi ("Ya") dengan kesahihan dokumen bukti yang dilampirkan, lalu memberikan skor kesesuaian.

### 1. Membuka Daftar Instrumen Prodi Target
1. Login menggunakan akun tingkat Fakultas (GPM) atau Universitas (KPMA).
2. Buka menu **Data Form MONEV**.
3. Di pojok kanan atas, gunakan *dropdown* **"Fokus Program Studi"** untuk memilih prodi mana yang ingin diaudit.
4. Perhatikan kolom **"Status Verifikasi"** di dalam tabel. Kolom ini memandu Anda untuk mengetahui instrumen mana yang belum Anda sentuh sama sekali (*"Belum diverifikasi"*).

### 2. Melakukan Verifikasi Dokumen (Desk Evaluation)
1. Klik tombol **"Buka Form"** pada instrumen yang ingin diaudit.
2. Anda akan melihat jawaban yang sebelumnya diinput oleh Prodi. 
3. Klik tombol **📄 View File** pada kolom bukti untuk membuka/mengunduh dokumen yang dilampirkan Prodi.
4. Berdasarkan kualitas dokumen tersebut, isi form audit di bagian kanan:
   - **Kesesuaian Bukti:** Pilih **Ya** (jika dokumen sah dan membuktikan klaim Prodi) atau **Tidak** (jika dokumen salah/tidak relevan).
   - **Catatan Auditor:** Tuliskan rekomendasi, temuan, atau alasan mengapa dokumen ditolak.

### 3. Menyimpan dan Memantau Hasil Audit
1. Klik tombol **Simpan Data**.
2. Pada halaman Tabel Instrumen, perhatikan kolom **Status Verifikasi**:
   - Bar **Verifikasi Auditor** akan naik sesuai dengan jumlah butir yang sudah Anda audit (diberi status Ya/Tidak).
   - Akan muncul *badge* **Skor Sementara**. Skor ini menunjukkan persentase jawaban **Ya (Sesuai)** dari Auditor dibandingkan total seluruh pertanyaan di instrumen tersebut. 
   - Skor ini berwarna Hijau jika baik (≥ 80%), Kuning jika cukup (50-79%), dan Merah jika kritis (< 50%).

---

## Ringkasan Indikator Keberhasilan (Tabel MONEV)

Bagi pimpinan, sekilas melihat tabel MONEV sudah bisa memberikan kesimpulan:
- Jika bar di kolom **Progres Prodi** masih merah/kuning, berarti Prodi lambat atau belum tuntas melakukan pengisian (mungkin lupa unggah dokumen atau lupa mengisi keterangan).
- Jika bar **Verifikasi Auditor** belum 100%, berarti proses audit (Desk Evaluation) dari KPMA/GPM masih berlangsung.
- Jika semua bar penuh 100%, **Skor Sementara** yang tertera sudah bisa dianggap sebagai nilai final dari instrumen tersebut.

---

## TAHAP Tambahan: Manajemen Hak Akses Sistem (Role: KPMA)

Sebagai Super-Admin (KPMA), Anda memiliki kuasa penuh untuk mengatur menu apa saja yang boleh dilihat dan diakses oleh setiap kelompok pengguna (*Role*). Sistem ini bersifat dinamis (menggunakan *Role-Based Access Control / RBAC* matriks).

### Cara Mengatur Izin Menu
1. Login menggunakan akun **Admin (KPMA)**.
2. Perhatikan bagian bawah Sidebar, pilih grup **KONFIGURASI** -> klik menu **Hak Akses (RBAC)**.
3. Anda akan melihat halaman tabel matriks di mana **baris** adalah daftar seluruh Menu/Modul di aplikasi, dan **kolom** adalah Role (GPM, GKM, dll).
4. Untuk **memberikan akses**: Ceklis (*centang*) kotak pada pertemuan baris menu dan kolom Role yang diinginkan.
5. Untuk **mencabut akses**: Hilangkan centang pada kotak tersebut.
6. Klik tombol **Simpan Konfigurasi** berwarna biru di pojok kanan atas.

*(Catatan: Akses untuk Role **KPMA** selalu aktif secara permanen untuk melindungi Admin agar tidak kehilangan akses sistem).*
