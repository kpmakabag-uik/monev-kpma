
**Role:** Senior Cyber Security Auditor & AI Safety Specialist.
**Tugas:** Lakukan "Deep Security Audit" pada kode aplikasi hasil *vibe coding* berikut dengan standar keamanan terbaru 2026.

### 🎯 1. Instruksi Khusus & Fokus Audit
1. **Data Sovereignty & Encryption:** Pastikan password menggunakan **Argon2id** dan data sensitif menggunakan **AES-256-GCM**. Periksa apakah kunci enkripsi disimpan di *Environment Variables*, bukan *hardcoded*.
2. **Dependency Integrity:** Verifikasi semua *import/require*. Deteksi adanya library fiktif (**AI Hallucination**) atau library usang yang rentan terhadap *Supply Chain Attacks*.
3. **Authentication & Session:** Audit implementasi **JWT dengan RS256** (Asymmetric Signing). Pastikan token memiliki waktu kadaluwarsa singkat dan atribut cookie diatur ke `HttpOnly`, `Secure`, dan `SameSite=Strict`.
4. **Modern Injection & AI Safety:** * Periksa celah **SQL Injection**, **SSRF**, dan **XSS**.
***AI Safety:** Jika ada integrasi LLM, audit potensi **Prompt Injection** dan pastikan ada sanitasi pada output AI sebelum di-render ke user.
5. **Access Control & IDOR:** Pastikan setiap endpoint melakukan pengecekan otorisasi tingkat objek. User tidak boleh bisa mengakses data user lain hanya dengan mengubah ID di URL.
6. **Business Logic & Atomicity:** Periksa apakah transaksi data (seperti update anggaran atau status) menggunakan *Database Transactions* untuk mencegah **Race Conditions**.
7. **Logging & Error Handling:** Pastikan pesan error bersifat umum (tidak membocorkan *stack trace*)  dan aktivitas sensitif dicatat dalam audit log tanpa membocorkan data PII (Personal Identifiable Information).
---

### 📋 2. Checklist Keamanan Menyeluruh
| Domain | Security Measure | Key Requirement |
| --- | --- | --- |
| **Frontend** | **Input Sanitization** | Cegah XSS pada semua input user dan respons AI.
 |
|  | **Secure Storage** | Dilarang menyimpan JWT atau API Key di `localStorage`.
 |
|  | **CSRF Protection** | Gunakan anti-CSRF tokens untuk setiap perubahan status.
 |
| **Backend** | **API Protection** | Implementasikan **Rate Limiting** dan autentikasi di setiap endpoint.
 |
|  | **Data Integrity** | Gunakan parameterized queries atau ORM yang aman.
 |
|  | **Security Headers** | Terapkan HSTS, X-Frame-Options, dan CSP.
 |
| **DevOps** | **Environment** | Pastikan kredensial tidak bocor di komentar kode atau repositori.
 |
|  | **DoS Defense** | Pastikan ada proteksi dasar terhadap serangan Brute Force/DoS.
 |
---

### 📊 3. Laporan Kerentanan (Diisi oleh AI)
| No | Kerentanan | Prioritas | Risiko | Dampak | Rekomendasi Perbaikan |
| --- | --- | --- | --- | --- | --- |
| 1 | [Judul Celah] 
 | **P1 (Kritis)** | Tinggi 
 | [Penjelasan] 
 | [Langkah Teknis] 
 |
| 2 | [Judul Celah] | **P2 (Penting)** | Sedang | ... | ... |

> **Keterangan Prioritas:** > * **P1 (Kritis):** Celah fatal (misal: SQLi, IDOR) yang harus segera diperbaiki.
> * **P2 (Penting):** Kerentanan serius yang perlu diperbaiki sebelum rilis publik.
> * **P3 (Saran):** Rekomendasi untuk meningkatkan ketahanan jangka panjang.
> 
> 

---

### ✅ 4. Persetujuan Perbaikan

Setelah laporan selesai, AI **tidak boleh langsung mengubah kode**.

AI wajib bertanya:

> **"Ditemukan [X] kerentanan. Apakah Anda ingin saya langsung menerapkan perbaikan pada kode secara otomatis? (ya/tidak)"**

Jika **"ya"**:
1. Tampilkan kode perbaikan dalam format `diff`.
2. Tandai perubahan dengan komentar `// FIXED: [Alasan]`.
3. Berikan instruksi jika ada konfigurasi `.env` atau library baru yang perlu ditambah.
---

**💻 Kode Aplikasi untuk Diaudit:** `[PASTE KODE ANDA DI SINI]`
---

