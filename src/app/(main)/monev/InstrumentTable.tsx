"use client";

import { useState } from "react";
import Link from "next/link";

export interface InstrumentWithProgress {
  id: string;
  name: string;
  category: string;
  jenjang_peruntukan: string;
  totalItems: number;
  filledItems: number;
  totalKlaimYa: number;
  uploadedBukti: number;
  filledKeterangan: number;
  verifiedItems: number;
  sesuaiItems: number;
}

export default function InstrumentTable({ 
  instruments, 
  prodiId,
  userRole,
  isLocked = false
}: { 
  instruments: InstrumentWithProgress[], 
  prodiId: string,
  userRole?: string | null,
  isLocked?: boolean
}) {
  const [search, setSearch] = useState("");

  const filtered = instruments.filter(inst => 
    inst.id.toLowerCase().includes(search.toLowerCase()) ||
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.category.toLowerCase().includes(search.toLowerCase())
  );

  const isAuditor = userRole === "KPMA" || userRole === "PIMPINAN_UNIVERSITAS" || userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS";

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
              <th className="p-4 font-semibold w-20">Tabel</th>
              <th className="p-4 font-semibold">Nama Tabel Instrumen</th>
              <th className="p-4 font-semibold w-48">Progres Prodi</th>
              <th className="p-4 font-semibold w-48">Status Verifikasi</th>
              <th className="p-4 font-semibold w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map((inst) => {
                // Progress Pengisian
                const percentFill = inst.totalItems > 0 ? Math.round((inst.filledItems / inst.totalItems) * 100) : 0;
                let colorFill = "bg-red-500";
                if (percentFill >= 100) colorFill = "bg-green-500";
                else if (percentFill >= 50) colorFill = "bg-yellow-500";
                
                // Progress Keterangan (Dihitung dari total soal)
                const percentKet = inst.totalItems > 0 ? Math.round((inst.filledKeterangan / inst.totalItems) * 100) : 0;
                let colorKet = "bg-red-500";
                if (percentKet >= 100) colorKet = "bg-orange-500";
                else if (percentKet >= 50) colorKet = "bg-yellow-500";

                // Progress Bukti (Hanya dihitung dari butir yang diklaim 'Ya')
                const percentBukti = inst.totalKlaimYa > 0 ? Math.round((inst.uploadedBukti / inst.totalKlaimYa) * 100) : 0;
                let colorBukti = "bg-red-500";
                if (percentBukti >= 100) colorBukti = "bg-blue-500";
                else if (percentBukti >= 50) colorBukti = "bg-yellow-500";

                // Progress Verifikasi
                const percentVerif = inst.totalItems > 0 ? Math.round((inst.verifiedItems / inst.totalItems) * 100) : 0;
                let colorVerif = "bg-red-400";
                if (percentVerif >= 100) colorVerif = "bg-purple-500";
                else if (percentVerif >= 50) colorVerif = "bg-yellow-400";

                // Skor Kesesuaian (Dari yang sudah diverifikasi Sesuai vs Total)
                const percentSesuai = inst.totalItems > 0 ? Math.round((inst.sesuaiItems / inst.totalItems) * 100) : 0;
                
                return (
                <tr key={inst.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 text-sm font-bold text-institusi align-middle">{inst.id}</td>
                  <td className="p-4 text-sm text-gray-700 align-middle">
                    <div className="font-semibold text-gray-900">{inst.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-tighter">{inst.category}</div>
                    <div className="mt-1">
                      <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        {inst.jenjang_peruntukan}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="space-y-3">
                      {/* Bar Pengisian */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-medium text-gray-600">Pengisian</span>
                          <span className="font-bold">{percentFill}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${colorFill}`} style={{ width: `${percentFill}%` }}></div>
                        </div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{inst.filledItems} / {inst.totalItems} butir</div>
                      </div>

                      {/* Bar Keterangan */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-medium text-gray-600">Keterangan / Temuan</span>
                          <span className="font-bold">{percentKet}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${colorKet}`} style={{ width: `${percentKet}%` }}></div>
                        </div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{inst.filledKeterangan} / {inst.totalItems} butir terisi valid</div>
                      </div>

                      {/* Bar Bukti (Tampil jika ada klaim Ya) */}
                      {inst.totalKlaimYa > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="font-medium text-gray-600">Bukti Terunggah</span>
                            <span className="font-bold">{percentBukti}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${colorBukti}`} style={{ width: `${percentBukti}%` }}></div>
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5">{inst.uploadedBukti} / {inst.totalKlaimYa} klaim 'Ya'</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {/* Verifikasi Auditor */}
                    <div className="space-y-2">
                      {/* Tampilkan verifikasi jika auditor ATAU jika sudah ada verifikasi */}
                      {(isAuditor || inst.verifiedItems > 0) ? (
                        <>
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-medium text-gray-600">Verifikasi Auditor</span>
                              <span className="font-bold">{percentVerif}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${colorVerif}`} style={{ width: `${percentVerif}%` }}></div>
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5">{inst.verifiedItems} / {inst.totalItems} diverifikasi</div>
                          </div>
                          
                          {inst.verifiedItems > 0 && (
                            <div className="pt-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${percentSesuai >= 80 ? 'bg-green-100 text-green-700' : percentSesuai >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                Skor Sementara: {percentSesuai}% Sesuai
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[10px] text-gray-400 italic">Belum diverifikasi</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-right align-middle">
                    <Link 
                      href={`/monev/${prodiId}/${encodeURIComponent(inst.id)}`}
                      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md shadow-sm transition-all whitespace-nowrap ${
                        isLocked && !isAuditor
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                          : "text-white bg-institusi hover:bg-blue-800"
                      }`}
                    >
                      {isLocked && !isAuditor ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                          <span>Lihat Form</span>
                        </>
                      ) : (
                        <span>Buka Form</span>
                      )}
                    </Link>
                  </td>
                </tr>
              )})
            ) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500">
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

