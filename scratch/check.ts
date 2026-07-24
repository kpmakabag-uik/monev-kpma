import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const cycles = await prisma.cycle.count();
  const instruments = await prisma.instrument.count();
  const faculties = await prisma.faculty.count();
  const prodis = await prisma.prodi.count();
  
  console.log("=== Database Status ===");
  console.log("Users      :", users);
  console.log("Cycles     :", cycles);
  console.log("Faculties  :", faculties);
  console.log("Prodis     :", prodis);
  console.log("Instruments:", instruments);
  
  if (users > 0) {
    console.log("\n=== All Users ===");
    const usersSample = await prisma.user.findMany({
      select: { username: true, role: true, name: true },
    });
    console.table(usersSample);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
