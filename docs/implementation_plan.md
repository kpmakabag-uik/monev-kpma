# Master Rencana Implementasi Sistem Monev Terpadu

Dokumen ini merupakan **Cetak Biru (Blueprint) Keseluruhan** untuk pengembangan sistem Monev KPMA tahap selanjutnya. Rencana ini mencakup 4 fitur utama yang akan mengubah sistem menjadi lebih otomatis, transparan, dan dapat dipertanggungjawabkan.

---

## 1. Ringkasan Fitur yang Akan Diimplementasikan

1.  **Hide/Unhide Analisis KPMA:** Hasil analisis (Executive Summary & Tabel) dari KPMA bisa disimpan sebagai *Draft* (tersembunyi) dan baru dimunculkan ke Prodi setelah dipublikasikan beserta tanggal rilisnya.
2.  **Manajemen Periode & Batas Waktu (Due Date):** Pengisian Monev dibatasi oleh rentang waktu tertentu. Jika melewati batas akhir (*due date*), form Prodi akan otomatis terkunci (*Auto-Lock*).
3.  **Sistem Pengingat Otomatis (Reminder):** Sistem akan mengirimkan pesan otomatis ke WA/Email PIC Prodi beberapa hari sebelum batas waktu (H-7, H-3) bagi yang belum selesai 100%.
4.  **Copy Data Terverifikasi (Kombinasi Solusi 1, 2, & 4):** Prodi dapat menyalin data dari periode sebelumnya. Untuk menghindari asal salin (*Lazy Copy*), sistem menerapkan pemisahan data Statis/Dinamis, memberikan peringatan visual pada data salinan, dan mewajibkan Pakta Integritas sebelum *submit* final.

---

## 2. Perubahan Skema Database (Prisma)

Untuk mendukung keempat fitur di atas, berikut adalah perubahan yang akan dilakukan pada `prisma/schema.prisma`:

### A. Modifikasi `User` (Untuk Reminder)
Menambahkan informasi kontak PIC agar notifikasi bisa dikirim.
```prisma
model User {
  // ... field yang sudah ada ...
  picPhone      String?   // Nomor WhatsApp PIC
}
```

### B. Modifikasi `Cycle` (Untuk Batas Waktu)
Tabel periode yang sudah ada (`Cycle`) akan ditambahkan rentang waktunya.
```prisma
model Cycle {
  // ... field yang sudah ada ...
  startDate      DateTime? // Tanggal mulai pengisian
  endDate        DateTime? // Tanggal batas waktu (Due Date)
}
```

### C. Tabel Baru `MonevSubmission` (Untuk Status Final & Pakta Integritas)
```prisma
model MonevSubmission {
  id               String   @id @default(cuid())
  prodiId          String
  tahun_akademik   String
  semester         String
  
  // Status Pengisian
  isSubmitted      Boolean  @default(false)
  submittedAt      DateTime?
  
  // Pakta Integritas (Kombinasi Solusi 4)
  agreedToPact     Boolean  @default(false)
  pactAgreedAt     DateTime?
  pactAgreedBy     String?  // Nama/ID PIC yang menceklis
  
  prodi            Prodi    @relation(fields: [prodiId], references: [id])
  @@unique([prodiId, tahun_akademik, semester])
}
```

### D. Modifikasi `MonevRecord` (Untuk Hide/Unhide Analisis)
Menambahkan status rilis untuk analisis dari KPMA.
```prisma
model MonevRecord {
  // ... field yang sudah ada (analisa_kpma, dll) ...
  isAnalysisPublished Boolean   @default(false) // Toggle Hide/Unhide
  analysisPublishedAt DateTime?                 // Tanggal KPMA merilis analisis
}
```

