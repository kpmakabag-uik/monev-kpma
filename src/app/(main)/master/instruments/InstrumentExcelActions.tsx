"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface QuestionItem {
  id: string;
  text: string;
  bobot: number;
}

interface ParsedInstrument {
  id: string;
  name: string;
  category: string;
  jenjang_peruntukan: string;
  questions: QuestionItem[];
}

interface DuplicateItem {
  id: string;
  existing: {
    id: string;
    name: string;
    category: string;
    jenjang_peruntukan: string;
    questionCount: number;
  };
  incoming: ParsedInstrument;
  action: "update" | "skip";
}

interface PreviewData {
  totalParsed: number;
  totalQuestions: number;
  newItems: ParsedInstrument[];
  duplicateItems: DuplicateItem[];
}

export default function InstrumentExcelActions() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "preview" | "done">("select");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Preview Data State
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [duplicateActions, setDuplicateActions] = useState<Record<string, "update" | "skip">>({});
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [doneSummary, setDoneSummary] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    window.location.href = "/api/instruments/template";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
    }
  };

  // Step 1 -> Step 2: Menganalisis file Excel dan menampilkan Pratinjau
  const handleAnalyzeFile = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/instruments/preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menganalisis file Excel.");
      }

      setPreview(data);

      // Inisialisasi aksi default untuk duplikat (default: 'update')
      const initialActions: Record<string, "update" | "skip"> = {};
      data.duplicateItems.forEach((d: DuplicateItem) => {
        initialActions[d.id] = "update";
      });
      setDuplicateActions(initialActions);

      setStep("preview");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat membaca file.");
    } finally {
      setLoading(false);
    }
  };

  // Set Aksi Semua Duplikat sekaligus
  const handleSetAllActions = (action: "update" | "skip") => {
    if (!preview) return;
    const newActions: Record<string, "update" | "skip"> = {};
    preview.duplicateItems.forEach((d) => {
      newActions[d.id] = action;
    });
    setDuplicateActions(newActions);
  };

  // Step 2 -> Step 3: Eksekusi Import dengan pilihan user
  const handleConfirmImport = async () => {
    if (!preview) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // Susun instrumen yang akan dikirim
      const instrumentsToImport = [
        ...preview.newItems.map((item) => ({
          ...item,
          action: "create" as const,
        })),
        ...preview.duplicateItems.map((d) => ({
          ...d.incoming,
          action: duplicateActions[d.id] || ("update" as const),
        })),
      ];

      const res = await fetch("/api/instruments/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruments: instrumentsToImport }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal mengimpor instrumen.");
      }

      setDoneSummary(result.message);
      setStep("done");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses impor.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (loading) return;
    setIsOpen(false);
    setStep("select");
    setFile(null);
    setPreview(null);
    setErrorMsg(null);
    setDoneSummary(null);
  };

  return (
    <>
      {/* Top Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownloadTemplate}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors shadow-xs"
          title="Unduh Template Excel Format Instrumen"
        >
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Unduh Template Excel
        </button>

        <button
          onClick={() => {
            setStep("select");
            setIsOpen(true);
          }}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          title="Unggah File Excel untuk Menambah / Memperbarui Instrumen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Excel
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/75">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {step === "select" && "Import Instrumen (Excel)"}
                    {step === "preview" && "Pratinjau & Konfirmasi Data Instrumen"}
                    {step === "done" && "Import Selesai"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {step === "select" && "Pilih file Excel untuk memindai data dan mengecek duplikat kode"}
                    {step === "preview" && "Tinjau data baru dan tentukan aksi untuk kode instrumen yang sama"}
                    {step === "done" && "Proses import instrumen telah berhasil disimpan"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Error Message if any */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl text-xs font-medium border bg-red-50 border-red-200 text-red-800 flex items-start gap-2.5">
                  <span className="text-base leading-none">❌</span>
                  <div className="flex-1 leading-relaxed">{errorMsg}</div>
                </div>
              )}

              {/* TAHAP 1: PILIH FILE */}
              {step === "select" && (
                <div className="space-y-4">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-900 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <span>💡</span> Informasi Penting:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-800 pl-1 text-[11px]">
                      <li>Pastikan format tabel sesuai dengan <strong>Template Excel</strong>.</li>
                      <li>Jika ada <strong>Kode Instrumen yang sudah ada di database</strong>, sistem akan menampilkan <strong>Pratinjau Perbandingan</strong> dan Anda dapat memilih untuk <strong>Menimpa</strong> atau <strong>Melewatkannya</strong>.</li>
                    </ul>
                  </div>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      file
                        ? "border-blue-500 bg-blue-50/40"
                        : "border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900 text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <span className="text-[11px] text-blue-600 hover:underline mt-1 font-medium">
                          Klik untuk mengganti file
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Pilih file Excel (.xlsx)</p>
                          <p className="text-xs text-gray-500 mt-0.5">atau tarik dan lepas file ke kotak ini</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAHAP 2: PRATINJAU DATA & PILIHAN AKSI KODE SAMA */}
              {step === "preview" && preview && (
                <div className="space-y-4">
                  {/* Summary Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                      <p className="text-[11px] text-gray-500 font-medium">Total Terbaca</p>
                      <p className="text-lg font-extrabold text-gray-900">{preview.totalParsed} <span className="text-xs font-normal text-gray-500">instrumen</span></p>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <p className="text-[11px] text-emerald-700 font-medium">Data Baru</p>
                      <p className="text-lg font-extrabold text-emerald-700">+{preview.newItems.length} <span className="text-xs font-normal text-emerald-600">butir</span></p>
                    </div>

                    <div className={`p-3 col-span-2 sm:col-span-1 rounded-xl text-center border ${
                      preview.duplicateItems.length > 0
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}>
                      <p className="text-[11px] font-medium">Kode Sudah Ada</p>
                      <p className="text-lg font-extrabold">
                        {preview.duplicateItems.length} <span className="text-xs font-normal">duplikat</span>
                      </p>
                    </div>
                  </div>

                  {/* Bagian: KODE SUDAH ADA (KONFLIK) */}
                  {preview.duplicateItems.length > 0 && (
                    <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200">
                        <div>
                          <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <span>⚠️</span> Ditemukan {preview.duplicateItems.length} Kode yang Sudah Ada di Database
                          </h4>
                          <p className="text-[11px] text-amber-800">
                            Silakan tentukan tindakan untuk masing-masing kode di bawah ini:
                          </p>
                        </div>
                        {/* Quick Set All */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleSetAllActions("update")}
                            className="px-2.5 py-1 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                          >
                            Timpa Semua
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetAllActions("skip")}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-md transition-colors"
                          >
                            Lewati Semua
                          </button>
                        </div>
                      </div>

                      {/* List of Duplicate Items */}
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {preview.duplicateItems.map((item) => {
                          const action = duplicateActions[item.id] || "update";
                          const isExpanded = expandedCode === item.id;

                          return (
                            <div
                              key={item.id}
                              className={`p-3 bg-white rounded-xl border text-xs transition-all ${
                                action === "update"
                                  ? "border-amber-300 shadow-xs"
                                  : "border-gray-200 opacity-80"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-gray-900 px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                                      {item.id}
                                    </span>
                                    <span className="font-bold text-gray-800">{item.incoming.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                    <span>Jenjang: <strong className="text-gray-700">{item.incoming.jenjang_peruntukan}</strong></span>
                                    <span>Kategori: <strong className="text-gray-700">{item.incoming.category}</strong></span>
                                    <span>Sub-Butir: <strong className="text-gray-700">{item.incoming.questions.length}</strong></span>
                                  </div>
                                </div>

                                {/* Aksi Selector */}
                                <div className="flex items-center gap-1.5 self-end sm:self-auto bg-gray-50 p-1 rounded-lg border border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDuplicateActions((prev) => ({ ...prev, [item.id]: "update" }))
                                    }
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                      action === "update"
                                        ? "bg-amber-500 text-white shadow-xs"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                                  >
                                    ✏️ Timpa Data Lama
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDuplicateActions((prev) => ({ ...prev, [item.id]: "skip" }))
                                    }
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                      action === "skip"
                                        ? "bg-gray-700 text-white shadow-xs"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                                  >
                                    ⏭️ Lewati (Abaikan)
                                  </button>
                                </div>
                              </div>

                              {/* Toggle Detail Perbandingan */}
                              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                                <span>
                                  Di Database: <strong>{item.existing.name}</strong> ({item.existing.questionCount} pertanyaan)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedCode(isExpanded ? null : item.id)}
                                  className="text-blue-600 hover:underline"
                                >
                                  {isExpanded ? "Tutup Detail ▲" : "Lihat Pertanyaan Baru ▼"}
                                </button>
                              </div>

                              {/* Expanded Questions Details */}
                              {isExpanded && (
                                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 space-y-1">
                                  <p className="font-semibold text-gray-700 text-[10px]">Daftar Pertanyaan Baru dari Excel:</p>
                                  <ol className="list-decimal list-inside space-y-0.5 text-gray-600 text-[11px] pl-1">
                                    {item.incoming.questions.map((q, idx) => (
                                      <li key={idx}>{q.text}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bagian: DATA BARU */}
                  {preview.newItems.length > 0 && (
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span>✅</span> {preview.newItems.length} Data Baru (Akan Otomatis Ditambahkan)
                      </h4>
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {preview.newItems.map((item) => (
                          <div key={item.id} className="p-2.5 bg-white rounded-lg border border-emerald-100 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-emerald-800 mr-2">{item.id}</span>
                              <span className="font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                              {item.questions.length} Sub-Butir
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAHAP 3: SELESAI */}
              {step === "done" && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Import Berhasil Dilakukan!</h4>
                  <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                    {doneSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/75 flex justify-between items-center gap-2">
              {step === "select" && (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyzeFile}
                    disabled={!file || loading}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Memeriksa File...
                      </>
                    ) : (
                      <>
                        Analisis & Pratinjau
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </>
              )}

              {step === "preview" && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep("select")}
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    ← Ganti File
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Menyimpan Data...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Eksekusi Simpan ke Database
                      </>
                    )}
                  </button>
                </>
              )}

              {step === "done" && (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
