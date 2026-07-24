"use client";

import { useState } from "react";
import Link from "next/link";

interface Instrument {
  id: string;
  name: string;
  category: string;
  jenjang_peruntukan: string;
}

export default function InstrumentTable({ 
  instruments, 
  prodiId 
}: { 
  instruments: Instrument[], 
  prodiId: string 
}) {
  const [search, setSearch] = useState("");

  const filtered = instruments.filter(inst => 
    inst.id.toLowerCase().includes(search.toLowerCase()) ||
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Header with Filter */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-bold text-gray-800">Daftar Tabel Instrumen</h3>
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input
            type="text"
            placeholder="Cari Kode atau Nama Tabel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-institusi focus:border-institusi text-sm transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/30 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-semibold w-24">Tabel</th>
              <th className="p-4 font-semibold">Nama Tabel Instrumen</th>
              <th className="p-4 font-semibold w-40">Peruntukan</th>
              <th className="p-4 font-semibold w-32 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map((inst) => (
                <tr key={inst.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 text-sm font-bold text-institusi align-middle">{inst.id}</td>
                  <td className="p-4 text-sm text-gray-700 align-middle">
                    <div className="font-semibold text-gray-900">{inst.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-tighter">{inst.category}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-500 align-middle">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold">
                      {inst.jenjang_peruntukan}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right align-middle">
                    <Link 
                      href={`/monev/${prodiId}/${encodeURIComponent(inst.id)}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-institusi hover:bg-blue-800 shadow-sm transition-all whitespace-nowrap"
                    >
                      Buka Form
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-medium">Tidak ada instrumen yang cocok dengan &quot;{search}&quot;</p>
                  <button onClick={() => setSearch("")} className="text-institusi mt-2 text-sm font-semibold hover:underline">Hapus Filter</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

