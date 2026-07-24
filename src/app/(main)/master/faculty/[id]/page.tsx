import { updateFaculty } from "@/app/actions/master";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditFaculty({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faculty = await prisma.faculty.findUnique({ where: { id } });
  if (!faculty) notFound();

  // We bind the id to the action so it passes directly when form is submitted
  const updateAction = updateFaculty.bind(null, faculty.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/master/faculty" className="text-gray-500 hover:text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Ubah Fakultas</h1>
      </div>

      <form action={updateAction} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Fakultas</label>
          <input required name="name" defaultValue={faculty.name} type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi" />
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
