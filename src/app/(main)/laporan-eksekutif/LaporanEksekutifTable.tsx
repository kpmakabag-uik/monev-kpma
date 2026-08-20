"use client";

import { useState } from "react";
import Link from "next/link";
export default function LaporanEksekutifTable({ prodis, activeCycle, userRole }: any) {
  const [filterFakultas, setFilterFakultas] = useState("");
  const [filterProdi, setFilterProdi] = useState("");

  const filteredProdis = prodis.filter((prodi: any) => {
    const matchFakultas = prodi.faculty.name.toLowerCase().includes(filterFakultas.toLowerCase());
    const matchProdi = prodi.name.toLowerCase().includes(filterProdi.toLowerCase());
    return matchFakultas && matchProdi;
  });

  return (
    <div className="w-full">
      {(userRole === "KPMA" || userRole === "PIMPINAN_UNIVERSITAS" || userRole === "PIMPINAN_FAKULTAS") && (
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <Link 
            href="/laporan-eksekutif/all" 
            target="_blank"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Cetak Semua Prodi (PDF)
          </Link>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
          <tr>
            <th className="px-6 py-4 w-1/3">
              Fakultas
              <input 
                type="text" 
                placeholder="Cari Fakultas..." 
                className="mt-2 w-full p-2 border border-gray-200 rounded-md font-normal text-xs normal-case"
                value={filterFakultas}
                onChange={(e) => setFilterFakultas(e.target.value)}
              />
            </th>
            <th className="px-6 py-4 w-1/3">
              Program Studi
              <input 
                type="text" 
                placeholder="Cari Program Studi..." 
                className="mt-2 w-full p-2 border border-gray-200 rounded-md font-normal text-xs normal-case"
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
              />
            </th>
            <th className="px-6 py-4">Siklus Aktif</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredProdis.map((prodi: any) => (
            <tr key={prodi.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{prodi.faculty.name}</td>
              <td className="px-6 py-4 text-gray-600">
                <span className="font-bold text-institusi mr-2">[{prodi.jenjang}]</span>
                {prodi.name}
              </td>
              <td className="px-6 py-4">
                {activeCycle ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {activeCycle.tahun_akademik} - {activeCycle.semester}
                  </span>
                ) : (
                  <span className="text-gray-400">Belum diatur</span>
                )}
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <Link 
                  href={`/laporan-eksekutif/${prodi.id}?tahun=${activeCycle?.tahun_akademik}&semester=${activeCycle?.semester}`}
                  className="inline-flex items-center gap-2 bg-institusi hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Buka Laporan Eksekutif
                </Link>
              </td>
            </tr>
          ))}
          {filteredProdis.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                Tidak ada Program Studi yang ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
