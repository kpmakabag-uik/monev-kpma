import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const instruments = [
    {
      id: "AK-31",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Kebijakan Penerimaan Mahasiswa Baru",
      questions: [
        "Apakah terdapat kebijakan penerimaan mahasiswa baru yang afirmatif, inklusif, dan adil (tidak diskriminatif atas suku, ras, agama, disabilitas)?",
        "Apakah terdapat upaya perluasan akses melalui: a) Pembelajaran Jarak Jauh (PJJ)?",
        "Apakah terdapat sharing sumber daya pembelajaran antar institusi?",
        "Apakah terdapat skema beasiswa: afirmasi, 3T, mahasiswa berprestasi tidak mampu, minat/bakat?",
        "Apakah terdapat kebijakan rekrutmen melalui Rekognisi Pembelajaran Lampau (RPL)?"
      ]
    },
    {
      id: "AK-32",
      jenjang_peruntukan: "S1",
      category: "Akuntabilitas",
      name: "Sistem Layanan Mahasiswa",
      questions: [
        "Apakah terdapat program penyiapan mahasiswa baru mencakup 4 aspek: penjelasan umum PT, integritas akademik, bebas kekerasan, dan adaptasi kampus?",
        "Apakah terdapat layanan administrasi akademik yang memadai?",
        "Apakah terdapat layanan bimbingan konseling?",
        "Apakah terdapat layanan kesehatan?",
        "Apakah terdapat layanan keperluan dasar mahasiswa berkebutuhan khusus?",
        "Apakah terdapat layanan pemenuhan beban belajar di luar program studi? (MBKM: magang, pertukaran pelajar, wirausaha, dll.)",
        "Apakah dilakukan survey kepuasan atas layanan mahasiswa?"
      ]
    },
    {
      id: "AK-032",
      jenjang_peruntukan: "S2",
      category: "Akuntabilitas",
      name: "Sistem Layanan Mahasiswa",
      questions: [
        "Apakah terdapat program penyiapan mahasiswa baru mencakup 4 aspek: penjelasan umum PT, integritas akademik, bebas kekerasan, dan adaptasi kampus?",
        "Apakah terdapat layanan administrasi akademik yang memadai?",
        "Apakah terdapat layanan bimbingan konseling?",
        "Apakah terdapat layanan kesehatan?",
        "Apakah terdapat layanan keperluan dasar mahasiswa berkebutuhan khusus?",
        "Apakah dilakukan survey kepuasan atas layanan mahasiswa?"
      ]
    },
    {
      id: "AK-0032",
      jenjang_peruntukan: "S3",
      category: "Akuntabilitas",
      name: "Sistem Layanan Mahasiswa",
      questions: [
        "Apakah terdapat program penyiapan mahasiswa baru mencakup 4 aspek: penjelasan umum PT, integritas akademik, bebas kekerasan, dan adaptasi kehidupan kampus?",
        "Apakah terdapat layanan administrasi akademik yang memadai?",
        "Apakah terdapat layanan bimbingan konseling?",
        "Apakah terdapat layanan kesehatan?",
        "Apakah terdapat layanan keperluan dasar mahasiswa berkebutuhan khusus?",
        "Apakah dilakukan survey kepuasan atas layanan mahasiswa?"
      ]
    },
    {
      id: "AK-33",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Implementasi Layanan Berintegritas",
      questions: [
        "Apakah terdapat dokumen dan bukti sahih implementasi layanan yang berintegritas (bersih dan melayani)?",
        "Apakah layanan berintegritas dievaluasi secara periodik (triwulan)?",
        "Apakah terdapat prosedur formal layanan yang bersih dan profesional?"
      ]
    },
    {
      id: "AK-34",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Kepuasan Pemangku Kepentingan (Tata Pamong)",
      questions: [
        "Apakah survey kepuasan menggunakan instrumen yang sahih, andal, dan mudah digunakan?",
        "Apakah survey kepuasan dilaksanakan secara berkala and datanya terekam komprehensif?",
        "Apakah hasil survey dianalisis dengan metode yang tepat untuk pengambilan keputusan?",
        "Apakah umpan balik kepuasan ditindaklanjuti untuk perbaikan mutu secara berkala?",
        "Apakah survey mencakup semua stakeholder: mahasiswa, dosen, tendik, mitra, lulusan, pengguna lulusan?"
      ]
    },
    {
      id: "AK-35",
      jenjang_peruntukan: "Semua",
      category: "Akuntabilitas",
      name: "Zona Layanan Berintegritas (WBK/WBBM)",
      questions: [
        "Apakah terdapat dokumen peraturan layanan berintegritas di unit kerja?",
        "Apakah implementasi zona layanan berintegritas berjalan konsisten and terevaluasi?",
        "Apakah terdapat survey kepuasan stakeholder terkait layanan berintegritas?",
        "Apakah terdapat kick-off meeting komitmen WBK dan/atau WBBM?"
      ]
    },
    {
      id: "DM-36",
      jenjang_peruntukan: "Semua",
      category: "Diferensiasi Misi",
      name: "Visi Keilmuan & Rencana Strategis Prodi",
      questions: [
        "Apakah UPPS memiliki visi keilmuan (keunggulan/penciri) prodi yang selaras dengan diferensiasi misi and visi PT?",
        "Apakah visi keilmuan didukung standar luaran, proses, and masukan tridharma yang relevan?",
        "Apakah pencapaian visi keilmuan dievaluasi untuk perbaikan berkelanjutan?",
        "Apakah rencana strategis pengembangan prodi mencakup peta pengembangan jangka panjang, menengah, and pendek dengan indikator terukur?",
        "Apakah rencana strategis mencakup pengembangan sarana, SDM, keuangan, tata kelola, kerjasama, and mahasiswa?",
        "Apakah renstra ditinjau secara berkala untuk mengakomodasi potensi risiko perubahan internal and eksternal?"
      ]
    },
    {
      id: "DM-37",
      jenjang_peruntukan: "S1",
      category: "Diferensiasi Misi",
      name: "Pelaksanaan Program Pendidikan & Pembelajaran",
      questions: [
        "Apakah program pendidikan and pembelajaran sesuai dengan renstra/renop prodi?",
        "Apakah pendekatan project-based learning atau case method diterapkan untuk mengembangkan kompetensi mahasiswa? (fokus misi pendidikan)",
        "Apakah pendekatan research-based learning diterapkan untuk mengembangkan pengetahuan and mengasah mahasiswa menjadi seorang intelektual? (fokus misi penelitian)",
        "Apakah community service-based learning diterapkan melalui pemanfaatan pengetahuan and teknologi untuk menyelesaikan permasalahan masyarakat? (fokus misi PkM)",
        "Apakah program pendidikan and pembelajaran dievaluasi untuk perbaikan berkelanjutan?"
      ]
    },
    {
      id: "DM-037",
      jenjang_peruntukan: "S2",
      category: "Diferensiasi Misi",
      name: "Pelaksanaan Program Pendidikan & Pembelajaran",
      questions: [
        "Apakah program pendidikan and pembelajaran sesuai dengan renstra/renop prodi?",
        "Apakah pendekatan research-based learning diterapkan untuk mengembangkan kompetensi mahasiswa sebagai peneliti? (fokus misi penelitian)",
        "Apakah pendekatan problem-based learning/case method diterapkan? (fokus misi pendidikan)",
        "Apakah community service-based learning diterapkan untuk menyelesaikan permasalahan masyarakat? (fokus misi PkM)",
        "Apakah program pendidikan and pembelajaran dievaluasi untuk perbaikan berkelanjutan?"
      ]
    },
    {
      id: "DM-0037",
      jenjang_peruntukan: "S3",
      category: "Diferensiasi Misi",
      name: "Pelaksanaan Program Pendidikan & Pembelajaran",
      questions: [
        "Apakah program pendidikan and pembelajaran sesuai dengan renstra/renop prodi?",
        "Apakah pendekatan research-driven learning diterapkan untuk mengembangkan kompetensi mahasiswa sebagai peneliti? (fokus misi penelitian)",
        "Apakah pendekatan problem-based learning/case method diterapkan? (fokus misi pendidikan)",
        "Apakah community service-based learning diterapkan? (fokus misi PkM)",
        "Apakah program pendidikan and pembelajaran dievaluasi untuk perbaikan berkelanjutan?"
      ]
    },
    {
      id: "DM-38",
      jenjang_peruntukan: "Semua",
      category: "Diferensiasi Misi",
      name: "Evaluasi Ketercapaian Tujuan Program Studi",
      questions: [
        "Apakah evaluasi keterlaksanaan and pencapaian program pendidikan sesuai diferensiasi misi dilakukan setiap tahun?",
        "Apakah terdapat kajian pembandingan capaian dengan institusi rujukan (benchmarking)?",
        "Apakah identifikasi perkembangan kebutuhan masyarakat/DUDIK untuk perbaikan prodi dilakukan?",
        "Apakah laporan ketercapaian tujuan program studi disampaikan kepada stakeholders?"
      ]
    },
    {
      id: "DM-39",
      jenjang_peruntukan: "S1",
      category: "Diferensiasi Misi",
      name: "Rekognisi & Apresiasi UPPS dari Masyarakat/DUDIK",
      questions: [
        "Apakah terdapat permintaan kerjasama berkelanjutan terkait peningkatan kualitas pendidikan dari masyarakat/DUDIK? (fokus misi pendidikan)",
        "Apakah terdapat rekrutmen khusus lulusan dari DUDIK yang mengakui keunggulan prodi dalam literasi pedagogik and pemanfaatan TIK?",
        "Apakah lulusan memiliki sertifikasi profesional yang terbukti diakui industri?",
        "Apakah terdapat kolaborasi riset bersama DUDIK atau pemerintah? (fokus misi penelitian)",
        "Apakah produk riset prodi dimanfaatkan oleh industri/masyarakat?",
        "Apakah terdapat perubahan positif pada masyarakat/mitra PkM? (fokus misi PkM)",
        "Apakah terdapat kolaborasi PkM bersama masyarakat atau pemerintah yang berdampak?",
        "Apakah terdapat penghargaan dari pemerintah, industri, atau asosiasi profesi atas capaian prodi sesuai visi keilmuan?",
        "Apakah pengakuan and apresiasi terjadi pada level nasional and/atau internasional? (Syarat Perlu Terakreditasi Unggul)"
      ]
    },
    {
      id: "DM-039",
      jenjang_peruntukan: "S2",
      category: "Diferensiasi Misi",
      name: "Rekognisi & Apresiasi UPPS dari Masyarakat/DUDIK",
      questions: [
        "Apakah terdapat permintaan kerjasama berkelanjutan terkait peningkatan kualitas pendidikan/penelitian/PkM dari masyarakat/DUDIK? (sesuai fokus misi)",
        "Apakah terdapat rekrutmen khusus lulusan dari DUDIK yang mengakui keunggulan prodi dalam pemanfaatan TIK and kompetensi lainnya?",
        "Apakah terdapat kolaborasi riset bersama DUDIK atau pemerintah? (fokus misi penelitian)",
        "Apakah produk riset prodi dimanfaatkan oleh industri/masyarakat?",
        "Apakah terdapat perubahan positif pada masyarakat/mitra PkM? (fokus misi PkM)",
        "Apakah terdapat kolaborasi PkM bersama masyarakat atau pemerintah yang berdampak?",
        "Apakah terdapat penghargaan dari pemerintah, industri, atau asosiasi profesi atas capaian prodi sesuai visi keilmuan?",
        "Apakah pengakuan and apresiasi terjadi pada level nasional and/atau internasional? (Syarat Perlu Terakreditasi Unggul)"
      ]
    },
    {
      id: "DM-0039",
      jenjang_peruntukan: "S3",
      category: "Diferensiasi Misi",
      name: "Rekognisi & Apresiasi UPPS dari Masyarakat/DUDIK",
      questions: [
        "Apakah terdapat permintaan kerjasama berkelanjutan terkait peningkatan kualitas pendidikan/penelitian/PkM dari masyarakat/DUDIK? (sesuai fokus misi)",
        "Apakah terdapat rekrutmen khusus lulusan dari DUDIK yang mengakui keunggulan prodi?",
        "Apakah terdapat kolaborasi riset bersama DUDIK atau pemerintah? (fokus misi penelitian)",
        "Apakah produk riset prodi dimanfaatkan oleh industri/masyarakat?",
        "Apakah terdapat perubahan positif pada masyarakat/mitra PkM? (fokus misi PkM)",
        "Apakah terdapat kolaborasi PkM bersama masyarakat atau pemerintah yang berdampak?",
        "Apakah terdapat penghargaan dari pemerintah, industri, atau asosiasi profesi atas capaian prodi sesuai visi keilmuan?",
        "Apakah pengakuan and apresiasi terjadi pada level nasional and/atau internasional? (Syarat Perlu Terakreditasi Unggul)"
      ]
    },
    {
      id: "TL-1",
      jenjang_peruntukan: "Semua",
      category: "Tindak Lanjut",
      name: "Tindak Lanjut Hasil MONEV",
      questions: [
        "Apakah seluruh temuan hasil MONEV semester berjalan telah direkap and diklasifikasikan?",
        "Apakah tindak lanjut telah ditetapkan untuk setiap temuan MONEV?",
        "Apakah penanggung jawab and tenggat waktu tindak lanjut ditetapkan?",
        "Apakah tindak lanjut hasil MONEV dikomunikasikan kepada pihak terkait?"
      ]
    },
    {
      id: "TL-2",
      jenjang_peruntukan: "Semua",
      category: "Tindak Lanjut",
      name: "Pemantauan Tindak Lanjut Hasil MONEV",
      questions: [
        "Apakah pemantauan pelaksanaan tindak lanjut MONEV dilakukan secara terjadwal?",
        "Apakah status tindak lanjut (selesai/dalam proses/belum) terdokumentasi?",
        "Apakah efektivitas tindak lanjut dievaluasi untuk MONEV periode berikutnya?",
        "Apakah laporan pemantauan tindak lanjut disampaikan ke pimpinan UPPS/PT?"
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

  console.log("Seed successful: Added/Updated 17 instruments.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
