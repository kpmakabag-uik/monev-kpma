import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const instruments = [
    {
      id: "RP-12",
      jenjang_peruntukan: "S1",
      category: "Relevansi Pendidikan",
      name: "Efektivitas Kinerja & Prestasi Mahasiswa",
      questions: [
        "Apakah rerata persentase penurunan lulusan (Re-PL) dalam 3 tahun terakhir ≤ 15%? (LKPS Tabel 2-I.7 Profil Jumlah Lulusan)",
        "Apakah Kelulusan 1× masa tempuh kurikulum Sarjana (PK1MTK) ≥ 45%? [Mahasiswa masuk TS-3, lulus s.d. TS; masa studi 3,5 ≤ MS ≤ 6 tahun] (LKPS Tabel 2-I.8d)",
        "Apakah Kelulusan 2× masa tempuh kurikulum Sarjana (PK2MTK) ≥ 75%? [Mahasiswa masuk TS-6, lulus s.d. TS; masa studi 6 ≤ MS ≤ 8 tahun] (LKPS Tabel 2-I.8d)",
        "Apakah persentase keterlibatan mahasiswa aktif dalam meraih prestasi (RPMP) ≥ 1%? [Prestasi tingkat wilayah/nasional/internasional, peringkat 1-3] (LKPS Tabel 2-I.12)",
        "Apakah rumusan CPL sesuai dengan profil lulusan yang kompeten dalam ranah keilmuan prodi?",
        "Apakah CPL selaras dengan KKNI level 6 and kebutuhan kompetensi DUDIK?",
        "Apakah pengukuran CPL dilakukan dengan metode yang tepat mencakup ranah sikap, pengetahuan, kecakapan umum/khusus, and kemampuan kerja?",
        "Apakah hasil pengukuran CPL ditindaklanjuti untuk perbaikan standar masukan and proses?",
        "Apakah capaian CPL dalam 3 tahun berturut-turut menunjukkan kategori 'sangat kompeten'? (Syarat Perlu Unggul)"
      ]
    },
    {
      id: "RP-13",
      jenjang_peruntukan: "Semua",
      category: "Relevansi Pendidikan",
      name: "Pendidikan Anti Korupsi",
      questions: [
        "Apakah terdapat internalisasi pendidikan anti korupsi dalam pembelajaran program studi?",
        "Apakah PAK disisipkan/diintegrasikan sekurang-kurangnya pada 10 sks (MKWU atau matakuliah relevan)?",
        "Apakah terdapat dokumentasi pelaksanaan PAK (modul, RPS, laporan)?"
      ]
    },
    {
      id: "RP-14",
      jenjang_peruntukan: "Semua",
      category: "Relevansi Pendidikan",
      name: "Pengakuan & Kepuasan Pengguna Lulusan",
      questions: [
        "Apakah lulusan mendapatkan pengakuan/sertifikasi profesional dalam 3 tahun terakhir? (Min. 3 pengakuan nasional atau 1 tingkat internasional – sesuai fokus diferensiasi misi)",
        "Apakah pengakuan/sertifikasi tersebut dari instansi atau lembaga yang berkompeten di tingkat lokal, nasional, atau internasional?",
        "Apakah survey kepuasan pengguna lulusan dilaksanakan dengan instrumen yang sahih dan andal?",
        "Apakah data survey kepuasan dilaksanakan secara berkala dan representatif (lulusan TS-1 s.d. TS-3)?",
        "Apakah hasil survey kepuasan dianalisis dan digunakan untuk perbaikan kurikulum berkelanjutan?",
        "Apakah tingkat kepuasan pengguna lulusan pada aspek: etika, kompetensi, bahasa asing, TI, komunikasi, kerjasama, pengembangan diri ≥ Baik?"
      ]
    },
    {
      id: "RP-15",
      jenjang_peruntukan: "S1",
      category: "Relevansi Pendidikan",
      name: "Daya Tarik Prodi & Keterserapan Lulusan",
      questions: [
        "Apakah rerata persentase penurunan mahasiswa baru Sarjana (RPPM) dalam 5 tahun terakhir ≤ 15%? (LKPS Tabel 2-I.9 Trend Jumlah Mahasiswa Baru)",
        "Apakah persentase lulusan yang terserap lapangan kerja / melanjutkan pendidikan / berwirausaha dalam ≤ 1 tahun setelah lulus (PLTLK) ≥ 40%? [Mengacu pada lulusan tahun TS-2] (LKPS Tabel 2-I.11 Waktu Tunggu Lulusan)",
        "Apakah terdapat bukti tracer study yang valid dan representatif untuk mengukur keterserapan lulusan?",
        "Apakah hasil tracer study digunakan untuk perbaikan kurikulum dan layanan kemahasiswaan?",
        "Apakah tren penerimaan mahasiswa baru dalam 5 tahun menunjukkan stabilitas atau pertumbuhan?"
      ]
    },
    {
      id: "RP-015",
      jenjang_peruntukan: "S2",
      category: "Relevansi Pendidikan",
      name: "Daya Tarik Prodi & Keterserapan Lulusan",
      questions: [
        "Apakah jumlah mahasiswa aktif (NMA) dalam 3 tahun terakhir ≥ 15 orang per tahun? (LKPS Tabel 2-I.9)",
        "Apakah Rerata Persentase Publikasi Ilmiah Internasional bereputasi, internasional, dan nasional DPR (PPID) ≥ 30%?",
        "Apakah Rerata Persentase Karya Ilmiah DPR yang digunakan masyarakat/industri (RPKID) ≥ 30%? (Syarat Perlu Unggul)",
        "Apakah tren penerimaan mahasiswa baru dalam 3 tahun menunjukkan stabilitas atau peningkatan?"
      ]
    },
    {
      id: "RP-0015",
      jenjang_peruntukan: "S3",
      category: "Relevansi Pendidikan",
      name: "Daya Tarik Prodi & Keterserapan Lulusan",
      questions: [
        "Apakah jumlah mahasiswa aktif (NMA) dalam 3 tahun terakhir ≥ 15 orang per tahun? (LKPS Tabel 2-I.9)",
        "Apakah Rerata Persentase Publikasi Ilmiah Internasional bereputasi, internasional, dan nasional DPR (PPID) ≥ 60%?",
        "Apakah Rerata Persentase Karya Ilmiah DPR yang digunakan masyarakat/industri (RPKID) ≥ 40%? (Syarat Perlu Unggul)",
        "Apakah tren penerimaan mahasiswa baru dalam 3 tahun menunjukkan stabilitas atau peningkatan?"
      ]
    },
    {
      id: "RR-16",
      jenjang_peruntukan: "Semua",
      category: "Relevansi Penelitian",
      name: "Penugasan & Standar Masukan Penelitian",
      questions: [
        "Apakah terdapat peta jalan (roadmap) penelitian yang memayungi tema penelitian dosen dan mahasiswa?",
        "Apakah roadmap penelitian mengacu pada visi keilmuan prodi and fokus diferensiasi misi PT serta target berdampak?",
        "Apakah dosen dan mahasiswa melaksanakan penelitian sesuai agenda yang merujuk pada roadmap?",
        "Apakah evaluasi kesesuaian penelitian dengan roadmap dilakukan dan hasilnya digunakan untuk perbaikan?",
        "Apakah UPPS menyediakan akses memadai terhadap sarana, prasarana, and pembiayaan penelitian?",
        "Apakah terdapat penugasan and peningkatan kompetensi dosen dalam penelitian secara terstruktur?",
        "Apakah terdapat sistem TIK untuk mendokumentasikan, mengevaluasi, melaporkan, and menyebarluaskan hasil penelitian?",
        "Apakah standar masukan penelitian mempertimbangkan diferensiasi misi PT and target berdampak?",
        "Apakah sistem TIK penelitian mendukung dokumentasi and evaluasi penelitian?",
        "Apakah sistem TIK mendukung penyebarluasan hasil penelitian?"
      ]
    },
    {
      id: "RR-17",
      jenjang_peruntukan: "Semua",
      category: "Relevansi Penelitian",
      name: "Pelaksanaan Penelitian & Integrasi Kurikulum",
      questions: [
        "Apakah terdapat bukti sahih pelaksanaan penelitian yang melibatkan mahasiswa dalam 3 tahun terakhir?",
        "Apakah mahasiswa yang terlibat dalam penelitian dosen dapat menerima satuan kredit semester (SKS)?",
        "Apakah penelitian yang melibatkan mahasiswa memenuhi kaidah and metode ilmiah sesuai otonomi keilmuan?",
        "Apakah ada perbaikan kualitas penelitian secara berkelanjutan?",
        "Apakah hasil penelitian diintegrasikan ke dalam kurikulum sebagai bahan kajian pengayaan berbasis riset?",
        "Apakah integrasi dilakukan secara konsisten and dievaluasi untuk pengembangan program studi?"
      ]
    },
    {
      id: "RR-18",
      jenjang_peruntukan: "Semua",
      category: "Relevansi Penelitian",
      name: "Luaran & Publikasi Penelitian DPR",
      questions: [
        "Apakah luaran penelitian mengadopsi lisensi terbuka and dapat diakses masyarakat?",
        "Apakah terdapat analisis keberlanjutan penelitian sesuai roadmap and realisasi dana penelitian?",
        "Apakah terdapat analisis ketercapaian luaran penelitian: a) publikasi, b) HKI, c) produk/jasa, d) Buku/Book Chapter?",
        "Apakah ketercapaian luaran sesuai dengan indikator kinerja and target yang ditetapkan PT?",
        "Apakah RLP (Rerata Luaran Publikasi) mencapai 100% dari seluruh DPR? RLP = (NA2+NA3+NA4+NB2+NB3) / NDPR × 100% [NA2=jurnal nasional SINTA 1-2; NA3=intl; NA4=intl bereputasi; NB2=seminar nasional; NB3=seminar intl bereputasi]",
        "Apakah terdapat publikasi di jurnal internasional bereputasi (Scopus/WoS) oleh DPR?",
        "Apakah terdapat publikasi di jurnal nasional terakreditasi SINTA 1/2 oleh DPR?",
        "Apakah terdapat presentasi di seminar internasional bereputasi oleh DPR?"
      ]
    },
    {
      id: "RR-19",
      jenjang_peruntukan: "S1",
      category: "Relevansi Penelitian",
      name: "Rekognisi & Sitasi Karya Ilmiah",
      questions: [
        "Apakah terdapat luaran penelitian berupa HKI: Paten/Paten Sederhana dari DPR bersama mahasiswa?",
        "Apakah terdapat luaran HKI lainnya: Hak Cipta, Desain Produk Industri, Perlindungan Varietas Tanaman, dll.?",
        "Apakah luaran penelitian menunjukkan adanya kolaborasi, sitasi, and rekognisi bidang keilmuan yang termanfaatkan DUDIK/masyarakat?",
        "Apakah DPR mendapat rekognisi: visiting professor, keynote/invited speaker, staf ahli nasional/internasional?",
        "Apakah DPR menjadi editor/mitra bestari jurnal nasional terakreditasi atau internasional bereputasi?",
        "Apakah DPR mendapat penghargaan atas prestasi/kinerja tingkat nasional/internasional?",
        "Apakah Rasio Rekognisi Dosen (RRD) mencapai 100% dari seluruh DPR? RRD = (NRD / NDPR) × 100% (LKPS Tabel 2-II.7)"
      ]
    },
    {
      id: "RR-019",
      jenjang_peruntukan: "S2",
      category: "Relevansi Penelitian",
      name: "Rekognisi & Sitasi Karya Ilmiah",
      questions: [
        "Apakah terdapat bukti kolaborasi, sitasi, and rekognisi bidang keilmuan DPR dalam 3 tahun terakhir?",
        "Apakah luaran penelitian termanfaatkan oleh DUDIK and masyarakat?",
        "Apakah Rasio Sitasi (RS) ≥ 100% dari seluruh DPR? RS = (NAS / NDPR) × 100% (LKPS Tabel 2-II.9)",
        "Apakah DPR mendapat rekognisi: visiting professor, keynote/invited speaker, staf ahli nasional/internasional?",
        "Apakah DPR menjadi editor/mitra bestari jurnal nasional terakreditasi atau internasional bereputasi?",
        "Apakah Rasio Rekognisi Dosen (RRD) mencapai 100% dari seluruh DPR? RRD = (NRD / NDPR) × 100% (LKPS Tabel 2-II.7)"
      ]
    },
    {
      id: "RR-0019",
      jenjang_peruntukan: "S3",
      category: "Relevansi Penelitian",
      name: "Rekognisi & Sitasi Karya Ilmiah",
      questions: [
        "Apakah terdapat bukti kolaborasi, sitasi, and rekognisi bidang keilmuan DPR dalam 3 tahun terakhir?",
        "Apakah luaran penelitian termanfaatkan oleh DUDIK and masyarakat?",
        "Apakah Rasio Sitasi (RS) ≥ 100% dari seluruh DPR? RS = (NAS / NDPR) × 100% (LKPS Tabel 2-II.9)",
        "Apakah DPR mendapat rekognisi berupa: visiting professor, keynote speaker, staf ahli nasional/internasional?",
        "Apakah DPR menjadi editor/mitra bestari jurnal nasional terakreditasi atau jurnal internasional bereputasi?",
        "Apakah Rasio Rekognisi Dosen (RRD) mencapai 100% dari seluruh DPR? (LKPS Tabel 2-II.7)"
      ]
    },
    {
      id: "RPM-20",
      jenjang_peruntukan: "S1",
      category: "Relevansi Pengabdian Kepada Masyarakat",
      name: "Penugasan & Standar Masukan PkM",
      questions: [
        "Apakah terdapat roadmap PkM yang memayungi tema PkM dosen and mahasiswa serta hilirisasi keilmuan prodi and target berdampak?",
        "Apakah roadmap PkM mengacu pada visi keilmuan prodi and diferensiasi misi PT?",
        "Apakah dosen and mahasiswa melaksanakan PkM sesuai peta jalan?",
        "Apakah evaluasi kesesuaian PkM dengan roadmap dilakukan and digunakan untuk perbaikan and target berdampak?",
        "Apakah UPPS menyediakan akses memadai terhadap sarana, prasarana, and pembiayaan PkM?",
        "Apakah penugasan and peningkatan kompetensi dosen dalam PkM terstruktur?",
        "Apakah terdapat sistem TIK untuk mendokumentasikan, mengevaluasi, and menyebarluaskan hasil PkM?",
        "Apakah standar masukan PkM mempertimbangkan diferensiasi misi PT and target berdampak?"
      ]
    },
    {
      id: "RPM-020",
      jenjang_peruntukan: "S2",
      category: "Relevansi Pengabdian Kepada Masyarakat",
      name: "Penugasan & Standar Masukan PkM",
      questions: [
        "Apakah terdapat roadmap PkM yang memayungi tema PkM dosen and mahasiswa serta hilirisasi keilmuan prodi?",
        "Apakah roadmap PkM mengacu pada visi keilmuan prodi and diferensiasi misi PT?",
        "Apakah dosen and mahasiswa melaksanakan PkM sesuai peta jalan?",
        "Apakah evaluasi kesesuaian PkM dengan roadmap dilakukan and digunakan untuk perbaikan?",
        "Apakah roadmap PkM mendukung pengembangan kualitas kepakaran dosen?",
        "Apakah UPPS menyediakan akses memadai terhadap sarana, prasarana, and pembiayaan PkM?",
        "Apakah penugasan and peningkatan kompetensi dosen dalam PkM terstruktur?",
        "Apakah terdapat sistem TIK untuk mendokumentasikan, mengevaluasi, and menyebarluaskan hasil PkM?",
        "Apakah standar masukan PkM mempertimbangkan diferensiasi misi PT?"
      ]
    },
    {
      id: "RPM-0020",
      jenjang_peruntukan: "S3",
      category: "Relevansi Pengabdian Kepada Masyarakat",
      name: "Penugasan & Standar Masukan PkM",
      questions: [
        "Apakah terdapat roadmap PkM yang memayungi tema PkM dosen and mahasiswa serta hilirisasi keilmuan prodi?",
        "Apakah roadmap PkM mengacu pada visi keilmuan prodi and diferensiasi misi PT?",
        "Apakah dosen and mahasiswa melaksanakan PkM sesuai peta jalan?",
        "Apakah evaluasi kesesuaian PkM dengan roadmap dilakukan and digunakan untuk perbaikan?",
        "Apakah roadmap PkM mendukung pengembangan kualitas kepakaran dosen?",
        "Apakah UPPS menyediakan akses memadai terhadap sarana, prasarana, and pembiayaan PkM?",
        "Apakah penugasan and peningkatan kompetensi dosen dalam PkM terstruktur?",
        "Apakah terdapat sistem TIK untuk mendokumentasikan, mengevaluasi, and menyebarluaskan hasil PkM?",
        "Apakah standar masukan PkM mempertimbangkan diferensiasi misi PT?"
      ]
    }
  ];

  for (const inst of instruments) {
    const formattedQuestions = JSON.stringify(
      inst.questions.map((text, i) => ({
        id: `q${i + 1}`,
        text: text,
        bobot: 0
      }))
    );

    await prisma.instrument.upsert({
      where: { id: inst.id },
      update: {
        name: inst.name,
        category: inst.category,
        kriteria: "-",
        indikator: "-",
        jenjang_peruntukan: inst.jenjang_peruntukan,
        questions: formattedQuestions
      },
      create: {
        id: inst.id,
        name: inst.name,
        category: inst.category,
        kriteria: "-",
        indikator: "-",
        jenjang_peruntukan: inst.jenjang_peruntukan,
        questions: formattedQuestions
      }
    });
  }

  console.log("Seed successful: Added/Updated 15 instruments.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
