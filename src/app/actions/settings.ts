"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getSetting(key: string, defaultValue: string = "") {
  try {
    const settings: any[] = await prisma.$queryRaw`SELECT \`value\` FROM Setting WHERE \`key\` = ${key}`;
    return settings.length > 0 ? settings[0].value : defaultValue;
  } catch (error) {
    console.error("Error fetching setting:", error);
    return defaultValue;
  }
}

export async function saveSetting(key: string, value: string) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO Setting (\`key\`, \`value\`) 
      VALUES (${key}, ${value})
      ON DUPLICATE KEY UPDATE \`value\` = ${value}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error saving setting:", error);
    return { success: false, error: "Failed to save setting" };
  }
}
