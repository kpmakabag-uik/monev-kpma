import { updateProdi } from "@/app/actions/master";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProdi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prodi = await prisma.prodi.findUnique({ where: { id } });
  if (!prodi) notFound();

  const faculties = await prisma.faculty.findMany();
  const levels = await prisma.level.findMany({ orderBy: { name: "asc" } });
  const updateAction = updateProdi.bind(null, prodi.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/master/prodi" className="text-gray-500 hover:text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Ubah Prodi</h1>
      </div>

      <form action={updateAction} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Program Studi</label>
          <input required name="name" defaultValue={prodi.name} type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang</label>
          <select required name="jenjang" defaultValue={prodi.jenjang} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi">
            {levels.map(l => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas Induk</label>
          <select required name="facultyId" defaultValue={prodi.facultyId} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi">
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-institusi text-white px-6 py-2.5 rounded-lg shadow-sm font-medium hover:bg-blue-800 transition-all">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
