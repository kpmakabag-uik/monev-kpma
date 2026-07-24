import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const instruments = [
    {
      id: "RPM-21",
      jenjang_peruntukan: "Semua",
      category: "Relevansi Pengabdian Kepada Masyarakat",
      name: "Pelaksanaan PkM & Integrasi ke Kurikulum",
      questions: [
        "Apakah PkM dosen bersama mahasiswa memenuhi keterlaksanaan kode etik PkM?",
        "Apakah pengelolaan dan kepemilikan HKI hasil PkM sesuai ketentuan perundangan?",
        "Apakah terdapat ketentuan dalam pelaksanaan kerja sama PkM?",
        "Apakah terdapat persyaratan dan ketentuan diseminasi hasil PkM?",
        "Apakah perbaikan kualitas PkM dilakukan secara berkelanjutan?",
        "Apakah hasil PkM diintegrasikan ke dalam kurikulum untuk pengembangan program studi?",
        "Apakah integrasi hasil PkM ke kurikulum berjalan konsisten dan dievaluasi?"
      ]
    },
    {
      id: "RPM-22",
      jenjang_peruntukan: "Semua",
      category: "Relevansi Pengabdian Kepada Masyarakat",
      name: "Luaran & Rekognisi PkM",
      questions: [
        "Apakah luaran PkM mengadopsi lisensi terbuka dan dapat diakses masyarakat?",
        "Apakah terdapat pengembangan kapasitas SDM dari hasil PkM?",
        "Apakah terdapat ragam layanan terlembaga dari hasil PkM?",
        "Apakah kepuasan mitra kerjasama PkM diukur dan didokumentasikan?",
        "Apakah realisasi sumber dana pengabdian terdokumentasi dan mencukupi?",
        "Apakah terdapat rekognisi atas luaran PkM sesuai bidang keilmuan prodi (karya DPR yang terekognisi/diterapkan masyarakat)?"
      ]
    },
    {
      id: "RPM-23",
      jenjang_peruntukan: "Semua",
      category: "Relevansi Pengabdian Kepada Masyarakat",
      name: "Pengakuan Kepakaran & HKI Dosen",
      questions: [
        "Apakah DPR mendapat pengakuan kepakaran profesional dari masyarakat, pemerintah, atau industri?",
        "Apakah Rasio Rekognisi Dosen (RRD) ≥ 100% dari seluruh DPR?",
        "Apakah terdapat karya DPR atau bersama mahasiswa berupa Paten/Paten Sederhana?",
        "Apakah terdapat HKI lainnya: Hak Cipta, Desain Produk Industri, Perlindungan Varietas Tanaman, dll.?",
        "Apakah terdapat Teknologi Tepat Guna, Produk Terstandarisasi/Tersertifikasi, Karya Seni, Rekayasa Sosial?",
        "Apakah Rasio HKI (RHKI) ≥ 100% dari seluruh DPR? RHKI = (NA+NB+NC) / NDPR × 100%"
      ]
    },
    {
      id: "AK-24",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Tata Pamong – SOTK & Renstra Pendidikan",
      questions: [
        "Apakah terdapat dokumen formal Struktur Organisasi dan Tata Kerja (SOTK) yang lengkap mencakup: penyusun kebijakan, pelaksana akademik, pengawas/penjaminan mutu, penunjang akademik, pelaksana administrasi?",
        "Apakah renstra pengembangan pendidikan UPPS tersedia dan mencakup Program Studi yang diakreditasi?",
        "Apakah SOTK dan renstra ditetapkan dengan ketetapan formal dan berjalan efektif?",
        "Apakah renstra mencakup peta pengembangan jangka panjang, menengah, dan pendek dengan indikator terukur?"
      ]
    },
    {
      id: "AK-25",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Sistem Tata Pamong & Mitigasi Risiko",
      questions: [
        "Apakah pengawasan dan pengendalian kegiatan pendidikan dilakukan dalam bidang akademik dan nonakademik?",
        "Apakah terdapat pemantauan dan evaluasi pelaksanaan kegiatan pendidikan serta efektivitas kebijakan akademik?",
        "Apakah pemantauan potensi risiko (korupsi, pengaduan, penurunan data PD Dikti) dilakukan?",
        "Apakah terdapat penjaminan kepatuhan pada otoritas akademik dan etika akademik?",
        "Apakah terdapat sistem penerimaan, pendokumentasian, dan penyelesaian keluhan/pengaduan?",
        "Apakah terdapat pelaporan dan akuntabilitas terhadap penggunaan bantuan pendanaan dari mitra?",
        "Apakah UPPS memenuhi ketentuan peraturan ketenagakerjaan (UU No.13/2003) dan ASN (UU No.20/2023)?"
      ]
    },
    {
      id: "AK-26",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Sistem TIK Pengelolaan Data & Informasi",
      questions: [
        "Apakah terdapat kebijakan formal terkait pengembangan sarana TIK untuk manajemen dan pengelolaan data?",
        "Apakah sistem TIK memastikan keamanan, kebenaran, akurasi, kelengkapan, dan kemutakhiran data akademik?",
        "Apakah sistem TIK mendukung perencanaan, pelaksanaan, pengawasan, dan pengambilan keputusan?",
        "Apakah data profil dan kinerja prodi dilaporkan ke PD Dikti sesuai ketentuan perundangan?",
        "Apakah data dan informasi prodi dapat diakses publik?",
        "Apakah terdapat rencana pengembangan TIK untuk mendukung kegiatan pendidikan?"
      ]
    },
    {
      id: "AK-27",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Efektivitas Kepemimpinan UPPS & Prodi",
      questions: [
        "Apakah terdapat bukti sahih kepemimpinan operasional yang menggerakkan seluruh sumber daya internal secara optimal?",
        "Apakah terdapat bukti kepemimpinan organisasional yang menggerakkan dan mengharmonisasikan suasana kerja kondusif?",
        "Apakah terdapat bukti kepemimpinan publik berupa kerjasama yang menjadikan prodi sebagai rujukan masyarakat?",
        "Apakah efektivitas kepemimpinan mencakup ketiga aspek tersebut secara konsisten?"
      ]
    },
    {
      id: "AK-28",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Good University Governance (GUG)",
      questions: [
        "Apakah terdapat dokumen formal GUG mencakup 6 aspek: kredibilitas, transparansi, akuntabilitas, tanggung jawab, berkeadilan, dan manajemen risiko?",
        "Apakah implementasi GUG berjalan konsisten di lingkungan UPPS?",
        "Apakah UPPS mengumumkan ringkasan laporan tahunan kepada masyarakat?",
        "Apakah terdapat lembaga/unit penegakan kode etik yang berfungsi efektif dengan pedoman formal?",
        "Apakah terdapat kebijakan dan bukti implementasi kampus bebas kekerasan seksual, perundungan, dan diskriminasi?",
        "Apakah ada penanganan dan penindakan kasus kekerasan seksual/perundungan/intoleransi di UPPS?"
      ]
    },
    {
      id: "AK-29",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Pengelolaan Fungsional & Operasional UPPS",
      questions: [
        "Apakah terdapat bukti formal keberfungsian perencanaan (planning) di UPPS?",
        "Apakah terdapat bukti formal keberfungsian pengorganisasian (organizing)?",
        "Apakah terdapat bukti formal keberfungsian penempatan personil (staffing)?",
        "Apakah terdapat bukti formal keberfungsian pengarahan (leading)?",
        "Apakah terdapat bukti formal keberfungsian pengawasan (controlling)?",
        "Apakah kelima aspek pengelolaan fungsional dan operasional berjalan konsisten?"
      ]
    },
    {
      id: "AK-30",
      jenjang_peruntukan: "S1",
      category: "Akuntabilitas",
      name: "Suasana Akademik Program Studi",
      questions: [
        "Apakah terdapat dokumen formal kebijakan suasana akademik: otonomi keilmuan, kebebasan akademik, dan kebebasan mimbar akademik?",
        "Apakah kegiatan tridharma menjunjung tinggi integritas dan etika akademik?",
        "Apakah suasana akademik yang kondusif terwujud secara konsisten setiap bulan?",
        "Apakah terdapat kegiatan seminar, diskusi ilmiah, kuliah tamu, dan kegiatan akademik kemahasiswaan secara rutin?"
      ]
    },
    {
      id: "AK-030",
      jenjang_peruntukan: "S2",
      category: "Akuntabilitas",
      name: "Suasana Akademik Program Studi",
      questions: [
        "Apakah terdapat dokumen formal kebijakan suasana akademik: otonomi keilmuan, kebebasan akademik, dan kebebasan mimbar akademik?",
        "Apakah kegiatan tridharma menjunjung tinggi integritas dan etika akademik?",
        "Apakah suasana akademik yang kondusif terwujud secara konsisten setiap bulan?",
        "Apakah terdapat kegiatan seminar, diskusi ilmiah, dan kolokium secara rutin dalam program magister?"
      ]
    },
    {
      id: "AK-0030",
      jenjang_peruntukan: "S3",
      category: "Akuntabilitas",
      name: "Suasana Akademik Program Studi",
      questions: [
        "Apakah terdapat dokumen formal kebijakan suasana akademik yang mencakup: otonomi keilmuan, kebebasan akademik, dan kebebasan mimbar akademik?",
        "Apakah kegiatan tridharma di PT menjunjung tinggi integritas dan etika akademik?",
        "Apakah suasana akademik yang kondusif terwujud secara konsisten setiap bulan?",
        "Apakah terdapat kegiatan seminar, diskusi ilmiah, dan koloqium secara rutin dalam program doktor?"
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

  console.log("Seed successful: Added/Updated 12 instruments.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
