# Dokumentasi Fitur: Pemantauan Progres Pengisian Instrumen MONEV

Dokumen ini merangkum perubahan dan penambahan fitur pada tabel **Data Form MONEV** (`InstrumentTable.tsx` dan `page.tsx`), yang bertujuan untuk memberikan kemudahan bagi Prodi dan Auditor dalam memantau sejauh mana proses evaluasi telah berjalan.

## Perubahan yang Dilakukan

Kami merombak tampilan tabel daftar instrumen dengan menambahkan dua kolom pemantauan utama: **Progres Prodi** dan **Status Verifikasi**.

### 1. Kolom "Progres Prodi"
Kolom ini memiliki tiga bar indikator progres yang dihitung secara dinamis berdasarkan data evaluasi (Monev Record) siklus aktif:

- **Pengisian:** 
  Mengukur berapa banyak butir pertanyaan yang sudah direspons ("Ya" / "Tidak") dibandingkan dengan total butir pertanyaan di instrumen tersebut.
  
- **Keterangan / Temuan:**
  Mengukur kualitas pengisian kolom Keterangan (Evaluasi Diri). Sistem menerapkan logika validasi cerdas (heuristik) untuk menolak isian asal-asalan. Keterangan hanya akan dihitung valid (menambah progres) jika:
  - Teks tidak kosong dan bukan hanya tanda strip (`"-"`).
  - Teks bukan sekadar tulisan `"tidak ada"`.
  - Panjang teks minimal 10 karakter.
  - Teks terdiri dari minimal 3 kata (mendorong penyusunan kalimat yang baik).
  - Teks memiliki variasi huruf yang cukup (mencegah *spam* seperti `"aaaaa"` atau `"jfkadjfkadjf"`).

- **Bukti Terunggah:**
  Bar ini hanya muncul jika ada minimal 1 butir yang dijawab "Ya". Bar ini mengukur berapa banyak dokumen bukti yang berhasil diunggah khusus untuk butir-butir yang diklaim "Ya" oleh Prodi.

### 2. Kolom "Status Verifikasi"
Kolom ini ditujukan untuk memantau progres kerja Auditor (KPMA / GPM):

- **Verifikasi Auditor:**
  Mengukur berapa banyak butir yang sudah dinilai silang (diisi kolom Kesesuaian Buktinya) oleh Auditor, terlepas dari apakah hasilnya Sesuai atau Tidak Sesuai.

- **Skor Sementara:**
  Ditampilkan dalam bentuk *badge*. Menghitung persentase butir yang dinilai **"Ya" (Sesuai)** oleh auditor dibandingkan dengan total seluruh butir instrumen. 

> **Catatan UX:** Jika instrumen sama sekali belum disentuh oleh Auditor, baris ini akan menampilkan teks *"Belum diverifikasi"* (kecuali jika *user* yang *login* memiliki peran sebagai Auditor, maka bar verifikasi tetap muncul di angka 0%).

## Berkas Kode Terkait
- `src/app/(main)/monev/page.tsx`: 
  Berisi logika *parsing* jawaban JSON (`decryptedAnswers`) untuk menghitung statistik progres (`totalKlaimYa`, `uploadedBukti`, `filledKeterangan`, `verifiedItems`, `sesuaiItems`) dan *helper* fungsi heuristik untuk validasi teks keterangan.
- `src/app/(main)/monev/InstrumentTable.tsx`: 
  Berisi komponen antarmuka tabel. Menerapkan *layout* bertingkat (bar bersusun) dengan pewarnaan dinamis (merah/kuning/hijau) berdasarkan persentase capaian target.
