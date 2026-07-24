import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm"; // Client component

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "KPMA") {
    redirect("/dashboard");
  }

  const setting = await prisma.setting.findFirst();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Setting Siklus Pengisian</h1>
        <p className="text-gray-500 mt-1">Mengatur siklus aktif MONEV yang akan digunakan di seluruh aplikasi.</p>
      </div>
      
      <SettingsForm initialData={setting} />
    </div>
  );
}
