import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const data = [
  { faculty: "Fakultas Agama Islam", prodis: [
    { name: "Pendidikan Agama Islam", jenjang: "S1" },
    { name: "Pendidikan Guru Madrasah Ibtidaiyah", jenjang: "S1" },
    { name: "Ekonomi Syariah", jenjang: "S1" },
    { name: "Hukum Keluarga Islam", jenjang: "S1" },
    { name: "Ilmu Al Quran dan Tafsir", jenjang: "S1" },
    { name: "Manajemen Haji dan Umrah", jenjang: "S1" },
    { name: "Bimbingan dan Konseling Pendidikan Islam", jenjang: "S1" },
    { name: "Komunikasi dan Penyiaran Islam", jenjang: "S1" },
  ]},
  { faculty: "Fakultas Keguruan dan Ilmu Pendidikan", prodis: [
    { name: "Pendidikan Bahasa Inggris", jenjang: "S1" },
    { name: "Pendidikan Masyarakat", jenjang: "S1" },
    { name: "Pendidikan Matematika", jenjang: "S1" },
    { name: "Pendidikan Vokasional Desain Fashion", jenjang: "S1" },
    { name: "Tekonologi Pendidikan", jenjang: "S1" },
  ]},
  { faculty: "Fakultas Ekonomi dan Bisnis", prodis: [
    { name: "Akuntansi", jenjang: "S1" },
    { name: "Manajemen", jenjang: "S1" },
    { name: "Perdagangan Internasional", jenjang: "S1" },
    { name: "Bisnis Digital", jenjang: "S1" },
    { name: "Perbankan dan Keuangan Digital", jenjang: "D4" },
  ]},
  { faculty: "Fakultas Hukum", prodis: [
    { name: "Ilmu Hukum", jenjang: "S1" },
    { name: "Hukum Bisnis", jenjang: "S2" },
  ]},
  { faculty: "Fakultas Teknik dan Sains", prodis: [
    { name: "Teknik Elektro", jenjang: "S1" },
    { name: "Teknik Informatika", jenjang: "S1" },
    { name: "Teknik Sipil", jenjang: "S1" },
    { name: "Teknik Mesin", jenjang: "S1" },
    { name: "Sistem Informasi", jenjang: "S1" },
    { name: "Rekayasa Pertanian Dan Biosistem", jenjang: "S1" },
    { name: "Ilmu Lingkungan", jenjang: "S1" },
  ]},
  { faculty: "Fakultas Ilmu Kesehatan", prodis: [
    { name: "Kesehatan Masyarakat", jenjang: "S1" },
    { name: "Gizi", jenjang: "S1" },
  ]},
  { faculty: "Fakultas/Sekolah Pascasarjana", prodis: [
    { name: "Pendidikan Agama Islam", jenjang: "S2" },
    { name: "Pendidikan Agama Islam", jenjang: "S3" },
    { name: "Teknologi Pendidikan", jenjang: "S2" },
    { name: "Komunikasi dan Penyiaran Islam", jenjang: "S2" },
    { name: "Manajemen", jenjang: "S2" },
    { name: "Ekonomi Syariah", jenjang: "S2" },
    { name: "Ekonomi Syariah", jenjang: "S3" },
  ]},
];

async function main() {
  console.log("Memulai pembersihan data Prodi & Fakultas...");

  // 1. Hapus data yang bergantung
  await prisma.monevRecord.deleteMany({});
  
  // 2. Reset relasi user agar tidak error saat prodi/fakultas dihapus
  await prisma.user.updateMany({
    data: {
      facultyId: null,
      prodiId: null,
    }
  });

  // 3. Hapus Prodi & Fakultas
  await prisma.prodi.deleteMany({});
  await prisma.faculty.deleteMany({});

  console.log("Data lama berhasil dibersihkan. Memulai input data baru...");

  for (const item of data) {
    const faculty = await prisma.faculty.create({
      data: { name: item.faculty }
    });
    console.log(`Menambahkan Fakultas: ${faculty.name}`);

    for (const p of item.prodis) {
      await prisma.prodi.create({
        data: {
          name: p.name,
          jenjang: p.jenjang,
          facultyId: faculty.id
        }
      });
    }
    console.log(`  -> Berhasil menambahkan ${item.prodis.length} Prodi.`);
  }

  console.log("Semua data berhasil diperbarui sesuai gambar!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
