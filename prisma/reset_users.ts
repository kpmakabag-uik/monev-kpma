import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  console.log("Memulai pembersihan data User...");
  await prisma.user.deleteMany({});
  console.log("Data User berhasil dibersihkan. Memulai input data baru...");

  const faculties = await prisma.faculty.findMany({});
  const prodis = await prisma.prodi.findMany({});

  const getFacId = (name: string) => faculties.find(f => f.name.includes(name))?.id || null;
  const getProdiId = (name: string, jenjang?: string) => {
    return prodis.find(p => p.name.includes(name) && (!jenjang || p.jenjang === jenjang))?.id || null;
  };

  const users = [
    // --- FAKULTAS AGAMA ISLAM ---
    { name: "Prodi BKPI", username: "bkpi_fai", role: "GKM", faculty: "Agama Islam", prodi: "Bimbingan dan Konseling Pendidikan Islam" },
    { name: "Prodi ESY", username: "esy_fai", role: "GKM", faculty: "Agama Islam", prodi: "Ekonomi Syariah", jenjang: "S1" },
    { name: "Prodi HKI", username: "hki_fai", role: "GKM", faculty: "Agama Islam", prodi: "Hukum Keluarga Islam" },
    { name: "Prodi IAT", username: "iat_fai", role: "GKM", faculty: "Agama Islam", prodi: "Ilmu Al Quran dan Tafsir" },
    { name: "Prodi KPI", username: "kpi_fai", role: "GKM", faculty: "Agama Islam", prodi: "Komunikasi dan Penyiaran Islam", jenjang: "S1" },
    { name: "Prodi MHU", username: "mhu_fai", role: "GKM", faculty: "Agama Islam", prodi: "Manajemen Haji dan Umrah" },
    { name: "Prodi PAI", username: "pai_fai", role: "GKM", faculty: "Agama Islam", prodi: "Pendidikan Agama Islam", jenjang: "S1" },
    { name: "Prodi PGMI", username: "pgmi_fai", role: "GKM", faculty: "Agama Islam", prodi: "Pendidikan Guru Madrasah Ibtidaiyah" },
    { name: "Dekanat", username: "dekanat", role: "PIMPINAN_FAKULTAS", faculty: "Agama Islam" },
    { name: "M Faishal Hidayat", username: "gpm_fai", role: "GPM", faculty: "Agama Islam" },

    // --- FEB ---
    { name: "Perbankan dan Keuangan Digital", username: "pkdfeb", role: "GKM", faculty: "Ekonomi dan Bisnis", prodi: "Perbankan dan Keuangan Digital" },
    { name: "Akuntansi", username: "akuntansi", role: "GKM", faculty: "Ekonomi dan Bisnis", prodi: "Akuntansi" },
    { name: "Bisnis Digital", username: "bdfeb", role: "GKM", faculty: "Ekonomi dan Bisnis", prodi: "Bisnis Digital" },
    { name: "Manajemen", username: "manajemen", role: "GKM", faculty: "Ekonomi dan Bisnis", prodi: "Manajemen", jenjang: "S1" },
    { name: "Perdagangan Internasional", username: "pifeb", role: "GKM", faculty: "Ekonomi dan Bisnis", prodi: "Perdagangan Internasional" },
    { name: "Dekanat FEB", username: "dekanat_feb", role: "PIMPINAN_FAKULTAS", faculty: "Ekonomi dan Bisnis" },
    { name: "GPM", username: "gpm_feb", role: "GPM", faculty: "Ekonomi dan Bisnis" },

    // --- HUKUM ---
    { name: "Dr. Desti Anggi Mustika, S.H., M.H. (S1)", username: "ilmuhukum", role: "GKM", faculty: "Hukum", prodi: "Ilmu Hukum" },
    { name: "Dr. Desti Anggi Mustika, S.H., M.H. (S2)", username: "ilmuhukum_s2", role: "GKM", faculty: "Hukum", prodi: "Hukum Bisnis" },
    { name: "Dekanat FH", username: "dekanat_fh", role: "PIMPINAN_FAKULTAS", faculty: "Hukum" },
    { name: "Latifah Ratnawaty, S.H., M.H.", username: "gpm_fh", role: "GPM", faculty: "Hukum" },

    // --- FIKES ---
    { name: "Gizi", username: "gizi_fikes", role: "GKM", faculty: "Ilmu Kesehatan", prodi: "Gizi" },
    { name: "Kesehatan Masyarakat", username: "kesmas_fikes", role: "GKM", faculty: "Ilmu Kesehatan", prodi: "Kesehatan Masyarakat" },
    { name: "Dekanat Fikes", username: "dekanat_fikes", role: "PIMPINAN_FAKULTAS", faculty: "Ilmu Kesehatan" },
    { name: "GPM FIKES", username: "gpm_fikes", role: "GPM", faculty: "Ilmu Kesehatan" },

    // --- FKIP ---
    { name: "Pendidikan Bahasa Inggris", username: "pbi_fkip", role: "GKM", faculty: "Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Bahasa Inggris" },
    { name: "Kartika Ayu Ningsih, M.Pd.", username: "penmas", role: "GKM", faculty: "Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Masyarakat" },
    { name: "pulan", username: "penmat", role: "GKM", faculty: "Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Matematika" },
    { name: "Pendidikan Vokasional Desain Fashion", username: "pvdf_fkip", role: "GKM", faculty: "Keguruan dan Ilmu Pendidikan", prodi: "Pendidikan Vokasional Desain Fashion" },
    { name: "Teknologi Pendidikan", username: "tp_fkip", role: "GKM", faculty: "Keguruan dan Ilmu Pendidikan", prodi: "Tekonologi Pendidikan" },
    { name: "Dekanat FKIP", username: "dekanat_fkip", role: "PIMPINAN_FAKULTAS", faculty: "Keguruan dan Ilmu Pendidikan" },
    { name: "Mohamad Sahril, M.Pd.", username: "gpm_fkip", role: "GPM", faculty: "Keguruan dan Ilmu Pendidikan" },

    // --- FTS ---
    { name: "Ilmu Lingkungan", username: "ilfts", role: "GKM", faculty: "Teknik dan Sains", prodi: "Ilmu Lingkungan" },
    { name: "Rekayasa Pertanian dan Biosistem", username: "rpbfts", role: "GKM", faculty: "Teknik dan Sains", prodi: "Rekayasa Pertanian Dan Biosistem" },
    { name: "Sistem Informasi", username: "sifts", role: "GKM", faculty: "Teknik dan Sains", prodi: "Sistem Informasi" },
    { name: "Teknik Elektro", username: "elektro", role: "GKM", faculty: "Teknik dan Sains", prodi: "Teknik Elektro" },
    { name: "Teknik Informatika", username: "informatika", role: "GKM", faculty: "Teknik dan Sains", prodi: "Teknik Informatika" },
    { name: "Teknik Mesin", username: "mesin", role: "GKM", faculty: "Teknik dan Sains", prodi: "Teknik Mesin" },
    { name: "Teknik Sipil", username: "sipil", role: "GKM", faculty: "Teknik dan Sains", prodi: "Teknik Sipil" },
    { name: "Dekanat FTS", username: "dekanat_fts", role: "PIMPINAN_FAKULTAS", faculty: "Teknik dan Sains" },
    { name: "GPM FTS", username: "gpm_fts", role: "GPM", faculty: "Teknik dan Sains" },

    // --- PASCA ---
    { name: "Magister Ekonomi Syariah", username: "esy2_pasca", role: "GKM", faculty: "Pascasarjana", prodi: "Ekonomi Syariah", jenjang: "S2" },
    { name: "Magister Komunikasi dan Penyiaran Islam", username: "kpi2_pasca", role: "GKM", faculty: "Pascasarjana", prodi: "Komunikasi dan Penyiaran Islam", jenjang: "S2" },
    { name: "Magister Manajemen", username: "mm2_pasca", role: "GKM", faculty: "Pascasarjana", prodi: "Manajemen", jenjang: "S2" },
    { name: "Magister Pendidikan Agama Islam", username: "pai2_pasca", role: "GKM", faculty: "Pascasarjana", prodi: "Pendidikan Agama Islam", jenjang: "S2" },
    { name: "Teknologi Pendidikan (S2)", username: "tp2_pasca", role: "GKM", faculty: "Pascasarjana", prodi: "Teknologi Pendidikan", jenjang: "S2" },
    { name: "Doktor Ekonomi Syariah", username: "esy3_pasca", role: "GKM", faculty: "Pascasarjana", prodi: "Ekonomi Syariah", jenjang: "S3" },
    { name: "Doktor Pendidikan Agama Islam", username: "pai3_pasca", role: "GKM", faculty: "Pascasarjana", prodi: "Pendidikan Agama Islam", jenjang: "S3" },
    { name: "Pimpinan Pasca", username: "pasca", role: "PIMPINAN_FAKULTAS", faculty: "Pascasarjana" },
    { name: "Gugus Penjamin Mutu Pasca", username: "pgm_pasca", role: "GPM", faculty: "Pascasarjana" },

    // --- PUSAT / UNIVERSITAS ---
    { name: "KPMA Admin", username: "admin_kpma", role: "KPMA" },
    { name: "Kepala KPMA", username: "kpma", role: "PIMPINAN_UNIVERSITAS" },
    { name: "Rektor", username: "rektor", role: "PIMPINAN_UNIVERSITAS" },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        name: u.name,
        username: u.username,
        password: passwordHash,
        role: u.role,
        facultyId: u.faculty ? getFacId(u.faculty) : null,
        prodiId: u.prodi ? getProdiId(u.prodi, u.jenjang) : null,
      }
    });
    console.log(`Berhasil membuat user: ${u.username}`);
  }

  console.log("Semua data pengguna berhasil diperbarui!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