### E. Modifikasi Struktur JSON (Untuk Salin Data & Validasi)
Sistem menggunakan tipe data JSON, sehingga strukturnya perlu disesuaikan:
*   **JSON `Instrument.questions`:** Ditambahkan `"isStatic": true` agar sistem tahu mana pertanyaan yang boleh disalin otomatis dan mana yang tidak (Dinamis).
*   **JSON `MonevRecord.answers`:** Ditambahkan *flag* `"isCopied": true` dan `"isConfirmed": false` untuk melacak jawaban yang disalin namun belum direview oleh Prodi.

---

## 3. Perubahan Antarmuka (UI/UX) dan Alur Kerja

### A. Di Sisi Prodi
1.  **Dashboard Utama:** Akan muncul **Banner Hitung Mundur** batas waktu pengisian. Jika melewati batas waktu, seluruh tombol form akan di-*disable* (Terkunci).
2.  **Tampilan Hasil Analisis KPMA:** Pada halaman laporan, jika `isAnalysisPublished == false`, blok hasil analisis tidak akan muncul (atau tertulis *"Sedang Diproses"*). Jika `true`, analisis akan muncul beserta Cap Tanggal.
3.  **Proses Pengisian Monev (Copy Data):**
    *   Terdapat tombol besar *"Salin Data dari Siklus Sebelumnya"*.
    *   Jika ditekan, pertanyaan statis akan terisi otomatis dengan warna **latar kuning** (menandakan *"Data Salinan - Belum Divalidasi"*).
    *   Prodi **WAJIB** menekan tombol konfirmasi di setiap kotak kuning tersebut, atau merubah isinya agar warna kuning hilang.
4.  **Finalisasi (Pakta Integritas):** Jika pengisian sudah 100% dan tidak ada lagi kotak kuning, muncul *Pop-up Checkbox* Pernyataan Integritas sebelum Prodi dapat menekan *"Kirim Data Final"*.

### B. Di Sisi KPMA (Admin)
1.  **Master Instrumen:** KPMA akan melihat opsi ceklis *Checkbox* `"Jadikan Pertanyaan Statis"` saat membuat pertanyaan baru.
2.  **Master Siklus:** KPMA bisa menentukan *Start Date* dan *End Date*.
3.  **Halaman Analisis KPMA:** KPMA akan memiliki tombol *Toggle*: *"Sembunyikan dari Prodi (Draft)"* atau *"Publikasikan Analisis"*.

---

## 4. Infrastruktur Tambahan (Background Jobs)

Fitur pengingat (Reminder) membutuhkan proses yang berjalan otomatis di belakang layar:
*   **Cron Job (Scheduler):** Sistem akan dijadwalkan (misal: setiap jam 08:00 pagi) untuk mengecek database tabel `Cycle` dan `MonevSubmission`.
*   **Logic:** *"Cari Cycle yang akan jatuh tempo dalam 7 hari. Cari prodi yang isSubmitted = false. Kirim pesan WA ke `picPhone` Prodi tersebut."*
*   **Integrasi:** Dibutuhkan API Gateway WhatsApp pihak ketiga (seperti Fonnte, Watzap, atau implementasi *Baileys library* di server) untuk dapat mengirim pesan WhatsApp secara otomatis.

---

## 5. Pembuatan "Resume Hasil Monitoring & Evaluasi (Monev) Internal" (Laporan Eksekutif)

Berdasarkan analisis struktur database saat ini, pembuatan laporan ringkasan berformat infografis (seperti pada referensi gambar) **sangat memungkinkan untuk dilakukan**.

### Analisis Ketersediaan Data:
1.  **Total Indikator Dinilai:** Dapat dihitung dari total seluruh pertanyaan (JSON `questions`) pada tabel `Instrument` yang berelasi dengan Prodi pada siklus tersebut.
2.  **Kesenjangan Klaim Prodi vs Bukti Terverifikasi:** 
    *   **Klaim "Ya":** Dapat dihitung dari jawaban prodi (JSON `answers` di `MonevRecord`) di mana `pilihan === "Ya"`.
    *   **Terverifikasi Auditor:** Dapat dihitung dari `kesesuaianBukti === "Sesuai"` (atau verifikasi serupa oleh auditor) di dalam `answers`.
