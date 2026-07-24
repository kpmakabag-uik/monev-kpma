"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { deleteInstrument } from "@/app/actions/master";

interface Instrument {
  id: string;
  name: string;
  category: string;
  jenjang_peruntukan: string;
  questions: string;
}

export default function MasterInstrumentTable({ instruments }: { instruments: Instrument[] }) {
  const [search, setSearch] = useState("");

  const filtered = instruments.filter(inst => 
    inst.id.toLowerCase().includes(search.toLowerCase()) ||
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.category.toLowerCase().includes(search.toLowerCase()) ||
    inst.jenjang_peruntukan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-bold text-gray-800 tracking-tight">Daftar Tabel Instrumen</h3>
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input
            type="text"
            placeholder="Cari Kode, Jenjang, atau Kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-institusi focus:border-institusi text-sm transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100/50 text-xs text-gray-900 border-b border-gray-200">
              <th className="p-4 font-bold w-32">Kode</th>
              <th className="p-4 font-bold w-32">Jenjang</th>
              <th className="p-4 font-bold w-48">Kategori</th>
              <th className="p-4 font-bold">Nama Tabel</th>
              <th className="p-4 font-bold w-32 text-center">Jml Sub</th>
              <th className="p-4 font-bold w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map((inst) => {
                let questionsLength = 0;
                try {
                  const arr = JSON.parse(inst.questions || "[]");
                  if (Array.isArray(arr)) questionsLength = arr.length;
                } catch {
                  // Ignore parse error
                }

                return (
                  <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-gray-900">{inst.id}</td>
                    <td className="p-4 text-xs font-bold text-blue-600 uppercase">{inst.jenjang_peruntukan}</td>
                    <td className="p-4 text-xs font-bold text-gray-500 uppercase tracking-tighter">{inst.category}</td>
                    <td className="p-4 text-sm font-semibold text-gray-900">{inst.name}</td>
                    <td className="p-4 text-sm text-gray-600 text-center">{questionsLength}</td>
                    <td className="p-4 text-sm flex justify-center items-center gap-3">
                      <Link href={`/master/instruments/${inst.id}`} className="text-blue-500 hover:text-blue-700">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </Link>
                      <DeleteButton id={inst.id} deleteAction={deleteInstrument} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-medium">Tidak ada instrumen yang cocok dengan &quot;{search}&quot;</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

