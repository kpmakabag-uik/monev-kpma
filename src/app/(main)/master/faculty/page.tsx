import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import { deleteFaculty } from "@/app/actions/master";

export default async function FacultyPage() {
  const session = await auth();
  if (session?.user?.role !== "KPMA") redirect("/dashboard");
  const faculties = await prisma.faculty.findMany();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Fakultas</h1>
          <p className="text-gray-500 mt-1">Daftar Fakultas yang ada di PT.</p>
        </div>
        <Link href="/master/faculty/new" className="bg-institusi hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow text-sm font-medium transition-all">
          + Tambah Fakultas
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-semibold w-64">ID</th>
              <th className="p-4 font-semibold">Nama Fakultas</th>
              <th className="p-4 font-semibold text-right w-40">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {faculties.map(f => (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm text-gray-500">{f.id}</td>
                <td className="p-4 text-sm font-semibold text-gray-900">{f.name}</td>
                <td className="p-4 text-sm text-right">
                  <Link href={`/master/faculty/${f.id}`} className="text-institusi hover:text-blue-800 font-medium mr-4">Edit</Link>
                  <DeleteButton id={f.id} deleteAction={deleteFaculty} />
                </td>
              </tr>
            ))}
            {faculties.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">Belum ada data Fakultas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