3.  **Skor Kesesuaian per Klaster Mutu:** Dapat dikelompokkan berdasarkan atribut `category` (misal: "Sarana, Prasarana...", "Tata Kelola & SPMI") pada tabel `Instrument`.
4.  **Temuan Utama & Rekomendasi Prioritas:** Saat ini teks bebas (analisis & tindak lanjut) tersimpan per instrumen di `MonevRecord.analisa_kpma` dan `tindak_lanjut_kpma`. 

### Rencana Implementasi:
*   **Pembuatan Halaman Laporan Baru:** Membuat halaman `/laporan-eksekutif/[prodiId]` khusus yang mengagregasi seluruh `MonevRecord` dari satu Prodi dalam satu siklus.
*   **Komponen UI (Infografis):** Menggunakan library chart (misal: *Recharts* atau *Chart.js* untuk React) untuk membuat Donut Chart ("% Terverifikasi") dan Bar Chart bertumpuk ("Kesenjangan Klaim" dan "Klaster Mutu").
*   **Agregasi Temuan & Rekomendasi (Otomatis / Rule-Based):**
    Kita bisa membuat fungsi *Auto-Generate* (pembuatan otomatis) berdasarkan hasil kalkulasi data. Contoh logika otomatisasinya:
    *   *Temuan Utama 1:* "Dari [Total] butir indikator, hanya [Terverifikasi] butir ([Persen]%) yang terverifikasi."
    *   *Temuan Utama 2:* "Sebanyak [Gap] butir diklaim 'Ya' oleh Prodi namun belum ada bukti."
    *   *Temuan Utama 3:* Mendeteksi klaster mana yang nilainya 0% atau paling rendah, misal "Klaster [Nama Klaster] tercatat memiliki skor kesesuaian terendah."
    *   *Rekomendasi 1 (Quick Win):* "Percepat kelengkapan dokumen untuk [Gap] butir yang sudah diklaim 'Ya' agar skor naik menjadi [Max_Persen]%."
    *   *Rekomendasi 2:* "Fokus perbaikan pada klaster [Nama Klaster Terendah]."
    *   *Tambahan:* Jika ada catatan khusus yang ditulis manual di `analisa_kpma`, sistem akan melampirkannya sebagai poin tambahan.

### Status Persetujuan:
**[ MENUNGGU PERSETUJUAN ]** - Jika Anda setuju dengan skema Laporan Eksekutif Otomatis ini, kita akan langsung membuat:
1. Fungsi Kalkulasi Data (Persentase, Klaster, Gap)
2. Fungsi Auto-Generate Kalimat Temuan & Rekomendasi
3. UI Laporan (Chart & Layouting seperti referensi)

---

## 7. Pembuatan Laporan Eksekutif Tingkat Universitas (Untuk Rektor)

Selain laporan per Prodi, sistem akan menyediakan laporan gabungan seluruh program studi dalam satu siklus yang ditujukan untuk pimpinan (Rektor). Format laporan ini mengacu pada visualisasi tingkat universitas.

### Rencana Implementasi:

1. **Server Action Baru (`getUniversityExecutiveSummary`)**
   Membuat fungsi di `actions/report.ts` yang akan menarik seluruh data `MonevRecord` dari semua prodi pada siklus berjalan. Logikanya meliputi:
   - Menghitung **skor kesesuaian** (terverifikasi) dari masing-masing Prodi.
   - Mengelompokkan Prodi ke dalam 5 kategori:
     - Kritis (0-20%)
     - Kurang (21-40%)
     - Cukup (41-60%)
     - Baik (61-80%)
     - Sangat Baik (81-100%)
   - Menghitung **rata-rata skor universitas**.
   - Menghitung rerata skor per **Klaster Mutu** secara agregat antar seluruh prodi, serta menghitung jumlah prodi yang mencetak skor 0% di klaster tersebut.

