import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password", 10);
  
  const updatedUser = await prisma.user.update({
    where: { username: "admin_kpma" },
    data: { password: passwordHash }
  });
  
  console.log("Password reset successfully for:", updatedUser.username);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
