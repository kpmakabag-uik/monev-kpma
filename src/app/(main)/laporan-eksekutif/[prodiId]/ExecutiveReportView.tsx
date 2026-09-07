"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ExecutiveReportViewProps {
  data: {
    prodiName: string;
    jenjang: string;
    facultyName: string;
    cycleName: string;
    totalIndikator: number;
    totalKlaimYa: number;
    totalTerverifikasi: number;
    persenTerverifikasi: number;
    persenKlaim: number;
    persenEvaluasiDiri: number;
    totalEvaluasiDiri: number;
    gapKlaim: number;
    klasterData: {
      name: string;
      total: number;
      verified: number;
      score: number;
      text: string;
    }[];
    temuanUtama: string[];
    rekomendasi: string[];
    manualNotes: string[];
    isAnalysisPublished?: boolean;
  };
}

export default function ExecutiveReportView({ data }: ExecutiveReportViewProps) {
  // We no longer need donutData for Recharts since we're using pure SVG
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.persenTerverifikasi / 100) * circumference;

  // Setup data for gap bar chart
  const gapData = [
    {
      name: "Klaim 'Ya' oleh Program Studi",
      value: data.persenKlaim,
      label: `${data.persenKlaim.toFixed(1)}% (${data.totalKlaimYa}/${data.totalIndikator})`,
      fill: "#60a5fa", // blue-400
    },
    {
      name: "Evaluasi Diri (Keterangan Terisi)",
      value: data.persenEvaluasiDiri,
      label: `${data.persenEvaluasiDiri.toFixed(1)}% (${data.totalEvaluasiDiri}/${data.totalIndikator})`,
      fill: "#f59e0b", // amber-500
    },
    {
      name: "Terverifikasi Auditor (ada bukti)",
      value: data.persenTerverifikasi,
      label: `${data.persenTerverifikasi.toFixed(1)}% (${data.totalTerverifikasi}/${data.totalIndikator})`,
      fill: "#ef4444", // red-500
    },
  ];

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getKlasterColor = (score: number) => {
    if (score <= 20) return "#ef4444"; // red
    if (score <= 40) return "#f97316"; // orange
    if (score <= 60) return "#eab308"; // yellow
    if (score <= 80) return "#22c55e"; // green
    return "#15803d"; // dark green
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen p-8 print:p-0 print:bg-white text-gray-800 font-sans print:text-xs print:h-auto print:overflow-visible print:flex print:flex-col print:max-w-none print:w-full print-fit-page">
      {/* KOP Header */}
      <img src="/kop-kpma.png" alt="KOP KPMA UIKA" className="w-full h-auto mb-2 print:mb-1 border-b-[3px] print:border-b-2 border-gray-900 pb-1" />

      {/* Title Area */}
      <div className="flex justify-between items-start border-b-2 border-gray-300 pb-3 mb-4 print:pb-1.5 print:mb-2">
        <div>
          <h1 className="text-xl print:text-[16px] font-bold text-[#1e293b] print:leading-tight">
            Resume Hasil Monitoring & Evaluasi (Monev) Internal
          </h1>
          <h2 className="text-sm print:text-xs font-bold text-gray-800 mt-1 print:mt-0">
            Program Studi {data.jenjang} {data.prodiName} — {data.facultyName}
          </h2>
          <p className="text-xs print:text-[10px] text-gray-500 mt-0.5 print:mt-0">
            Universitas Ibn Khaldun (UIKA) Bogor · Siklus {data.cycleName}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="print:hidden flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded shadow-sm text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Cetak PDF (A4)
            </button>
            {data.isAnalysisPublished ? (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Terbit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Draft
              </span>
            )}
            <div className="bg-[#2a3042] text-white px-4 py-1.5 font-bold text-sm rounded shadow-sm flex items-center">
              KPMA UIKA BOGOR
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Dicetak: {currentDate}</p>
          <p className="text-xs text-gray-500">Total Indikator Dinilai: {data.totalIndikator} butir</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12 gap-4 print:gap-2">
        {/* Left Column - Donut Chart (3 cols) */}
        <div className="lg:col-span-4 print:col-span-4 bg-[#1e293b] rounded-lg shadow-sm p-4 print:p-2 flex flex-col items-center justify-center text-white relative">
          <div className="h-48 print:h-24 w-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-48 h-48 print:w-24 print:h-24 transform -rotate-90 overflow-visible">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#334155" strokeWidth="15" />
              <circle 
                cx="50" cy="50" r={radius} fill="none" stroke="#ef4444" strokeWidth="15"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
              />
            </svg>
          </div>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none" style={{ top: "35%" }}>
            <span className="text-2xl print:text-xl font-bold leading-none">{data.persenTerverifikasi.toFixed(1)}%</span>
            <span className="text-[9px] print:text-[8px] uppercase tracking-wider text-gray-300 mt-0.5">Terverifikasi</span>
          </div>

          <div className="mt-1 text-center w-full">
            <div className="bg-red-500/20 text-red-400 font-bold py-1 px-4 rounded text-xs print:text-[8px] mb-1 print:mb-0.5 inline-block">
              {data.persenTerverifikasi < 40 ? "SANGAT KURANG / KRITIS" : "PERLU PERBAIKAN"}
            </div>
            <p className="text-[10px] print:text-[7.5px] text-gray-400 leading-tight print:leading-[1.1]">
              Skor akumulatif kesesuaian seluruh butir Monev<br className="hidden print:block"/>
              berdasarkan bukti dokumen diverifikasi auditor
            </p>
          </div>
        </div>

        {/* Right Column - Gap & Stats (8 cols) */}
        <div className="lg:col-span-8 print:col-span-8 flex flex-col gap-3 print:gap-1.5">
          {/* Gap Chart Box */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 print:p-2.5">
            <h3 className="font-bold text-gray-800 mb-3 print:mb-1.5 text-sm print:text-xs">Kesenjangan Klaim Prodi vs. Bukti Terverifikasi</h3>
            
            <div className="space-y-3 print:space-y-1">
              {gapData.map((item, idx) => (
                <div key={idx} className="flex items-center text-xs print:text-[10px]">
                  <div className="w-1/3 text-gray-600 pr-2 truncate">{item.name}</div>
                  <div className="w-1/2 bg-gray-100 rounded h-4 print:h-2.5 relative">
                    <div 
                      className="h-full rounded absolute left-0 top-0 transition-all duration-500" 
                      style={{ width: `${item.value}%`, backgroundColor: item.fill }}
                    />
                  </div>
                  <div className="w-1/6 text-right font-semibold text-gray-800">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {data.gapKlaim > 0 && (
              <div className="mt-3 print:mt-1.5 bg-red-50 border-l-4 border-red-500 p-2 text-[11px] print:text-[9px] text-red-800 rounded-r-md leading-tight">
                Sebanyak <span className="font-bold">{data.totalKlaimYa} butir</span> diklaim "Ya", namun hanya <span className="font-bold">{data.totalEvaluasiDiri} butir</span> yang disertai catatan evaluasi diri, dan <span className="font-bold">{data.totalTerverifikasi} butir</span> yang memiliki bukti dokumen terlampir. Hal ini mengindikasikan pengisian instrumen belum didukung oleh penjabaran evaluasi dan dokumentasi yang memadai.
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 print:gap-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 text-center flex flex-col justify-center">
              <div className="text-xl print:text-lg font-bold text-gray-800">{data.totalTerverifikasi}</div>
              <div className="text-[9px] print:text-[8px] text-gray-500 mt-0.5 leading-tight">Butir Terverifikasi<br/>Sesuai</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 text-center flex flex-col justify-center">
              <div className="text-xl print:text-lg font-bold text-gray-800">{data.totalIndikator - data.totalTerverifikasi}</div>
              <div className="text-[9px] print:text-[8px] text-gray-500 mt-0.5 leading-tight">Butir Belum Sesuai /<br/>Belum Terverifikasi</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 text-center flex flex-col justify-center">
              <div className="text-xl print:text-lg font-bold text-gray-800">{data.klasterData.filter(k => k.score === 0).length}</div>
              <div className="text-[9px] print:text-[8px] text-gray-500 mt-0.5 leading-tight">Klaster dengan Skor<br/>0% Terverifikasi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Scores */}
      <div className="mt-3 print:mt-1.5 bg-white border border-gray-200 rounded-lg shadow-sm p-4 print:p-2">
        <h3 className="font-bold text-gray-800 text-sm print:text-xs mb-3 print:mb-1 flex items-center border-l-4 border-[#1e293b] pl-2">
          Skor Kesesuaian per Klaster Mutu ({data.klasterData.length} Klaster Tematik)
        </h3>

        <div className="space-y-3 print:space-y-1.5">
          {data.klasterData.map((klaster, idx) => (
            <div key={idx} className="flex items-center text-xs print:text-[9px]">
              <div className="w-1/3 text-gray-700 pr-2 truncate">{klaster.name}</div>
              <div className="w-7/12 bg-gray-100 h-2.5 print:h-2 relative rounded">
                <div 
                  className="h-full absolute left-0 top-0 rounded transition-all duration-500" 
                  style={{ 
                    width: `${klaster.score}%`,
                    backgroundColor: getKlasterColor(klaster.score)
                  }}
                />
              </div>
              <div className="w-1/12 text-right font-bold text-gray-800 whitespace-nowrap">
                {klaster.score.toFixed(1)}% <span className="text-gray-400 font-normal">({klaster.verified}/{klaster.total})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 print:mt-1.5 pt-2 border-t border-gray-100 text-[9px] print:text-[8px] text-gray-500">
          <div className="flex items-center"><span className="w-3 h-3 bg-[#ef4444] inline-block mr-1 rounded-sm"/> 0–20% Kritis</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-[#f97316] inline-block mr-1 rounded-sm"/> 21–40% Kurang</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-[#eab308] inline-block mr-1 rounded-sm"/> 41–60% Cukup</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-[#22c55e] inline-block mr-1 rounded-sm"/> 61–80% Baik</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-[#15803d] inline-block mr-1 rounded-sm"/> 81–100% Sangat Baik</div>
        </div>
      </div>

      {/* Findings and Recommendations */}
      <div className="mt-3 print:mt-1.5 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3">
        {/* Temuan */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 print:p-2.5">
          <h3 className="font-bold text-gray-800 text-sm print:text-xs mb-2 border-b pb-1">Temuan Utama</h3>
          <ul className="list-decimal pl-4 space-y-1.5 print:space-y-1 text-xs print:text-[9px] text-gray-700">
            {data.temuanUtama.map((temuan, idx) => (
              <li key={idx} className="pl-1 leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: temuan.replace(/"Ya"/g, '<strong>"Ya"</strong>').replace(/0%/g, '<strong>0%</strong>') }} />
              </li>
            ))}
          </ul>
        </div>

        {/* Rekomendasi */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 print:p-2.5">
          <h3 className="font-bold text-gray-800 text-sm print:text-xs mb-2 border-b pb-1">Rekomendasi Prioritas</h3>
          <ul className="list-decimal pl-4 space-y-1.5 print:space-y-1 text-xs print:text-[9px] text-gray-700">
            {data.rekomendasi.map((rek, idx) => (
              <li key={idx} className="pl-1 leading-relaxed">
                <span dangerouslySetInnerHTML={{ 
                  __html: rek.includes(':') 
                    ? `<strong>${rek.split(':')[0]}:</strong>${rek.split(':').slice(1).join(':')}`
                    : rek 
                }} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto print:mt-2 flex items-end border-t border-gray-300 pt-2 text-[10px] print:text-[8px] text-gray-500">
        <div className="flex-1 pr-4">
          Skor dihitung dari perbandingan jumlah butir dengan Kesesuaian "Ya" (terverifikasi bukti) terhadap total {data.totalIndikator} butir indikator pada instrumen Monev. Butir berstatus "Ya (Bukti Belum Diunggah)" dihitung sebagai belum sesuai sampai bukti diverifikasi. Data bersumber dari Laporan Monev {data.prodiName} Siklus {data.cycleName}.
        </div>
        <div className="text-center pb-4 print:pb-0 w-48">
          <p className="mb-12">Disetujui oleh,</p>
          <div className="border-b border-gray-400 w-full mb-2"></div>
          <p className="text-gray-800 font-semibold">Kepala KPMA / Auditor</p>
        </div>
      </div>
    </div>
  );
}