2. **Auto-Generate Rekomendasi Strategis untuk Rektor**
   Sistem akan secara otomatis merumuskan rekomendasi berdasarkan agregat data. Contoh *rules* rekomendasi:
   - *Quick Win:* Menganalisis berapa besar kesenjangan klaim secara massal di level universitas.
   - *Intervensi:* Menyebutkan langsung jumlah prodi Kritis (<21%).
   - *Klaster Lemah:* Mengambil 3 klaster terbawah dan membuat poin rekomendasi untuk memperkuat area tersebut.
   - *Praktik Baik:* Mengambil 3 prodi dengan skor tertinggi sebagai *role model*.

3. **Pembuatan UI Laporan Eksekutif Universitas**
   Membuat *route* baru di `/laporan-eksekutif/universitas` dan komponen `UniversityReportView.tsx` dengan *layout* yang mirip dengan referensi:
   - Header gelap dengan statistik utama (Rata-rata skor, Total Prodi, Jumlah Prodi Kritis, Jumlah Prodi Kurang, dll).
   - Tabel peringkat seluruh prodi berdasarkan skor.
   - Bar Chart "Kesenjangan Sistemik Antar-Klaster Mutu".
   - Daftar Rekomendasi Strategis di kanan bawah.
   - Siap cetak PDF (*Print-friendly*).

### Status Persetujuan:
**[ MENUNGGU PERSETUJUAN ]** - Mohon konfirmasi Anda apakah rencana pembuatan Laporan Eksekutif Universitas (Agregat) ini dapat segera dikerjakan? Jika "Setuju", saya akan langsung membuat Task List dan mulai mengerjakannya.---

## 6. Integrasi Analisis "Syarat Perlu Akreditasi Unggul" (Berdasarkan Aturan LAM)

Saat ini, kriteria "Syarat Perlu Unggul" sangat bergantung pada Lembaga Akreditasi Mandiri (LAM) yang menaungi masing-masing Prodi (misal: LAM INFOKOM untuk Informatika, LAMEMBA untuk Ekonomi, dll). Sistem dapat dibuat cerdas untuk menganalisis ini secara otomatis sesuai LAM masing-masing prodi.

### Rencana Implementasi (Tahapan):

1. **Perubahan Skema Database (`Prodi` atau `Faculty`)**
   Menambahkan kolom `lamType` (Jenis LAM) pada tabel `Prodi` agar sistem tahu aturan mana yang harus dipakai.
   ```prisma
   model Prodi {
     // ...
     lamType String? @default("BAN-PT") // Contoh: LAM-INFOKOM, LAMEMBA, LAMSAMA, BAN-PT
   }
   ```

2. **Perubahan Struktur Data Instrumen (`questions`)**
   Saat ini pertanyaan (indikator) disimpan sebagai *Array of Strings*. Agar sistem tahu indikator mana yang merupakan "Syarat Perlu Unggul" untuk LAM tertentu, struktur JSON akan di- *upgrade* menjadi *Array of Objects*.
   *Dari:* `["Apakah lulusan tepat waktu?", ...]`
   *Menjadi:* 
   ```json
   [
     {
       "id": "q1",
       "text": "Apakah lulusan tepat waktu?",
       "syaratUnggulFor": ["BAN-PT", "LAM-INFOKOM"] 
     }
   ]
   ```

3. **Pembuatan Engine Kalkulasi (`actions/report.ts`)**
   Pada saat sistem me- *render* Laporan Eksekutif, sistem akan:
   - Mengecek `lamType` milik Prodi tersebut.
   - Memfilter (mencari) seluruh pertanyaan/indikator di instrumen yang *flag* `syaratUnggulFor`-nya cocok dengan `lamType` Prodi.
   - Mengecek apakah jawaban Prodi & hasil verifikasi Auditor (`kesesuaianBukti`) untuk butir-butir krusial tersebut bernilai "Sesuai".
   - Menghitung rasio pemenuhan (Misal: "Memenuhi 4 dari 5 Syarat Perlu Unggul LAM INFOKOM").

