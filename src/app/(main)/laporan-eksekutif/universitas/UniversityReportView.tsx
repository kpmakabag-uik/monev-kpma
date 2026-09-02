"use client";

import { useMemo } from "react";

interface UniversityReportViewProps {
  data: {
    cycleName: string;
    totalProdiEvaluasi: number;
    avgScoreUniversity: number;
    countKritis: number;
    countKurang: number;
    countCukupSgtBaik: number;
    prodiScores: {
      id: string;
      name: string;
      jenjang: string;
      facultyName: string;
      score: number;
      kategori: string;
    }[];
    klasterData: {
      name: string;
      avgScore: number;
      prodiZero: number;
      totalApplicable: number;
    }[];
    rekomendasi: {
      title: string;
      text: string;
    }[];
  };
}

export default function UniversityReportView({ data }: UniversityReportViewProps) {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getKategoriColor = (kat: string) => {
    switch(kat) {
      case "Sgt.Baik": return "bg-[#15803d] text-white";
      case "Baik": return "bg-[#22c55e] text-white";
      case "Cukup": return "bg-[#eab308] text-white";
      case "Kurang": return "bg-[#f97316] text-white";
      case "Kritis": return "bg-[#ef4444] text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  // Split prodi list into two columns for the table
  const half = Math.ceil(data.prodiScores.length / 2);
  const leftProdis = data.prodiScores.slice(0, half);
  const rightProdis = data.prodiScores.slice(half);

  // Format data for chart
  const chartData = data.klasterData.map(k => ({
    name: k.name,
    score: parseFloat(k.avgScore.toFixed(1)),
    prodi0: `${k.prodiZero}/${k.totalApplicable}`
  }));

  return (
    <div className="w-full bg-white p-6 print:p-0 text-gray-800 font-sans text-sm">
      
      {/* KOP Header */}
      <img src="/kop-kpma.png" alt="KOP KPMA UIKA" className="w-full h-auto mb-3 print:mb-1.5 border-b-[3px] border-gray-900 pb-1.5" />

      {/* Header */}
      <div className="bg-[#1e293b] text-white p-3 print:p-2 flex justify-between items-center mb-1">
        <div>
          <h1 className="text-lg print:text-base font-bold uppercase tracking-wide">
            LAPORAN EKSEKUTIF HASIL MONITORING & EVALUASI (MONEV) INTERNAL
          </h1>
          <p className="text-[11px] print:text-[9px] text-gray-300 mt-0.5">
            Program Studi di lingkungan Universitas Ibn Khaldun (UIKA) Bogor | Siklus {data.cycleName} | Untuk perhatian: <span className="font-bold text-white">Rektor UIKA Bogor</span> | Dicetak: {currentDate}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => window.print()}
            className="print:hidden flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded shadow-sm text-xs font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Cetak PDF
          </button>
          <div className="bg-gray-100 text-[#1e293b] font-bold text-xs px-3 py-1 text-center leading-tight">
            KPMA UIKA<br/>BOGOR
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-1 text-center text-white mb-3 print:mb-1.5">
        <div className="bg-[#1e293b] p-2 print:p-1.5 flex flex-col justify-center">
          <div className="text-2xl print:text-xl font-bold">{data.avgScoreUniversity.toFixed(1)}%</div>
          <div className="text-[9px] print:text-[8px] uppercase mt-0.5 opacity-80 leading-tight">Rata-rata Skor<br/>Terverifikasi Universitas</div>
        </div>
        <div className="bg-[#2a3a5c] p-2 print:p-1.5 flex flex-col justify-center">
          <div className="text-2xl print:text-xl font-bold">{data.totalProdiEvaluasi} <span className="text-xs font-normal">/ {data.prodiScores.length}</span></div>
          <div className="text-[9px] print:text-[8px] uppercase mt-0.5 opacity-80 leading-tight">Prodi Berpartisipasi<br/>(Mengisi Evaluasi Diri)</div>
        </div>
        <div className="bg-[#dc2626] p-3 flex flex-col justify-center">
          <div className="text-3xl font-bold">{data.countKritis}</div>
          <div className="text-[9px] uppercase mt-1 opacity-90">Prodi Kategori Kritis<br/>(≤20%) - {Math.round((data.countKritis/data.totalProdiEvaluasi)*100)}% dari total</div>
        </div>
        <div className="bg-[#f97316] p-3 flex flex-col justify-center">
          <div className="text-3xl font-bold">{data.countKurang}</div>
          <div className="text-[9px] uppercase mt-1 opacity-90">Prodi Kategori Kurang<br/>(21–40%)</div>
        </div>
        <div className="bg-[#16a34a] p-3 flex flex-col justify-center">
          <div className="text-3xl font-bold">{data.countCukupSgtBaik}</div>
          <div className="text-[9px] uppercase mt-1 opacity-90">Prodi Kategori Cukup<br/>S.D. Sangat Baik (≥41%)</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column - Rankings */}
        <div className="col-span-12 lg:col-span-6">
          <h2 className="font-bold text-[13px] text-gray-800 uppercase mb-2">
            PERINGKAT SELURUH PROGRAM STUDI — SKOR KESESUAIAN TERVERIFIKASI
          </h2>
          
          <div className="flex gap-2">
            {/* Left half of table */}
            <div className="w-1/2">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead className="bg-[#1e293b] text-white">
                  <tr>
                    <th className="py-1 px-2 w-6 text-center">#</th>
                    <th className="py-1 px-2">Program Studi</th>
                    <th className="py-1 px-1">Fak.</th>
                    <th className="py-1 px-2 text-right">Skor</th>
                    <th className="py-1 px-2 text-center w-14">Ktg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border border-gray-200">
                  {leftProdis.map((p, idx) => (
                    <tr key={p.id} className="bg-gray-50/50">
                      <td className="py-1 px-2 text-center text-gray-500">{idx + 1}</td>
                      <td className="py-1 px-2 truncate max-w-[120px]" title={`${p.jenjang} ${p.name}`}>{p.jenjang} {p.name}</td>
                      <td className="py-1 px-1 text-gray-500 truncate max-w-[40px]" title={p.facultyName}>{p.facultyName.replace('Fakultas ', 'F.')}</td>
                      <td className="py-1 px-2 text-right font-bold">{p.score.toFixed(1)}%</td>
                      <td className={`py-1 px-1 text-center font-bold text-[9px] ${getKategoriColor(p.kategori)}`}>
                        {p.kategori}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right half of table */}
            <div className="w-1/2">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead className="bg-[#1e293b] text-white">
                  <tr>
                    <th className="py-1 px-2 w-6 text-center">#</th>
                    <th className="py-1 px-2">Program Studi</th>
                    <th className="py-1 px-1">Fak.</th>
                    <th className="py-1 px-2 text-right">Skor</th>
                    <th className="py-1 px-2 text-center w-14">Ktg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border border-gray-200">
                  {rightProdis.map((p, idx) => (
                    <tr key={p.id} className="bg-gray-50/50">
                      <td className="py-1 px-2 text-center text-gray-500">{idx + half + 1}</td>
                      <td className="py-1 px-2 truncate max-w-[120px]" title={`${p.jenjang} ${p.name}`}>{p.jenjang} {p.name}</td>
                      <td className="py-1 px-1 text-gray-500 truncate max-w-[40px]" title={p.facultyName}>{p.facultyName.replace('Fakultas ', 'F.')}</td>
                      <td className="py-1 px-2 text-right font-bold">{p.score.toFixed(1)}%</td>
                      <td className={`py-1 px-1 text-center font-bold text-[9px] ${getKategoriColor(p.kategori)}`}>
                        {p.kategori}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[9px] text-gray-500 mt-2 italic">
            *Instrumen belum terisi penuh (cakupan &lt;9 klaster) — skor tidak sepenuhnya sebanding. 
          </p>
        </div>

        {/* Right Column - Charts & Recommendations */}
        <div className="col-span-12 lg:col-span-6 flex flex-col">
          
          {/* Klaster Chart */}
          <div className="mb-6 print:break-inside-avoid">
            <h2 className="font-bold text-[13px] text-[#1e293b] uppercase mb-2">
              KESENJANGAN SISTEMIK ANTAR-KLASTER MUTU <span className="normal-case text-gray-500 font-normal">(rata-rata {data.totalProdiEvaluasi} prodi berinstrumen setara)</span>
            </h2>
            <div className="bg-gray-50 border border-gray-200 p-2">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead className="bg-[#e2e8f0] text-[#1e293b]">
                  <tr>
                    <th className="py-1.5 px-2 font-bold w-1/3">Klaster</th>
                    <th className="py-1.5 px-2 font-bold w-1/2">Rerata Skor</th>
                    <th className="py-1.5 px-2 font-bold text-right">Prodi 0%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {chartData.map((k, i) => (
                    <tr key={i} className="hover:bg-gray-100">
                      <td className="py-1.5 px-2 text-gray-700 font-medium">{k.name}</td>
                      <td className="py-1.5 px-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 font-bold">{k.score}%</span>
                          <div className="w-full bg-gray-200 h-2.5 rounded-sm flex-1">
                            <div className="bg-[#ea580c] h-2.5 rounded-sm" style={{ width: `${k.score}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-right text-gray-500">{k.prodi0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="print:break-inside-avoid">
            <h2 className="font-bold text-[13px] text-[#1e293b] uppercase mb-2">
              REKOMENDASI STRATEGIS UNTUK REKTOR
            </h2>
            <div className="space-y-3 pl-1">
              {data.rekomendasi.map((rek, idx) => (
                <div key={idx}>
                  <div className="font-bold text-[#1e293b] text-[11px]">
                    {idx + 1}. {rek.title}
                  </div>
                  <div className="text-gray-600 text-[10.5px] leading-snug mt-0.5 text-justify">
                    {rek.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 border-t border-gray-300 pt-2 text-[8px] text-gray-400 text-justify leading-tight">
        Metodologi: skor kesesuaian terverifikasi dihitung dari butir bukti dokumen yang telah dikonfirmasi auditor terhadap total butir instrumen Monev. Status "Ya (Bukti Belum Diunggah)" dihitung belum sesuai sampai verifikasi. Sumber: Resume Hasil Monev Internal KPMA UIKA Bogor, Siklus {data.cycleName} (dicetak {currentDate}). Disiapkan untuk telaah Rektor UIKA Bogor.
      </div>
      
    </div>
  );
}
