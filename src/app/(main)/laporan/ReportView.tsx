"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { sortInstruments } from "@/lib/utils";
import { useState } from "react";

interface AnswerItem {
  evaluasiDiri?: string;
  pilihan?: string;
  buktiLinks?: string[];
  catatanAuditor?: string;
  kesesuaianBukti?: string;
}

interface Faculty {
  id: string;
  name: string;
}

interface Prodi {
  id: string;
  name: string;
  jenjang: string;
  faculty: Faculty;
}

interface Instrument {
  id: string;
  name: string;
  questions: string;
}

interface MonevRecordData {
  id: string;
  instrument: Instrument;
  answers: Record<string, AnswerItem>;
  analisa_kpma?: string | null;
  tindak_lanjut_kpma?: string | null;
}

interface Question {
  id: string;
  text: string;
}

interface ReportViewProps {
  prodi: Prodi;
  records: MonevRecordData[];
  cycle: { tahun: string; semester: string };
}

export default function ReportView({ prodi, records, cycle }: ReportViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Sort records based on instrument ID using the helper
  const sortedRecords = sortInstruments(records);

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      // --- Header ---
      doc.setFontSize(14);
      doc.text("LAPORAN MONITORING DAN EVALUASI (MONEV) INTERNAL", 148.5, 15, { align: "center" });
      doc.setFontSize(11);
      doc.text(`PROGRAM STUDI ${prodi.name.toUpperCase()} (${prodi.jenjang})`, 148.5, 22, { align: "center" });
      doc.text(`FAKULTAS ${prodi.faculty.name.toUpperCase()}`, 148.5, 28, { align: "center" });
      doc.text(`SIKLUS: ${cycle.tahun} - ${cycle.semester}`, 148.5, 34, { align: "center" });
      doc.line(20, 38, 277, 38);

      let currentY = 45;

      sortedRecords.forEach((record, index) => {
        // Instrument Header
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${record.instrument.id}: ${record.instrument.name}`, 20, currentY);
        currentY += 6;

        // Parse questions and answers
        let questions: Question[] = [];
        try {
          questions = JSON.parse(record.instrument.questions);
        } catch {
          questions = [];
        }

        const tableData = questions.map((q: Question) => {
          const ans: AnswerItem = record.answers[q.id] || {};
          let linkText = "-";
          if (ans.buktiLinks && ans.buktiLinks.length > 0) {
            linkText = ans.buktiLinks.map((_, i) => `[Lihat Bukti ${i + 1}]`).join("\n");
          } else if (ans.pilihan === "Ya") {
            linkText = "(Bukti Belum Diunggah)";
          }
          
          return [
            q.text,
            ans.evaluasiDiri || "-",
            ans.pilihan || "-",
            linkText,
            ans.catatanAuditor || "-",
            ans.kesesuaianBukti || "-"
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Indikator / Pertanyaan', 'Evaluasi Diri', 'Skor/Pilihan', 'Link Bukti', 'Catatan Auditor', 'Kesesuaian']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 8, halign: 'center' },
          styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 50 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 50, textColor: [0, 0, 255] },
            4: { cellWidth: 40 },
            5: { cellWidth: 25, halign: 'center' }
          },
          margin: { left: 20, right: 20 },
          didDrawCell: (data) => {
            // Placeholder for custom cell drawing if needed
          },
          didDrawPage: (data) => {
            currentY = data.cursor?.y || currentY;
          }
        });

        // @ts-expect-error - lastAutoTable is added by jspdf-autotable plugin
        currentY = doc.lastAutoTable.finalY + 10;

        // Check for page break
        if (currentY > 180 && index < sortedRecords.length - 1) {
          doc.addPage();
          currentY = 20;
        }
      });

      // --- Footer / Signature ---
      if (currentY > 160) {
        doc.addPage();
        currentY = 20;
      }

      const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Dicetak pada: ${today}`, 20, currentY);
      
      currentY += 20;
      doc.text("Disetujui oleh,", 200, currentY);
      currentY += 25;
      doc.line(200, currentY, 260, currentY);
      doc.text("Kepala KPMA / Auditor", 200, currentY + 5);

      doc.save(`Laporan_MONEV_${prodi.name}_${cycle.tahun}_${cycle.semester}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Gagal mencetak PDF. Silahkan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-bold text-institusi">{sortedRecords.length}</span> Instrumen terisi
        </div>
        <button
          onClick={generatePDF}
          disabled={isGenerating || sortedRecords.length === 0}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md disabled:opacity-50"
        >
          {isGenerating ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          )}
          {isGenerating ? "Menyiapkan PDF..." : "Cetak Laporan (PDF)"}
        </button>
      </div>

      {/* Preview Section */}
      <div className="space-y-8">
        {sortedRecords.map((record) => {
          let questions: Question[] = [];
          try {
            questions = JSON.parse(record.instrument.questions);
          } catch {
            questions = [];
          }

          return (
            <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-3">
                  <span className="bg-institusi text-white text-[10px] px-2 py-1 rounded">{record.instrument.id}</span>
                  {record.instrument.name}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3 border-b border-r">Pertanyaan/Indikator</th>
                      <th className="px-6 py-3 border-b border-r">Evaluasi Diri</th>
                      <th className="px-6 py-3 border-b border-r text-center">Skor</th>
                      <th className="px-6 py-3 border-b border-r">Bukti Link</th>
                      <th className="px-6 py-3 border-b border-r">Catatan Auditor</th>
                      <th className="px-6 py-3 border-b">Kesesuaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {questions.map((q: Question) => {
                      const ans: AnswerItem = record.answers[q.id] || {};
                      return (
                        <tr key={q.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 border-r align-top font-medium text-gray-700 min-w-[200px]">{q.text}</td>
                          <td className="px-6 py-4 border-r align-top text-gray-600 whitespace-pre-wrap min-w-[200px]">{ans.evaluasiDiri || "-"}</td>
                          <td className="px-6 py-4 border-r align-top text-center font-bold text-institusi">{ans.pilihan || "-"}</td>
                          <td className="px-6 py-4 border-r align-top">
                            {ans.buktiLinks && ans.buktiLinks.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {ans.buktiLinks.map((link: string, i: number) => (
                                  <a key={i} href={link} target="_blank" rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded text-[10px] font-bold border border-blue-200 transition-colors w-fit"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    Lihat Bukti {i + 1}
                                  </a>
                                ))}
                              </div>
                            ) : ans.pilihan === "Ya" ? (
                              <span className="text-red-500 font-bold text-[10px] flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Belum Ada Bukti
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 border-r align-top text-gray-600 italic">{ans.catatanAuditor || "-"}</td>
                          <td className="px-6 py-4 align-top text-center">
                            {ans.kesesuaianBukti ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ans.kesesuaianBukti === "Sesuai" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {ans.kesesuaianBukti}
                              </span>
                            ) : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* KPMA Analysis section */}
              {(record.analisa_kpma || record.tindak_lanjut_kpma) && (
                <div className="bg-blue-50/30 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Analisa KPMA</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.analisa_kpma || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Tindak Lanjut KPMA</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.tindak_lanjut_kpma || "-"}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sortedRecords.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Data Terisi</h3>
            <p>Program Studi ini belum mengisi instrumen pada siklus {cycle.tahun} {cycle.semester}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