4. **Update UI Laporan Eksekutif**
   Menambahkan *Card* ke-3 di halaman Laporan Eksekutif yang secara spesifik menampilkan:
   **"[Terpenuhi] / [Total] Syarat Perlu Unggul (Standar {Nama LAM})"**

### Kebutuhan Review Pengguna (User Review):
> [!IMPORTANT]
> **Persetujuan Skema LAM:** 
> 1. Apakah Anda setuju dengan skema penambahan kolom `lamType` di tabel Prodi beserta penyesuaian struktur JSON instrumen?
> 2. Apakah aturan spesifik/kriteria Syarat Perlu Unggul untuk masing-masing LAM (seperti LAM INFOKOM, LAMDIK, dll) saat ini sudah tersedia di dalam butir-butir instrumen Monev KPMA yang ada, atau masih perlu ditambahkan/diperbarui nanti oleh tim KPMA?

---

## 7. Pembuatan Laporan Eksekutif Tingkat Universitas (Untuk Rektor)

Selain laporan per Prodi, sistem akan menyediakan laporan gabungan seluruh program studi dalam satu siklus yang ditujukan untuk pimpinan (Rektor). Format laporan ini mengacu pada visualisasi tingkat universitas.

### Rencana Implementasi:

1. **Server Action Baru (`getUniversityExecutiveSummary`)**
   Membuat fungsi di `actions/report.ts` yang akan menarik seluruh data `MonevRecord` dari semua prodi pada siklus berjalan. Logikanya meliputi:
   - Menghitung **skor kesesuaian** (terverifikasi) dari masing-masing Prodi.
   - Mengelompokkan Prodi ke dalam 5 kategori:
     - Kritis (0-20%)
     - Kurang (21-40%)
     - Cukup (41-60%)
     - Baik (61-80%)
     - Sangat Baik (81-100%)
   - Menghitung **rata-rata skor universitas**.
   - Menghitung rerata skor per **Klaster Mutu** secara agregat antar seluruh prodi, serta menghitung jumlah prodi yang mencetak skor 0% di klaster tersebut.

2. **Auto-Generate Rekomendasi Strategis untuk Rektor**
   Sistem akan secara otomatis merumuskan rekomendasi berdasarkan agregat data. Contoh *rules* rekomendasi:
   - *Quick Win:* Menganalisis berapa besar kesenjangan klaim secara massal di level universitas.
   - *Intervensi:* Menyebutkan langsung jumlah prodi Kritis (<21%).
   - *Klaster Lemah:* Mengambil 3 klaster terbawah dan membuat poin rekomendasi untuk memperkuat area tersebut.
   - *Praktik Baik:* Mengambil 3 prodi dengan skor tertinggi sebagai *role model*.

3. **Pembuatan UI Laporan Eksekutif Universitas**
   Membuat *route* baru di `/laporan-eksekutif/universitas` dan komponen `UniversityReportView.tsx` dengan *layout* yang mirip dengan referensi:
   - Header gelap dengan statistik utama (Rata-rata skor, Total Prodi, Jumlah Prodi Kritis, Jumlah Prodi Kurang, dll).
   - Tabel peringkat seluruh prodi berdasarkan skor.
   - Bar Chart "Kesenjangan Sistemik Antar-Klaster Mutu".
   - Daftar Rekomendasi Strategis di kanan bawah.
   - Siap cetak PDF (*Print-friendly*).

### Status Persetujuan:
**[ MENUNGGU PERSETUJUAN ]** - Mohon konfirmasi Anda apakah rencana pembuatan Laporan Eksekutif Universitas (Agregat) ini dapat segera dikerjakan? Jika "Setuju", saya akan langsung membuat Task List dan mulai mengerjakannya.
