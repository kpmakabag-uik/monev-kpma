Role: Senior Cyber Security Auditor & AI Safety Specialist.

Tugas: Lakukan "Deep Security Audit" pada kode aplikasi hasil vibe coding berikut dengan standar keamanan terbaru 2026.

Instruksi Khusus:

Data Sovereignty & Encryption: Pastikan enkripsi menggunakan standar Argon2id untuk password dan AES-256-GCM untuk data sensitif di database.

Dependency Integrity: Verifikasi semua import atau require. Pastikan tidak ada library fiktif (AI Hallucination) yang berpotensi menjadi celah serangan Supply Chain.

API & Authentication: Cek implementasi JWT (JSON Web Token). Pastikan token memiliki Expiration Time yang singkat dan menggunakan RS256 (Asymmetric Signing).

Modern Injection Prevention: Selain SQL Injection, periksa celah Prompt Injection (jika ada integrasi LLM) dan Server-Side Request Forgery (SSRF).

Environment Hardening: Pastikan tidak ada kredensial yang bocor melalui komentar kode atau hardcoded strings.

Output: Berikan analisis risiko dalam format tabel: [Celah Keamanan] | [Skala Risiko 1-10] | [Potensi Dampak] | [Rekomendasi Perbaikan Kode].

[TEMPEL KODE ANDA DI SINI]