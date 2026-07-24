# Panduan Mendapatkan Kredensial Google Drive API

Untuk mengaktifkan fitur unggah (upload) file bukti secara otomatis ke Google Drive, Anda perlu mengatur Google Cloud Service Account. Service Account bertindak layaknya "robot" yang akan mengelola folder dan file di Drive Anda tanpa perlu login berulang kali.

Ikuti 3 tahapan utama di bawah ini:

---

## TAHAP 1: Membuat Service Account di Google Cloud
1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan login dengan akun Google Anda.
2. Klik *dropdown* nama project di kiri atas (di sebelah logo Google Cloud), lalu klik **"New Project"**.
3. Beri nama project Anda (misal: "Simonev Drive") dan klik **Create**. Tunggu beberapa saat hingga project selesai dibuat.
4. Pastikan project yang baru Anda buat sudah terpilih (aktif) di kiri atas.
5. Di kotak pencarian atas, ketik **"Google Drive API"**, pilih hasilnya dari daftar, lalu klik tombol **"Enable"**.
6. Setelah aktif, buka menu navigasi (garis tiga di pojok kiri atas) -> **IAM & Admin** -> **Service Accounts**.
7. Klik **"+ Create Service Account"** di deretan menu atas. 
8. Beri nama (misal: "Simonev Uploader") lalu klik **Create and Continue**, dan klik **Done**.

---

## TAHAP 2: Mendapatkan Private Key (File JSON)
1. Di halaman Service Accounts yang sama, Anda akan melihat email baru yang baru saja dibuat (berakhiran `@...iam.gserviceaccount.com`). **Klik email tersebut**.
2. Masuk ke tab **"Keys"**.
3. Klik tombol **"Add Key"** -> **"Create new key"**.
4. Pilih format **JSON** lalu klik **Create**.
5. File `.json` akan otomatis terunduh ke komputer Anda. Buka file tersebut menggunakan **Notepad** (Klik kanan file -> Open With -> Notepad).
6. Di dalamnya, Anda akan melihat baris kode. Salin (copy) dua informasi penting berikut:
   - Salin isi dari `"client_email": "..."`
   - Salin seluruh isi `"private_key": "..."` *(Mulai dari tulisan `-----BEGIN PRIVATE KEY-----` sampai dengan `-----END PRIVATE KEY-----\n`)*.

---

## TAHAP 3: Mengatur Folder Induk di Google Drive Anda
1. Buka [Google Drive](https://drive.google.com) biasa Anda.
2. Buat satu folder kosong baru (misal dinamakan: "Berkas Bukti MONEV"). Di dalam folder inilah semua folder Fakultas dan Prodi nantinya akan dibuat secara otomatis.
3. Klik kanan pada folder tersebut -> **Share (Bagikan)**.
4. Di kolom input email, **masukkan (paste) email dari Service Account (`client_email`)** yang tadi Anda dapatkan di Tahap 2. 
5. Beri peran (role) sebagai **Editor**, lalu klik **Send/Share**. *(Langkah ini memberi izin kepada "robot" aplikasi untuk mengedit dan mengisi folder tersebut).*
6. Buka (masuk ke dalam) folder tersebut.
7. Lihat bilah alamat URL di browser Anda. URL-nya akan tampak seperti ini: 
   `https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0j...`
8. Salin **teks acak** yang berada persis setelah teks `/folders/`. Teks acak inilah yang disebut dengan **Folder ID**.

---

## PENYELESAIAN: Memasukkan ke Aplikasi SiMONEV
1. Login ke aplikasi SiMONEV menggunakan akun `admin` (Role KPMA).
2. Pergi ke menu **Master Data -> Pengaturan**.
3. Di kartu **Google Drive API Credentials**, masukkan:
   - **Service Account Client Email:** (Tempel `client_email` dari Notepad)
   - **Service Account Private Key:** (Tempel `private_key` dari Notepad)
   - **Folder Induk ID:** (Tempel `Folder ID` dari Google Drive)
4. Klik **Simpan Semua Pengaturan**.

Selamat! Aplikasi SiMONEV sekarang sudah sepenuhnya terhubung dengan Google Drive Anda. Setiap kali tim GKM mengunggah file bukti, file tersebut akan langsung masuk dan tertata rapi di folder Google Drive Anda.
