"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLevels() {
  return await prisma.level.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createLevel(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  try {
    await prisma.level.create({
      data: { name },
    });
    revalidatePath("/master/jenjang");
  } catch {
    // Ignore or log error
  }
}

export async function deleteLevel(id: string) {
  try {
    await prisma.level.delete({
      where: { id },
    });
    revalidatePath("/master/jenjang");
    return { success: true };
  } catch {
    return { error: "Gagal menghapus jenjang. Mungkin sedang digunakan oleh data lain." };
  }
}

export async function updateLevel(id: string, name: string) {
  try {
    await prisma.level.update({
      where: { id },
      data: { name },
    });
    revalidatePath("/master/jenjang");
    return { success: true };
  } catch {
    return { error: "Gagal memperbarui jenjang" };
  }
}
