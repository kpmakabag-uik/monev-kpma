import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Menambahkan instrumen baru (RP-6, RP-7, RP-8)...");

  const instruments = [
    {
      id: "RP-6-S1",
      category: "Relevansi Pendidikan",
      name: "Kompetensi & Kualifikasi DPR",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "S1",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah DPR memiliki kompetensi pedagogik, kepribadian, sosial, dan profesional?", bobot: 0 },
        { id: "q2", text: "Apakah kualifikasi DPR minimal lulusan Magister (S2) dengan bidang keahlian sesuai matakuliah? (Kualifikasi Doktor minimal mencapai 25% dari total DPR)", bobot: 0 },
        { id: "q3", text: "Apakah UPPS menetapkan sasaran strategis terkait profesi dan karir dosen?", bobot: 0 },
        { id: "q4", text: "Apakah kesesuaian bidang keahlian dosen dengan matakuliah yang diampu terdokumentasi?", bobot: 0 },
        { id: "q5", text: "Apakah luaran dosen mendukung diferensiasi misi UPPS? (publikasi jurnal, buku ajar, inovasi riset, produk PkM)", bobot: 0 },
        { id: "q6", text: "Apakah Program Studi memiliki sekurang-kurangnya 9 orang DPR dengan kualifikasi Doktor minimal 25% dari seluruh DPR? (LKPS Tabel 2-I.1)", bobot: 0 },
        { id: "q7", text: "Apakah DPR dalam jabatan akademik Guru Besar, Lektor Kepala, atau Lektor dengan PDJA >= 80%? (tidak termasuk Asisten Ahli)", bobot: 0 },
        { id: "q8", text: "Apakah persentase Dosen Tidak Tetap (PDTT) <= 10%? (LKPS Tabel 2-I.2)", bobot: 0 },
        { id: "q9", text: "Apakah beban kerja DPR (EWMP) berada pada rentang 12-16 sks? (LKPS Tabel 2-I.3)", bobot: 0 },
      ])
    },
    {
      id: "RP-6-S2",
      category: "Relevansi Pendidikan",
      name: "Kompetensi & Kualifikasi DPR",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "S2",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah DPR memiliki kompetensi pedagogik, kepribadian, sosial, dan profesional?", bobot: 0 },
        { id: "q2", text: "Apakah kualifikasi DPR minimal lulusan Doktor dengan bidang keahlian sesuai matakuliah? Catatan: Kualifikasi pendidikan Doktor minimal mencapai 25% dari total DPR di PD Dikti", bobot: 0 },
        { id: "q3", text: "Apakah UPPS menetapkan sasaran strategis terkait profesi dan karir dosen?", bobot: 0 },
        { id: "q4", text: "Apakah kesesuaian bidang keahlian dosen dengan matakuliah yang diampu terdokumentasi?", bobot: 0 },
        { id: "q5", text: "Apakah luaran dosen mendukung diferensiasi misi UPPS? (publikasi di jurnal pendidikan/riset bereputasi, buku ajar, inovasi riset, atau produk PkM)", bobot: 0 },
        { id: "q6", text: "Apakah Program Studi memiliki sekurang-kurangnya 7 orang DPR dengan kualifikasi Doktor yang relevan? (LKPS Tabel 2-I.1)", bobot: 0 },
        { id: "q7", text: "Apakah DPR dalam jabatan akademik Guru Besar, Lektor Kepala, atau Lektor dengan PDJA >= 80%? (tidak termasuk Asisten Ahli)", bobot: 0 },
        { id: "q8", text: "Apakah persentase Dosen Tidak Tetap (PDTT) <= 10%? (LKPS Tabel 2-I.2)", bobot: 0 },
        { id: "q9", text: "Apakah beban kerja DPR (EWMP) berada pada rentang 12-16 sks? (LKPS Tabel 2-I.3)", bobot: 0 },
      ])
    },
    {
      id: "RP-6-S3",
      category: "Relevansi Pendidikan",
      name: "Kompetensi & Kualifikasi DPR",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "S3",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah DPR memiliki kompetensi pedagogik, kepribadian, sosial, dan profesional?", bobot: 0 },
        { id: "q2", text: "Apakah kualifikasi DPR minimal lulusan doktor dengan bidang keahlian sesuai matakuliah?", bobot: 0 },
        { id: "q3", text: "Apakah UPPS menetapkan sasaran strategis terkait profesi dan karir dosen?", bobot: 0 },
        { id: "q4", text: "Apakah DPR produktif menghasilkan minimal 3 karya akademik/inovatif nasional sebagai penulis/pelaksana pertama?", bobot: 0 },
        { id: "q5", text: "Apakah Program Studi memiliki sekurang-kurangnya 7 orang DPR dengan kualifikasi Doktor yang relevan? (LKPS Tabel 2-I.1)", bobot: 0 },
        { id: "q6", text: "Apakah DPR dalam jabatan akademik Guru Besar (PDJA >= 5)? (Syarat Perlu Terakreditasi Unggul)", bobot: 0 },
        { id: "q7", text: "Apakah persentase Dosen Tidak Tetap (PDTT) <= 10%? (LKPS Tabel 2-I.2)", bobot: 0 },
        { id: "q8", text: "Apakah beban kerja DPR (EWMP) berada pada rentang 12-16 sks? (LKPS Tabel 2-I.3)", bobot: 0 },
        { id: "q9", text: "Apakah kesesuaian keahlian DPR dengan kompetensi inti program studi >= 90%?", bobot: 0 },
      ])
    },
    {
      id: "RP-7",
      category: "Relevansi Pendidikan",
      name: "Kecukupan Tenaga Kependidikan",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "Semua",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah tenaga kependidikan memiliki kompetensi yang mendukung tugas pokok layanan akademik, administrasi, dan IT?", bobot: 0 },
        { id: "q2", text: "Apakah kualifikasi pendidikan tenaga kependidikan minimal Diploma Tiga (D-3)?", bobot: 0 },
        { id: "q3", text: "Apakah tenaga kependidikan bekerja penuh waktu (37.5 jam/minggu)?", bobot: 0 },
        { id: "q4", text: "Apakah jumlah tenaga kependidikan memenuhi tingkat kecukupan kebutuhan layanan program studi?", bobot: 0 },
        { id: "q5", text: "Apakah terdapat tenaga kependidikan yang memiliki sertifikasi pelatihan relevan?", bobot: 0 },
      ])
    },
    {
      id: "RP-8",
      category: "Sarana, Prasarana, Pembiayaan & K3",
      name: "Sarana, Prasarana, Pembiayaan & K3",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "Semua",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah UPPS menjamin akses sarana dan prasarana yang mengakomodasi kebutuhan mahasiswa, dosen, dan tendik?", bobot: 0 },
        { id: "q2", text: "Apakah sarana prasarana ramah terhadap mahasiswa/dosen/tendik berkebutuhan khusus?", bobot: 0 },
        { id: "q3", text: "Apakah tersedia TIK yang andal untuk mendukung pendidikan?", bobot: 0 },
        { id: "q4", text: "Apakah sarana dan prasarana mendukung fokus diferensiasi misi UPPS (lab riset/lab pendidikan/lab inovasi)?", bobot: 0 },
        { id: "q5", text: "Apakah tersedia sistem K3 terkait keamanan, keselamatan, dan kesehatan?", bobot: 0 },
        { id: "q6", text: "Apakah terdapat kelengkapan pencegahan dan pemadaman kebakaran serta penanggulangan bencana?", bobot: 0 },
        { id: "q7", text: "Apakah tersedia sistem pengelolaan sampah dan limbah B3?", bobot: 0 },
        { id: "q8", text: "Apakah fasilitas memenuhi standar kesehatan kerja dan lingkungan kerja yang sehat?", bobot: 0 },
        { id: "q9", text: "Apakah kampus merupakan Kawasan Tanpa Rokok dan bebas NAPZA?", bobot: 0 },
        { id: "q10", text: "Apakah biaya investasi > 5% dari total anggaran? (LKPS Tabel 2-I.5)", bobot: 0 },
        { id: "q11", text: "Apakah biaya operasional pendidikan rata-rata >= Rp15 juta per mahasiswa aktif per tahun?", bobot: 0 },
      ])
    }
  ];

  for (const inst of instruments) {
    await prisma.instrument.upsert({
      where: { id: inst.id },
      update: inst,
      create: inst
    });
    console.log(`Berhasil menambahkan/memperbarui instrumen: ${inst.id}`);
  }

  console.log("Semua instrumen berhasil ditambahkan!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
