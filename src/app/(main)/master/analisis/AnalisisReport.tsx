"use client";

import { useMemo, useState, useEffect } from "react";

export default function AnalisisReport({ data, ketuaKpma }: { data: any, ketuaKpma: string }) {
  const { cycle, prodi, instruments, records } = data;

  const [printDate, setPrintDate] = useState("...........................");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const handleScrollToDetail = (id: string) => {
    setHighlightedId(id);
    document.getElementById(`detail-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setPrintDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  const analysisData = useMemo(() => {
    let totalIndikator = 0;
    let totalMemenuhi = 0;
    let totalBelumMemenuhi = 0;

    const recap: any[] = [];
    const details: any[] = [];

    instruments.forEach((inst: any) => {
      let questions = [];
      try {
        questions = JSON.parse(inst.questions || "[]");
      } catch {}

      const record = records.find((r: any) => r.instrumentId === inst.id);
      const answers = record?.parsedAnswers || {};



      let instMemenuhi = 0;
      let instBelum = 0;

      const instDetails = questions.map((q: any) => {
        const ans = answers[q.id] || {};
        
        const isEvalDiriFilled = !!ans.evaluasiDiri && ans.evaluasiDiri.trim() !== "";
        const isCatatanFilled = !!ans.catatanAuditor && ans.catatanAuditor.trim() !== "";
        const isKesesuaianYa = ans.kesesuaianBukti === "Ya" || ans.pilihan === "Ya"; // Fallback to pilihan if kesesuaianBukti is not explicitly set but auditor might have checked it
        // Actually, user strictly said "kesesuaiannya berisi Ya". We'll check kesesuaianBukti first, if empty, maybe pilihan.
        const kesesuaianVal = ans.kesesuaianBukti && ans.kesesuaianBukti !== "-" ? ans.kesesuaianBukti : (ans.pilihan || "-");
        const hasBukti = Array.isArray(ans.buktiLinks) && ans.buktiLinks.length > 0;

        let status = "Memenuhi";
        let missing = [];

        const isEvalDiriRed = !isEvalDiriFilled;
        const isKesesuaianRed = kesesuaianVal !== "Ya";
        const isBuktiRed = !hasBukti;

        if (isEvalDiriRed && isKesesuaianRed && isBuktiRed) {
          missing.push("Indikator belum tercapai");
        } else {
          if (!isEvalDiriFilled) missing.push("Evaluasi diri kosong");
          if (!isCatatanFilled) missing.push("Catatan auditor kosong");
          if (kesesuaianVal !== "Ya") missing.push("Bukti tidak sesuai");
          if (!hasBukti) missing.push("Bukti belum diunggah");
        }

        if (missing.length > 0) {
          status = "Belum Memenuhi";
        }

        if (status === "Memenuhi") {
          instMemenuhi++;
          totalMemenuhi++;
        } else {
          instBelum++;
          totalBelumMemenuhi++;
        }
        totalIndikator++;

        const showGpmNote = status === "Memenuhi" || kesesuaianVal !== "Ya";

        let kesesuaianDisplay = "Tidak ada bukti";
        if (kesesuaianVal === "Ya") kesesuaianDisplay = "Bukti Sesuai";
        else if (kesesuaianVal === "Tidak") kesesuaianDisplay = "Bukti tidak sesuai";

        return {
          id: q.id,
          text: q.text,
          evalDiri: isEvalDiriFilled ? "Terisi" : "Kosong",
          kesesuaian: kesesuaianDisplay,
          bukti: hasBukti ? "Ada" : "Tidak",
          status,
          catatanKpma: missing.length > 0 ? missing.join("; ") : "",
          catatanGpm: showGpmNote && ans.catatanAuditor ? ans.catatanAuditor : "",
        };
      });

      if (questions.length > 0) {
        recap.push({
          id: inst.id,
          name: inst.name,
          memenuhi: instMemenuhi,
          belum: instBelum,
          total: questions.length
        });

        details.push({
          id: inst.id,
          name: inst.name,
          category: inst.category,
          memenuhi: instMemenuhi,
          belum: instBelum,
          total: questions.length,
          questions: instDetails
        });
      }
    });

    return {
      totalIndikator,
      totalMemenuhi,
      totalBelumMemenuhi,
      recap,
      details
    };
  }, [instruments, records]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-end mb-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Print / PDF
        </button>
      </div>

      <div className="print-container text-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase text-blue-900 mb-2">UNIVERSITAS IBN KHALDUN BOGOR</h1>
          <h2 className="text-lg font-bold text-blue-800">ANALISIS KANTOR PENJAMINAN MUTU AKADEMIK (KPMA)</h2>
          <h3 className="text-md text-blue-700">Laporan Monitoring dan Evaluasi (MONEV) Internal</h3>
          <p className="mt-2 text-sm font-medium">
            Program Studi {prodi.jenjang} {prodi.name} — {prodi.faculty?.name}
          </p>
          <p className="text-sm font-medium italic text-gray-600">
            Siklus {cycle.tahun_akademik} – {cycle.semester}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="text-blue-800 font-bold mb-2">Kriteria Penilaian</h4>
          <p className="text-sm mb-1 text-gray-700">
            <span className="font-bold text-green-600">Memenuhi</span> — apabila kolom Catatan Auditor terisi, Kesesuaian bernilai "Ya", dan Link Bukti tersedia (serta Evaluasi Diri terisi).
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-bold text-red-600">Belum Memenuhi</span> — apabila salah satu dari kolom Evaluasi Diri, Catatan Auditor, Kesesuaian, atau Link Bukti kosong/tidak terisi, atau Kesesuaian bernilai "Tidak".
          </p>
        </div>

        <div className="mb-8">
          <h4 className="text-blue-800 font-bold mb-2">Ringkasan Eksekutif</h4>
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 border border-blue-200 w-1/3">Kategori</th>
                <th className="p-2 border border-blue-200 text-center w-1/3">Jumlah Indikator</th>
                <th className="p-2 border border-blue-200 text-center w-1/3">Persentase</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-green-50">
                <td className="p-2 border border-blue-200 font-bold text-green-700">Memenuhi</td>
                <td className="p-2 border border-blue-200 text-center font-bold">{analysisData.totalMemenuhi}</td>
                <td className="p-2 border border-blue-200 text-center font-bold">
                  {analysisData.totalIndikator > 0 ? ((analysisData.totalMemenuhi / analysisData.totalIndikator) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="p-2 border border-blue-200 font-bold text-red-700">Belum Memenuhi</td>
                <td className="p-2 border border-blue-200 text-center font-bold">{analysisData.totalBelumMemenuhi}</td>
                <td className="p-2 border border-blue-200 text-center font-bold">
                  {analysisData.totalIndikator > 0 ? ((analysisData.totalBelumMemenuhi / analysisData.totalIndikator) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="bg-blue-100">
                <td className="p-2 border border-blue-200 font-bold">Total</td>
                <td className="p-2 border border-blue-200 text-center font-bold">{analysisData.totalIndikator}</td>
                <td className="p-2 border border-blue-200 text-center font-bold">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div id="rekapitulasi" className="mb-8 page-break-before scroll-mt-24">
          <h4 className="text-blue-800 font-bold mb-2">Rekapitulasi per Tabel Indikator</h4>
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 border border-blue-200 text-center w-10">No</th>
                <th className="p-2 border border-blue-200">Kode & Nama Tabel Indikator</th>
                <th className="p-2 border border-blue-200 text-center w-24">Memenuhi</th>
                <th className="p-2 border border-blue-200 text-center w-24">Belum</th>
                <th className="p-2 border border-blue-200 text-center w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.recap.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-2 border border-gray-300 text-center">{idx + 1}</td>
                  <td className="p-2 border border-gray-300">{r.id}: {r.name}</td>
                  <td 
                    className="p-2 border border-gray-300 text-center font-bold text-green-600 bg-green-50/50 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => handleScrollToDetail(r.id)}
                    title="Klik untuk melihat rincian tabel ini"
                  >
                    <span className="border-b border-green-400 hover:border-green-600 border-dashed pb-0.5">{r.memenuhi}</span>
                  </td>
                  <td 
                    className="p-2 border border-gray-300 text-center font-bold text-red-600 bg-red-50/50 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => handleScrollToDetail(r.id)}
                    title="Klik untuk melihat rincian tabel ini"
                  >
                    <span className="border-b border-red-400 hover:border-red-600 border-dashed pb-0.5">{r.belum}</span>
                  </td>
                  <td className="p-2 border border-gray-300 text-center">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="page-break-before">
          <h4 className="text-blue-800 font-bold mb-4 text-xl">Analisis Rinci per Tabel Indikator</h4>
          
          {analysisData.details.map((d, idx) => (
            <div 
              key={d.id} 
              id={`detail-${d.id}`} 
              className={`mb-8 avoid-break-inside scroll-mt-24 transition-all duration-700 rounded-xl ${
                highlightedId === d.id 
                  ? 'bg-yellow-50 ring-2 ring-yellow-400 p-4 -mx-4 shadow-sm' 
                  : 'bg-transparent p-0 mx-0'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h5 className="text-blue-900 font-bold text-lg">{idx + 1}. {d.id}: {d.name}</h5>
                <button 
                  onClick={() => {
                    setHighlightedId(null);
                    document.getElementById('rekapitulasi')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 print:hidden border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  title="Kembali ke tabel rekapitulasi"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                  Ke atas (Rekap)
                </button>
              </div>
              <p className="text-sm mb-2 text-gray-700 font-medium">
                Ringkasan: <span className="text-green-700">{d.memenuhi} memenuhi</span> • <span className="text-red-700">{d.belum} belum memenuhi</span> dari {d.total} indikator.
              </p>
              
              <table className="w-full border-collapse text-sm text-left mb-4">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-2 border border-blue-200 text-center w-10">No</th>
                    <th className="p-2 border border-blue-200">Indikator</th>
                    <th className="p-2 border border-blue-200 text-center w-24">Eval. Diri</th>
                    <th className="p-2 border border-blue-200 text-center w-24">Kesesuaian</th>
                    <th className="p-2 border border-blue-200 text-center w-20">Bukti</th>
                    <th className="p-2 border border-blue-200 w-1/3">Status & Catatan KPMA</th>
                  </tr>
                </thead>
                <tbody>
                  {d.questions.map((q: any, qIdx: number) => (
                    <tr key={q.id} className="border border-gray-300">
                      <td className="p-2 border border-gray-300 text-center align-top">{qIdx + 1}</td>
                      <td className="p-2 border border-gray-300 align-top text-xs leading-relaxed">{q.text}</td>
                      <td className={`p-2 border border-gray-300 text-center align-top font-semibold ${q.evalDiri === "Kosong" ? "text-red-600" : "text-gray-700"}`}>
                        <a href={`/monev/${prodi.id}/${d.id}?cycleId=${cycle.id}#question-${q.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600" title="Buka form pengisian indikator ini">
                          {q.evalDiri}
                        </a>
                      </td>
                      <td className={`p-2 border border-gray-300 text-center align-top font-semibold ${q.kesesuaian !== "Ya" ? "text-red-600" : "text-gray-700"}`}>
                        <a href={`/monev/${prodi.id}/${d.id}?cycleId=${cycle.id}#question-${q.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600" title="Buka form pengisian indikator ini">
                          {q.kesesuaian}
                        </a>
                      </td>
                      <td className={`p-2 border border-gray-300 text-center align-top font-semibold ${q.bukti === "Tidak" ? "text-red-600" : "text-gray-700"}`}>
                        <a href={`/monev/${prodi.id}/${d.id}?cycleId=${cycle.id}#question-${q.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600" title="Buka form pengisian indikator ini">
                          {q.bukti}
                        </a>
                      </td>
                      <td className="p-2 border border-gray-300 align-top bg-gray-50/50">
                        <div className={`font-bold ${q.status === "Memenuhi" ? "text-green-700" : "text-red-700"}`}>
                          {q.status}
                        </div>
                        {q.status === "Belum Memenuhi" && q.catatanKpma && (
                          <div className="text-[11px] mt-1 text-gray-600 leading-snug">
                            <span>{q.catatanKpma}</span>
                          </div>
                        )}
                        {q.catatanGpm && (
                          <div className={`text-[11px] mt-1.5 text-gray-600 leading-snug ${q.catatanKpma ? "border-t border-gray-200 pt-1" : ""} italic`}>
                            {q.catatanGpm}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        
        {/* Signature Block */}
        <div className="mt-12 flex justify-end text-sm page-break-inside-avoid">
          <div className="text-left w-64">
            <p className="mb-1">Bogor, {printDate}</p>
            <p>Kepala KPMA Bogor,</p>
            <div className="h-24"></div>
            <p className="font-bold">{ketuaKpma}</p>
          </div>
        </div>

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .page-break-before {
              page-break-before: always;
            }
            .avoid-break-inside {
              page-break-inside: avoid;
            }
            @page {
              size: A4 portrait;
              margin: 15mm 10mm;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}} />
      </div>
    </div>
  );
}
