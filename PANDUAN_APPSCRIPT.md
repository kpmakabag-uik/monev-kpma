# Panduan Menghubungkan Google Drive via Apps Script (Super Mudah)

Anda tidak perlu masuk ke Google Cloud Console berbayar. Cukup gunakan fitur **Google Apps Script** bawaan gratis dari akun Google Anda. Aplikasi SiMONEV akan mengirimkan file ke Script ini, lalu Script ini akan menyusun folder dan menyimpan filenya di Drive Anda.

Ikuti 3 langkah mudah di bawah ini:

---

## LAKAH 1: Membuat Script Penerima
1. Buka browser dan kunjungi: [script.google.com](https://script.google.com/)
2. Pastikan Anda sudah login menggunakan akun Gmail/Google yang ingin dijadikan tempat penyimpanan file (15GB gratis).
3. Klik tombol **"New Project"** (Proyek Baru) di kiri atas.
4. Hapus semua kode bawaan (`function myFunction()...`) di editor tersebut.
5. **Salin (Copy)** seluruh kode di bawah ini, lalu **Tempel (Paste)** ke editor tersebut:

```javascript
function doPost(e) {
  try {
    // 1. Parsing data JSON dari aplikasi SiMONEV
    var data = JSON.parse(e.postData.contents);
    
    // ======== LOGIKA HAPUS FILE ========
    if (data.action === "delete" && data.fileUrl) {
      var fileId = "";
      // Metode 1: Cari ID di antara /d/ dan /
      if (data.fileUrl.indexOf("/d/") !== -1) {
        fileId = data.fileUrl.split("/d/")[1].split("/")[0].split("?")[0];
      } 
      // Metode 2: Cari parameter id= (untuk format open?id=...)
      else if (data.fileUrl.indexOf("id=") !== -1) {
        fileId = data.fileUrl.split("id=")[1].split("&")[0];
      }

      if (fileId) {
        var fileToDelete = DriveApp.getFileById(fileId);
        fileToDelete.setTrashed(true); // Memindahkan file ke sampah (Trash)
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "File " + fileId + " berhasil dihapus"
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("ID File tidak ditemukan dalam URL: " + data.fileUrl);
      }
    }
    // ===================================
    
    // ======== LOGIKA UPLOAD FILE =======
    var fileName = data.fileName;
    var mimeType = data.mimeType;
    var base64Data = data.base64Data;
    var parentFolderName = data.parentFolder || "SiMONEV_Uploads";
    var subFolderName = data.subFolder || "Lainnya";
    
    // 2. Decode file
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    
    // 3. Cari atau buat Folder Utama (Fakultas / Regulasi)
    var parentFolder;
    var pFolders = DriveApp.getFoldersByName(parentFolderName);
    if (pFolders.hasNext()) {
      parentFolder = pFolders.next();
    } else {
      parentFolder = DriveApp.createFolder(parentFolderName);
    }
    
    // 4. Cari atau buat Sub-Folder (Prodi / Jenis Regulasi)
    var subFolder;
    var sFolders = parentFolder.getFoldersByName(subFolderName);
    if (sFolders.hasNext()) {
      subFolder = sFolders.next();
    } else {
      subFolder = parentFolder.createFolder(subFolderName);
    }
    
    // 5. Simpan File ke dalam Sub-Folder
    var file = subFolder.createFile(blob);
    
    // 6. Atur akses agar bisa dilihat (Viewer) oleh asesor dari aplikasi SiMONEV
    // Dibungkus try-catch agar tidak error jika akun Google Workspace membatasi
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingError) {
      // Abaikan error jika akses ditolak oleh aturan admin kampus/organisasi
      console.log("Sharing error: " + sharingError);
    }
    
    // 7. Kembalikan URL file ke aplikasi
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Jika ada error
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

6. Klik ikon 💾 (Save) di bagian atas, lalu beri nama proyek Anda (misalnya: "SiMONEV Drive Receiver").

---

## LAKAH 2: Mengaktifkan (Deploy) Script
Agar aplikasi SiMONEV bisa mengirim file ke Script ini, Anda harus mengaktifkannya ke publik.

1. Di pojok kanan atas, klik tombol biru **"Deploy"**, lalu pilih **"New deployment"**.
2. Di jendela yang muncul, pada tulisan "Select type" (klik ikon gerigi ⚙️), centang opsi **Web app**.
3. Isi kolom **Description** bebas (misal: "Versi 1").
4. Di bagian **Execute as**: Pilih **"Me (email.anda@gmail.com)"**.
5. Di bagian **Who has access**: Pilih **"Anyone"** (Sangat Penting! Jika tidak "Anyone", aplikasi SiMONEV akan ditolak masuk).
6. Klik tombol biru **"Deploy"**.
7. *Google mungkin akan meminta Anda memberi izin otorisasi. Klik "Authorize access" -> Pilih akun Google Anda -> Jika muncul peringatan keamanan (karena ini aplikasi buatan Anda sendiri), klik "Advanced" (Lanjutan) lalu klik "Go to SiMONEV Drive Receiver (unsafe)". Terakhir, klik "Allow" (Izinkan).*
8. Setelah berhasil, akan muncul **Web app URL**. URL ini berawalan `https://script.google.com/macros/s/.../exec`.
9. Klik tombol **"Copy"** di sebelah URL tersebut.

---

## LAKAH 3: Memasukkan URL ke Aplikasi SiMONEV
1. Kembali ke aplikasi SiMONEV Anda.
2. Login sebagai admin (KPMA).
3. Buka menu **MASTER DATA > Pengaturan MONEV**.
4. Di kartu **Pengaturan Upload Google Drive**, tempel (*paste*) URL Apps Script yang baru saja Anda copy ke dalam kolom yang tersedia.
5. Klik **Simpan Pengaturan**.

Selesai! Sekarang semua file bukti MONEV dan Dokumen Regulasi akan otomatis tertata rapi di Google Drive Anda di dalam folder berdasarkan nama Fakultas & Prodi.
