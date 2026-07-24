import { createFaculty } from "@/app/actions/master";
import Link from "next/link";

export default function NewFaculty() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/master/faculty" className="text-gray-500 hover:text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Tambah Fakultas Baru</h1>
      </div>

      <form action={createFaculty} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Fakultas</label>
          <input required name="name" type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi" placeholder="Contoh: Fakultas Ilmu Komputer" />
        </div>
        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-institusi text-white px-6 py-2.5 rounded-lg shadow-sm font-medium hover:bg-blue-800 transition-all">
            Simpan Fakultas
          </button>
        </div>
      </form>
    </div>
  );
}
