"use client";

import { useState, useEffect, Suspense } from "react";
import { saveMonevRecord } from "@/app/actions/monev";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Question {
  id: string;
  text: string;
}

interface AnswerItem {
  pilihan?: "Ya" | "Tidak" | string;
  evaluasiDiri?: string;
  buktiLinks?: string[];
  kesesuaianBukti?: string;
  catatanAuditor?: string;
}

interface MonevAnswers {
  [qId: string]: AnswerItem;
}

function MonevFormInner({
  instrumentId,
  instrumentName,
  instrumentCategory,
  instrumentIndikator,
  prodiId,
  facultyName = "Unknown",
  prodiName = "Unknown",
  jenjang = "S1",
  tahunAkademik,
  semester,
  questions,
  initialAnswers,
  initialAnalisa,
  userRole,
  isLocked = false,
  lockReason = "",
  isAnalysisPublished = false,
}: {
  instrumentId: string;
  instrumentName: string;
  instrumentCategory: string;
  instrumentIndikator: string;
  prodiId: string;
  facultyName?: string;
  prodiName?: string;
  jenjang?: string;
  tahunAkademik: string;
  semester: string;
  questions: Question[];
  initialAnswers: MonevAnswers;
  initialAnalisa: string;
  userRole: string;
  isLocked?: boolean;
  lockReason?: string;
  isAnalysisPublished?: boolean;
}) {
  const [answers, setAnswers] = useState<MonevAnswers>(initialAnswers || {});
  const [analisa, setAnalisa] = useState(initialAnalisa || "");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingQId, setUploadingQId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success"|"error", text: string } | null>(null);

  // States for Unsaved Changes
  const [isDirty, setIsDirty] = useState(false);
  const [newlyUploadedUrls, setNewlyUploadedUrls] = useState<string[]>([]);
  
  // States for Navigation Modal
  const [showNavModal, setShowNavModal] = useState(false);
  const [targetNavUrl, setTargetNavUrl] = useState<string | null>(null);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const canEditGKM = (userRole === "GKM" && !isLocked) || userRole === "KPMA";
  const canEditGPM = userRole === "GPM" || userRole === "KPMA";
  const canEditKPMA = userRole === "KPMA";
  
  const isReadOnly = userRole === "PIMPINAN_UNIVERSITAS" || userRole === "PIMPINAN_FAKULTAS";

  const searchParams = useSearchParams();
  const cycleIdParam = searchParams.get("cycleId");

  const handleAnswerChange = (qId: string, field: keyof AnswerItem, value: string) => {
    setIsDirty(true);
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        [field]: value
      }
    }));
  };

  const handleUpload = async (qId: string, _qText: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingQId(qId);
    
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    
    const currentAns = answers[qId] || {};
    const existingLinksCount = Array.isArray(currentAns.buktiLinks) ? currentAns.buktiLinks.length : 0;

    formData.append("facultyName", facultyName);
    formData.append("prodiName", prodiName);
    formData.append("jenjang", jenjang);
    formData.append("tahunAkademik", tahunAkademik);
    formData.append("semester", semester);
    formData.append("instrumentId", instrumentId);
    formData.append("kategori", instrumentCategory);
    formData.append("qId", qId);
    formData.append("fileOffset", existingLinksCount.toString());
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsDirty(true);
        setNewlyUploadedUrls(prev => [...prev, ...data.links]);
        setAnswers((prev) => {
          const currentAnsForQ = prev[qId] || {};
          const currentLinks = Array.isArray(currentAnsForQ.buktiLinks) ? currentAnsForQ.buktiLinks : [];
          return {
            ...prev,
            [qId]: {
              ...currentAnsForQ,
              pilihan: "Ya", // Otomatis centang Ya
              buktiLinks: [...currentLinks, ...data.links]
            }
          };
        });
        alert("Upload berhasil!");
      } else {
        alert("Upload gagal: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Terjadi kesalahan saat upload.");
    } finally {
      setUploadingQId(null);
    }
  };

  const handleSave = async (skipNav?: boolean) => {
    // Validation: if "Ya" is selected, there must be at least one bukti link
    const invalidQuestions: string[] = [];
    questions.forEach(q => {
      const ans = answers[q.id];
      if (ans?.pilihan === "Ya" && (!ans.buktiLinks || ans.buktiLinks.length === 0)) {
        invalidQuestions.push(q.text.substring(0, 50) + "...");
      }
    });

    if (invalidQuestions.length > 0) {
      if (!confirm(`Peringatan: Ada ${invalidQuestions.length} butir dengan pilihan "Ya" namun belum mengunggah bukti link.\n\nContoh: ${invalidQuestions[0]}\n\nTetap simpan? (Sangat disarankan untuk mengunggah bukti jika memilih "Ya")`)) {
        return;
      }
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const result = await saveMonevRecord({
        prodiId,
        instrumentId,
        tahunAkademik,
        semester,
        answers,
        analisaKpma: analisa,
        tindakLanjutKpma: ""
      });

      if (result.success) {
        setIsDirty(false);
        setNewlyUploadedUrls([]); // Reset
        setMessage({ type: "success", text: "Tersimpan" });
        setTimeout(() => setMessage(null), 3000);
        
        if (targetNavUrl && !skipNav) {
          window.location.href = targetNavUrl;
        }
      } else {
        setMessage({ type: "error", text: "Gagal" });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    setIsDiscarding(true);
    try {
      if (newlyUploadedUrls.length > 0) {
        await fetch("/api/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: newlyUploadedUrls })
        });
      }
      setIsDirty(false);
      setNewlyUploadedUrls([]);
      if (targetNavUrl) {
        window.location.href = targetNavUrl;
      }
    } catch {
      alert("Gagal membuang file. Coba lagi.");
    } finally {
      setIsDiscarding(false);
      setShowNavModal(false);
    }
  };

  const handleDeleteFile = async (qId: string, linkToDelete: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus file ini?")) return;
    
    setIsDirty(true);
    setAnswers((prev) => {
      const currentAnsForQ = prev[qId] || {};
      const currentLinks = Array.isArray(currentAnsForQ.buktiLinks) ? currentAnsForQ.buktiLinks : [];
      return {
        ...prev,
        [qId]: {
          ...currentAnsForQ,
          buktiLinks: currentLinks.filter((l: string) => l !== linkToDelete)
        }
      };
    });

    // Optional: Call API to delete from Drive if needed
    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [linkToDelete] })
      });
    } catch {
      console.warn("Could not delete file from storage, but link removed from form.");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    
    const handleClick = (e: MouseEvent) => {
      if (!isDirty) return;
      
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && !anchor.href.includes(window.location.pathname) && !anchor.target) {
        e.preventDefault();
        e.stopPropagation();
        setTargetNavUrl(anchor.href);
        setShowNavModal(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, { capture: true });
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [isDirty]);

  return (
    <div className="flex flex-col font-sans -mx-6 md:-mx-8 -mt-6 md:-mt-8">
      {/* Header Baru yang Lebih Premium */}
      <div className="bg-[#1f5791] text-white px-6 py-6 md:px-8 shadow-md border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200">
              <span className="bg-blue-800/50 px-2 py-0.5 rounded">{facultyName}</span>
              <span className="text-white/30">/</span>
              <span className="text-yellow-400">{jenjang} {prodiName}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {instrumentId} - {instrumentName}
            </h1>
            <div className="flex items-center gap-4 text-sm text-blue-100 font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                {instrumentCategory}
              </div>
              <div className="w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01"></path></svg>
                Indikator: {instrumentIndikator}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-2">
               {cycleIdParam && (
                 <Link href={`/master/analisis?cycleId=${cycleIdParam}&prodiId=${prodiId}#detail-${instrumentId}`} className="group bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 border border-yellow-500/30">
                   <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"></path></svg>
                   KEMBALI KE ANALISIS
                 </Link>
               )}
               <Link href={`/monev?prodiId=${prodiId}`} className="group bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 border border-white/20">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                KEMBALI KE DAFTAR
              </Link>
             </div>
            <div className="bg-yellow-400/20 text-yellow-300 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded border border-yellow-400/30">
               Siklus: {tahunAkademik} - {semester}
            </div>
          </div>
        </div>
      </div>

      {isLocked && userRole === "GKM" && (
        <div className="bg-amber-500 text-white px-6 py-3 flex items-center gap-3 shadow-inner">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-xs font-medium">
            <span className="font-bold uppercase tracking-wide">Formulir Terkunci (Mode Hanya-Lihat):</span> {lockReason || "Batas waktu pengisian telah berakhir atau data telah difinalisasi dengan Pakta Integritas."}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-[#2a75c3] text-white text-[13px]">
              <th className="p-3 border border-[#9ac2e6]/50 w-12 text-center align-middle">No.</th>
              <th className="p-3 border border-[#9ac2e6]/50 w-[24%] text-center align-middle">Keterangan / Pertanyaan Monitoring</th>
              <th className="p-3 border border-[#9ac2e6]/50 w-12 text-center align-middle">Ya</th>
              <th className="p-3 border border-[#9ac2e6]/50 w-12 text-center align-middle">Tidak</th>
              <th className="p-3 border border-[#9ac2e6]/50 w-[16%] text-center align-middle">Keterangan / Temuan</th>
              <th className="p-3 border border-[#9ac2e6]/50 w-[16%] text-center align-middle">Bukti / Dokumen Penunjang</th>
              <th className="p-3 border border-[#9ac2e6]/50 w-[12%] text-center align-middle">Kesesuaian Bukti</th>
              <th className="p-3 border border-[#9ac2e6]/50 w-[16%] text-center align-middle">Catatan Auditor</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {questions.map((q, idx) => {
              const ans = answers[q.id] || {};
              const letter = String.fromCharCode(65 + idx);
              return (
                <tr key={q.id} id={`question-${q.id}`} className="border border-[#c6d7e9] bg-white hover:bg-blue-50/20 align-top scroll-mt-32 target:bg-yellow-50 target:ring-2 target:ring-yellow-400">
                  <td className="p-2 border border-[#c6d7e9] text-center font-bold text-gray-800 text-xs">1{letter}</td>
                  <td className="p-2 border border-[#c6d7e9] text-gray-800 text-[13px]">{q.text}</td>
                  
                  {/* Ya / Tidak Checkboxes */}
                  <td className="p-2 border border-[#c6d7e9] text-center align-middle relative">
                    {canEditGKM ? (
                       <label className="cursor-pointer inset-0 flex items-center justify-center">
                         <input type="radio" 
                           name={`pilihan-${q.id}`} 
                           checked={ans.pilihan === "Ya"}
                           onChange={() => handleAnswerChange(q.id, "pilihan", "Ya")}
                           className="w-4 h-4 cursor-pointer text-[#2a75c3] focus:ring-[#2a75c3]"
                         />
                       </label>
                    ) : (
                       <div className="font-bold text-gray-800">{ans.pilihan === "Ya" ? "V" : ""}</div>
                    )}
                  </td>
                  <td className="p-2 border border-[#c6d7e9] text-center align-middle relative">
                    {canEditGKM ? (
                       <label className="cursor-pointer inset-0 flex items-center justify-center">
                         <input type="radio" 
                           name={`pilihan-${q.id}`} 
                           checked={ans.pilihan === "Tidak"}
                           onChange={() => handleAnswerChange(q.id, "pilihan", "Tidak")}
                           className="w-4 h-4 cursor-pointer text-[#2a75c3] focus:ring-[#2a75c3]"
                         />
                       </label>
                    ) : (
                       <div className="font-bold text-gray-800">{ans.pilihan === "Tidak" ? "V" : ""}</div>
                    )}
                  </td>
                  
                  <td className="p-2 border border-[#c6d7e9] align-top">
                    <textarea 
                      className={`w-full h-full min-h-[60px] p-2 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#2a75c3] resize-y m-0 ${canEditGKM ? 'bg-white' : 'bg-transparent text-gray-800'}`}
                      disabled={!canEditGKM}
                      value={ans.evaluasiDiri || ""}
                      onChange={(e) => handleAnswerChange(q.id, "evaluasiDiri", e.target.value)}
                      placeholder="Keterangan..."
                    />
                  </td>
                  <td className="p-2 border border-[#c6d7e9] align-top">
                    <div className="flex flex-col gap-2">
                      {canEditGKM && (
                        <div>
                          <input 
                            type="file" 
                            multiple 
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                for (let i = 0; i < files.length; i++) {
                                  if (files[i].size > 10 * 1024 * 1024) {
                                    alert(`File "${files[i].name}" terlalu besar (Max 10MB). Silakan kecilkan ukuran file atau bagi menjadi beberapa bagian.`);
                                    e.target.value = ""; // Reset input
                                    return;
                                  }
                                }
                              }
                              handleUpload(q.id, q.text, files);
                            }}
                            className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={uploadingQId === q.id}
                          />
                          <p className="text-[10px] text-gray-400 mt-1 italic">* Maksimal 10MB per file</p>
                          {uploadingQId === q.id && <span className="text-xs text-blue-600 font-bold ml-2">Mengupload...</span>}
                        </div>
                      )}
                      
                      {/* Daftar Link View */}
                      <div className="flex flex-col gap-1 mt-1">
                        {Array.isArray(ans.buktiLinks) && ans.buktiLinks.map((link: string, i: number) => (
                          <div key={i} className="flex items-center gap-1">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="bg-[#2a75c3] text-white text-[10px] px-2 py-1 rounded w-max hover:bg-blue-800 flex items-center shrink-0">
                              📄 View File {i+1}
                            </a>
                            {userRole === "KPMA" && (
                              <button 
                                onClick={() => handleDeleteFile(q.id, link)}
                                className="bg-red-500 hover:bg-red-700 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded shrink-0 transition-colors"
                                title="Hapus File"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* GPM Kesesuaian Bukti */}
                  <td className="p-2 border border-[#c6d7e9] align-top text-center">
                    {canEditGPM ? (
                      <select
                        value={ans.kesesuaianBukti || "-"}
                        onChange={(e) => handleAnswerChange(q.id, "kesesuaianBukti", e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-[13px] focus:ring-1 focus:ring-[#2a75c3]"
                      >
                        <option value="-">-</option>
                        <option value="Ya">Ya</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    ) : (
                      <div className="font-bold text-gray-800 text-[13px]">{ans.kesesuaianBukti || "-"}</div>
                    )}
                  </td>
                  
                  {/* GPM Catatan Auditor */}
                  <td className="p-2 border border-[#c6d7e9] align-top">
                    <textarea 
                      className={`w-full h-full min-h-[60px] p-2 text-[13px] border border-gray-200 rounded focus:ring-1 focus:ring-[#2a75c3] resize-y m-0 ${canEditGPM ? 'bg-[#f4faee]' : 'bg-transparent text-gray-800'}`}
                      disabled={!canEditGPM}
                      value={ans.catatanAuditor || ""}
                      onChange={(e) => handleAnswerChange(q.id, "catatanAuditor", e.target.value)}
                      placeholder="Catatan..."
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-[#ccdee0] p-2 md:px-8 font-bold text-sm text-gray-800 border-t border-b border-[#9ac2e6]/50 flex items-center justify-between">
        <span>Analisis & Catatan Tim KPMA UIKA Bogor</span>
        {isAnalysisPublished ? (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
            <span>✓</span> Resmi Terbit
          </span>
        ) : (
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
            <span>🔒</span> Draft Internal KPMA
          </span>
        )}
      </div>
      <div className="bg-[#e7f1f5] border-b border-[#9ac2e6]/50 p-4 md:px-8">
        {canEditKPMA ? (
          <textarea
            className="w-full min-h-[120px] p-3 text-[13px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#2a75c3] resize-y bg-white"
            value={analisa}
            onChange={(e) => setAnalisa(e.target.value)}
            placeholder="Tuliskan catatan analisis evaluasi mutu dari tim KPMA..."
          />
        ) : isAnalysisPublished ? (
          <div className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed bg-white/70 p-4 rounded-lg border border-blue-200/50">
            {analisa ? analisa : <span className="text-gray-500 italic">Tidak ada catatan khusus dari KPMA untuk butir ini.</span>}
          </div>
        ) : (
          <div className="text-[12px] text-gray-500 italic flex items-center gap-2 p-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Catatan analisis sedang dirumuskan oleh tim KPMA (Status: Draft) dan akan ditampilkan kepada Program Studi setelah resmi dipublikasikan.</span>
          </div>
        )}
      </div>

      {(!isReadOnly) && (
        <div className="p-4 md:px-8 bg-gray-50 flex items-center justify-between border-t border-gray-200 shadow-inner">
            <div>
              {message && (
                <span className={`text-sm font-bold px-4 py-2 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.type === 'success' ? 'Berhasil' : 'Error'} {message.text}
                </span>
              )}
            </div>
            {isLocked && userRole === "GKM" ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-xs font-bold border border-gray-300">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Formulir Terkunci (Mode Hanya-Lihat)
              </div>
            ) : (
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="bg-[#2a75c3] hover:bg-[#1f5791] text-white px-6 py-2.5 rounded-md text-sm font-bold uppercase transition-all shadow-sm disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Data"}
              </button>
            )}
        </div>
      )}

      {/* Navigation Confirmation Modal */}
      {showNavModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-yellow-50 p-6 border-b border-yellow-100 flex gap-4">
              <div className="text-yellow-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Ada perubahan yang belum disimpan!</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Apakah Anda ingin menyimpannya terlebih dahulu sebelum pindah halaman? <br/><br/>
                  <span className="font-semibold text-red-600">Jika Anda memilih &quot;Tidak&quot;, maka file yang baru saja Anda unggah akan otomatis dihapus dari Google Drive.</span>
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 flex justify-end gap-3 flex-wrap">
              <button 
                onClick={() => setShowNavModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSaving || isDiscarding}
              >
                Batal Pindah
              </button>
              <button 
                onClick={handleDiscard}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                disabled={isSaving || isDiscarding}
              >
                {isDiscarding ? "Menghapus..." : "Tidak, Buang Perubahan"}
              </button>
              <button 
                onClick={() => handleSave(false)}
                className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm transition-colors"
                disabled={isSaving || isDiscarding}
              >
                {isSaving ? "Menyimpan..." : "Ya, Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MonevForm(props: any) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold animate-pulse">Memuat Form...</div>}>
      <MonevFormInner {...props} />
    </Suspense>
  );
}

