import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Setting
  const setting = await prisma.setting.create({
    data: {
      appscript_url: "",
    },
  });
  console.log({ setting });

  // 1b. Cycle
  const cycle = await prisma.cycle.create({
    data: {
      tahun_akademik: "2025/2026",
      semester: "Genap",
      isActive: true,
    },
  });
  console.log({ cycle });

  // 2. Faculty
  const faculty = await prisma.faculty.create({
    data: {
      name: "Fakultas Teknik",
    },
  });
  console.log({ faculty });

  // 3. Prodi
  const prodi = await prisma.prodi.create({
    data: {
      name: "S1 Teknik Informatika",
      jenjang: "S1",
      facultyId: faculty.id,
    },
  });
  console.log({ prodi });

  // 4. Users
  const passwordHash = await bcrypt.hash("password", 10);

  const kpma = await prisma.user.create({
    data: {
      name: "Admin KPMA",
      username: "admin",
      password: passwordHash,
      role: "KPMA",
    },
  });

  const pimpinan = await prisma.user.create({
    data: {
      name: "Pimpinan Universitas",
      username: "pimpinan",
      password: passwordHash,
      role: "PIMPINAN_UNIVERSITAS",
    },
  });

  const f_pimpinan = await prisma.user.create({
    data: {
      name: "Dekan Fakultas Teknik",
      username: "dekan",
      password: passwordHash,
      role: "PIMPINAN_FAKULTAS",
      facultyId: faculty.id,
    },
  });

  const gpm = await prisma.user.create({
    data: {
      name: "Auditor GPM FT",
      username: "gpm",
      password: passwordHash,
      role: "GPM",
      facultyId: faculty.id,
    },
  });

  const gkm = await prisma.user.create({
    data: {
      name: "Prodi GKM IF",
      username: "gkm",
      password: passwordHash,
      role: "GKM",
      facultyId: faculty.id,
      prodiId: prodi.id,
    },
  });

  console.log("Users created:", { kpma, pimpinan, f_pimpinan, gpm, gkm });
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
