"use server";

import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  try {
    // NextAuth v5 automatically redirects upon successful login
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Username atau password salah." };
        default:
          return { error: "Terjadi kesalahan di sisi server." };
      }
    }
    // Must throw for NEXT_REDIRECT to work properly in Next.js Server Actions
    throw error;
  }
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi habis, silakan login kembali." };

  const oldPass = formData.get("oldPassword") as string;
  const newPass = formData.get("newPassword") as string;
  const confirmPass = formData.get("confirmPassword") as string;

  if (newPass !== confirmPass) return { error: "Konfirmasi password baru tidak cocok." };
  if (newPass.length < 6) return { error: "Password baru minimal 6 karakter." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.password) return { error: "User tidak ditemukan." };

  const isMatch = await bcrypt.compare(oldPass, user.password);
  if (!isMatch) return { error: "Password lama salah." };

  const hashed = await bcrypt.hash(newPass, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed }
  });

  return { success: "Password berhasil diperbarui." };
}
