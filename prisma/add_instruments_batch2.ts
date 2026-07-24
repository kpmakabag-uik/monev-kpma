import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Menambahkan instrumen batch 2 (RP-9, RP-10, RP-11)...");

  const instruments = [
    {
      id: "RP-9",
      category: "Relevansi Pendidikan",
      name: "Sistem TIK Pendukung Pendidikan",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "Semua",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah sistem TIK mendukung pengembangan materi dan pelaksanaan pembelajaran/ujian?", bobot: 0 },
        { id: "q2", text: "Apakah TIK memastikan keamanan, kebenaran, akurasi, dan kemutakhiran data akademik?", bobot: 0 },
        { id: "q3", text: "Apakah TIK mendukung perencanaan, pelaksanaan, pengawasan, dan pengambilan keputusan?", bobot: 0 },
        { id: "q4", text: "Apakah data profil dan kinerja prodi dilaporkan ke PD Dikti secara rutin?", bobot: 0 },
        { id: "q5", text: "Apakah data dan informasi perguruan tinggi dapat diakses publik?", bobot: 0 },
        { id: "q6", text: "Apakah sistem TIK menunjang fokus diferensiasi misi PT?", bobot: 0 },
        { id: "q7", text: "Apakah sistem TIK dievaluasi secara periodik dan ditindaklanjuti?", bobot: 0 },
      ])
    },
    {
      id: "RP-10-S1",
      category: "Relevansi Pendidikan",
      name: "Standar & Fleksibilitas Proses Pembelajaran",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "S1",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah standar perencanaan proses pembelajaran mencakup: perumusan CPL, strategi/metode pembelajaran, dan cara penilaian?", bobot: 0 },
        { id: "q2", text: "Apakah pelaksanaan pembelajaran menciptakan suasana yang menyenangkan, inklusif, kolaboratif, kreatif, dan efektif?", bobot: 0 },
        { id: "q3", text: "Apakah pembelajaran memberikan kesempatan yang sama tanpa diskriminasi dan bersifat fleksibel?", bobot: 0 },
        { id: "q4", text: "Apakah penilaian proses pembelajaran dilakukan untuk memperbaiki kualitas pembelajaran?", bobot: 0 },
        { id: "q5", text: "Apakah standar proses dievaluasi secara periodik dan terus dilakukan perbaikan? (Konsistensi 3 tahun)", bobot: 0 },
        { id: "q6", text: "Apakah pembelajaran dapat dilakukan secara tatap muka, daring, atau kombinasi keduanya?", bobot: 0 },
        { id: "q7", text: "Apakah mahasiswa diberi keleluasaan mengikuti pendidikan dari berbagai tahapan kurikulum sesuai dengan kurikulum prodi?", bobot: 0 },
        { id: "q8", text: "Apakah mahasiswa dapat menyelesaikan pendidikan melalui Rekognisi Pembelajaran Lampau (RPL)?", bobot: 0 },
        { id: "q9", text: "Apakah pembelajaran bersifat inklusif terhadap peserta dengan berbagai latar belakang, usia, lokasi, sosial, budaya, dan ekonomi?", bobot: 0 },
        { id: "q10", text: "Apakah persentase mahasiswa aktif yang memperoleh minimal 10 sks di luar Program Studi pada TS > 10%? (MBKM: pertukaran pelajar, magang, wirausaha, PkM, dll) (LKPS Tabel 2-I.6.1)", bobot: 0 },
      ])
    },
    {
      id: "RP-10-S2",
      category: "Relevansi Pendidikan",
      name: "Standar & Fleksibilitas Proses Pembelajaran",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "S2",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah standar perencanaan proses pembelajaran mencakup: perumusan CPL, strategi/metode pembelajaran, dan cara penilaian?", bobot: 0 },
        { id: "q2", text: "Apakah pelaksanaan pembelajaran menciptakan suasana yang menyenangkan, inklusif, kolaboratif, kreatif, dan efektif?", bobot: 0 },
        { id: "q3", text: "Apakah pembelajaran memberikan kesempatan yang sama tanpa diskriminasi dan bersifat fleksibel?", bobot: 0 },
        { id: "q4", text: "Apakah penilaian proses pembelajaran dilakukan untuk memperbaiki kualitas pembelajaran?", bobot: 0 },
        { id: "q5", text: "Apakah standar proses dievaluasi secara periodik dan terus dilakukan perbaikan? (Konsistensi 3 tahun)", bobot: 0 },
        { id: "q6", text: "Apakah pendekatan research-based learning diterapkan dalam program magister?", bobot: 0 },
        { id: "q7", text: "Apakah interaksi dosen-mahasiswa dalam seminar, diskusi, dan bimbingan tesis terdokumentasi?", bobot: 0 },
      ])
    },
    {
      id: "RP-10-S3",
      category: "Relevansi Pendidikan",
      name: "Standar & Fleksibilitas Proses Pembelajaran",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "S3",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah standar perencanaan proses pembelajaran mencakup: perumusan CPL, strategi/metode pembelajaran, dan cara penilaian?", bobot: 0 },
        { id: "q2", text: "Apakah pelaksanaan pembelajaran menciptakan suasana yang menyenangkan, inklusif, kolaboratif, kreatif, dan efektif?", bobot: 0 },
        { id: "q3", text: "Apakah pembelajaran memberikan kesempatan yang sama tanpa diskriminasi dan bersifat fleksibel?", bobot: 0 },
        { id: "q4", text: "Apakah penilaian proses pembelajaran dilakukan untuk memperbaiki kualitas pembelajaran?", bobot: 0 },
        { id: "q5", text: "Apakah standar proses dievaluasi secara periodik dan terus dilakukan perbaikan? (Konsistensi 3 tahun)", bobot: 0 },
        { id: "q6", text: "Apakah pembelajaran berbasis riset (research-driven learning) diterapkan dalam program doktor?", bobot: 0 },
        { id: "q7", text: "Apakah interaksi dosen-mahasiswa dalam seminar, diskusi, dan bimbingan disertasi terdokumentasi?", bobot: 0 },
      ])
    },
    {
      id: "RP-11",
      category: "Relevansi Pendidikan",
      name: "Standar Penilaian Hasil Belajar",
      kriteria: "-",
      indikator: "-",
      jenjang_peruntukan: "Semua",
      questions: JSON.stringify([
        { id: "q1", text: "Apakah standar penilaian hasil belajar mencakup prinsip: valid, reliabel, transparan, akuntabel, berkeadilan, objektif, dan edukatif?", bobot: 0 },
        { id: "q2", text: "Apakah standar penilaian diimplementasikan secara konsisten dalam 3 tahun terakhir?", bobot: 0 },
        { id: "q3", text: "Apakah rubrik/portofolio penilaian tersedia untuk minimal 70% matakuliah?", bobot: 0 },
        { id: "q4", text: "Apakah penilaian dilakukan secara terintegrasi dan ada upaya perbaikan berkelanjutan?", bobot: 0 },
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

  console.log("Batch 2 berhasil ditambahkan!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
