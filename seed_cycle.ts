import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.cycle.create({
    data: {
      tahun_akademik: "2025/2026",
      semester: "Ganjil",
      isActive: true,
    }
  });
  console.log("Cycle seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
