import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import { deleteProdi } from "@/app/actions/master";

export default async function ProdiPage() {
  const session = await auth();
  if (session?.user?.role !== "KPMA") redirect("/dashboard");
  const prodis = await prisma.prodi.findMany({ include: { faculty: true } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Program Studi</h1>
          <p className="text-gray-500 mt-1">Daftar Program Studi beserta Fakultas dan Jenjang.</p>
        </div>
        <Link href="/master/prodi/new" className="bg-institusi hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow text-sm font-medium transition-all">
          + Tambah Prodi
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-semibold">Nama Program Studi</th>
              <th className="p-4 font-semibold w-56">Fakultas</th>
              <th className="p-4 font-semibold w-32">Jenjang</th>
              <th className="p-4 font-semibold text-right w-40">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prodis.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-semibold text-gray-900">{p.name}</td>
                <td className="p-4 text-sm text-gray-600">{p.faculty.name}</td>
                <td className="p-4 text-sm text-gray-500">
                  <span className="bg-blue-50 text-institusi px-2 py-1 rounded-md text-xs font-semibold">{p.jenjang}</span>
                </td>
                <td className="p-4 text-sm text-right">
                  <Link href={`/master/prodi/${p.id}`} className="text-institusi hover:text-blue-800 font-medium mr-4">Edit</Link>
                  <DeleteButton id={p.id} deleteAction={deleteProdi} />
                </td>
              </tr>
            ))}
            {prodis.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada data Prodi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
