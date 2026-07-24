import { updateUser } from "@/app/actions/master";
import prisma from "@/lib/prisma";
import Link from "next/link";
import UserForm from "../UserForm";
import { notFound } from "next/navigation";

export default async function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const faculties = await prisma.faculty.findMany();
  const prodis = await prisma.prodi.findMany();
  const updateAction = updateUser.bind(null, user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/master/users" className="text-gray-500 hover:text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Ubah Akun Pengguna</h1>
      </div>

      <UserForm 
        action={updateAction} 
        user={user}
        faculties={faculties} 
        prodis={prodis} 
        submitLabel="Simpan Perubahan" 
      />
    </div>
  );
}
