"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getImpersonableUsers() {
  const session = await auth();
  if (session?.user?.realRole !== "KPMA") return [];

  const users = await prisma.user.findMany({
    where: {
      role: {
        not: "KPMA",
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      prodi: { select: { name: true, jenjang: true } },
      faculty: { select: { name: true } }
    },
    orderBy: [
      { role: "asc" },
      { name: "asc" }
    ]
  });

  return users;
}

export async function startImpersonating(userId: string) {
  const session = await auth();
  if (session?.user?.realRole !== "KPMA") {
    throw new Error("Unauthorized");
  }

  const cookieStore = await cookies();
  cookieStore.set("impersonate_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 // 1 day
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function stopImpersonating() {
  const cookieStore = await cookies();
  cookieStore.delete("impersonate_user_id");
  
  revalidatePath("/", "layout");
  return { success: true };
}
