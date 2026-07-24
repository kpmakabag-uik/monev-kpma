import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import { deleteLevel, createLevel } from "@/app/actions/level";

export default async function JenjangPage() {
  const session = await auth();
  if (session?.user?.role !== "KPMA") redirect("/dashboard");
  const levels = await prisma.level.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Jenjang Pendidikan</h1>
          <p className="text-gray-500 mt-1">Daftar referensi jenjang yang tersedia untuk Prodi dan Instrumen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Tambah Jenjang Baru</h3>
          <form action={createLevel} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jenjang</label>
              <input 
                name="name" 
                type="text" 
                placeholder="Contoh: S1, D3, Profesi" 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-institusi focus:border-institusi outline-none transition-all"
              />
            </div>
            <button type="submit" className="w-full bg-institusi hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition-all shadow-md">
              Simpan Jenjang
            </button>
          </form>
        </div>

        {/* Tabel Daftar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Nama Jenjang</th>
                <th className="p-4 font-semibold text-right w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {levels.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-gray-900">
                    <span className="bg-blue-50 text-institusi px-3 py-1 rounded-full text-xs font-bold uppercase">{l.name}</span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <DeleteButton id={l.id} deleteAction={deleteLevel} />
                  </td>
                </tr>
              ))}
              {levels.length === 0 && (
                <tr><td colSpan={2} className="p-8 text-center text-gray-500">Belum ada data jenjang.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
