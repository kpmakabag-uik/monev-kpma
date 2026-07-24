import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CycleForm from "./CycleForm";
import DeleteButton from "@/components/DeleteButton";
import { setActiveCycle, deleteCycle } from "@/app/actions/master";

export default async function CyclesPage() {
  const session = await auth();
  if (session?.user?.role !== "KPMA") redirect("/dashboard");

  const cycles = await prisma.cycle.findMany({ orderBy: { tahun_akademik: "desc" } });

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Master Data: Log Siklus</h1>
        <p className="text-gray-500 text-sm mt-1">Mengelola riwayat siklus akademik MONEV</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <span>🕒</span> Riwayat Siklus Pengisian
          </h2>
          <CycleForm />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Tahun Akademik</th>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4 text-center">Status Siklus</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cycles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada siklus yang ditambahkan.
                  </td>
                </tr>
              ) : (
                cycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{cycle.tahun_akademik}</td>
                    <td className="px-6 py-4 text-gray-600">{cycle.semester}</td>
                    <td className="px-6 py-4 text-center">
                      {cycle.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Sedang Berjalan (Aktif)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200">
                          Selesai
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      {!cycle.isActive && (
                        <form action={setActiveCycle.bind(null, cycle.id)} className="inline">
                          <button 
                            type="submit" 
                            className="text-xs bg-institusi text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 font-medium transition-colors shadow-sm"
                          >
                            Set Aktif
                          </button>
                        </form>
                      )}
                      <DeleteButton id={cycle.id} deleteAction={deleteCycle} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
