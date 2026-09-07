"use client";

import { useState } from "react";
import { submitFinalMonev, reopenMonevSubmission } from "@/app/actions/monev";
import { useRouter } from "next/navigation";

interface FinalizeSubmissionModalProps {
  prodiId: string;
  prodiName: string;
  tahunAkademik: string;
  semester: string;
  isSubmitted: boolean;
  submittedAt: Date | string | null;
  pactAgreedBy: string | null;
  allDone: boolean;
  userRole: string;
}

export default function FinalizeSubmissionModal({
  prodiId,
  prodiName,
  tahunAkademik,
  semester,
  isSubmitted,
  submittedAt,
  pactAgreedBy,
  allDone,
  userRole
}: FinalizeSubmissionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [picName, setPicName] = useState("");
  const router = useRouter();

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("Anda wajib menceklis pernyataan Pakta Integritas.");
      return;
    }
    if (!picName.trim()) {
      alert("Silakan masukkan nama penanggung jawab / PIC.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await submitFinalMonev({
        prodiId,
        tahunAkademik,
        semester,
        pactAgreedBy: picName.trim()
      });

      if (res.success) {
        alert("Pengisian MONEV berhasil difinalisasi dan dikunci.");
        setIsOpen(false);
        router.refresh();
      } else {
        alert(res.error || "Gagal melakukan finalisasi.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReopen = async () => {
    if (!confirm("Buka kembali kuncian pengisian untuk Prodi ini agar dapat diedit kembali?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await reopenMonevSubmission({
        prodiId,
        tahunAkademik,
        semester
      });

      if (res.success) {
        alert("Kuncian pengisian berhasil dibuka kembali.");
        router.refresh();
      } else {
        alert(res.error || "Gagal membuka kuncian.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSubmitted) {
    const formattedDate = submittedAt ? new Date(submittedAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "-";

    return (
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-sm">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Disahkan Pakta Integritas ({pactAgreedBy || "PIC"} - {formattedDate})</span>
        </div>

        {userRole === "KPMA" && (
          <button
            onClick={handleReopen}
            disabled={isProcessing}
            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1.5 rounded-lg font-bold border border-amber-300 transition-colors"
            title="Buka kembali form prodi untuk perbaikan"
          >
            {isProcessing ? "Memproses..." : "🔓 Buka Kuncian"}
          </button>
        )}
      </div>
    );
  }

  // If not submitted yet
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
        title="Finalisasi pengisian dan sahkan pakta integritas"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Finalisasi & Pakta Integritas</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-emerald-50/70 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📜</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight">Pakta Integritas Pengisian MONEV</h3>
                  <p className="text-xs text-gray-500">{prodiName} ({tahunAkademik} - {semester})</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFinalSubmit} className="p-6 flex flex-col gap-4">
              {!allDone && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                  <span className="text-sm font-bold">⚠️</span>
                  <span>
                    <strong>Catatan:</strong> Beberapa instrumen pengisian belum mencapai 100%. Anda tetap dapat memfinalisasi jika seluruh data yang tersedia sudah siap diaudit.
                  </span>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs text-gray-700 leading-relaxed space-y-2">
                <p className="font-bold text-gray-900 uppercase tracking-wide text-[11px]">
                  Pernyataan Keabsahan Data:
                </p>
                <p>
                  &ldquo;Dengan ini saya menyatakan dengan penuh tanggung jawab bahwa seluruh data isian evaluasi diri, dokumen bukti pendukung, dan keterangan yang diunggah ke dalam Sistem MONEV PT adalah benar, sah, mutakhir, dan dapat dipertanggungjawabkan sesuai kondisi faktual Program Studi.&rdquo;
                </p>
                <p className="text-gray-500 italic">
                  Setelah difinalisasi, formulir pengisian Program Studi akan <strong>terkunci secara permanen</strong> dan siap untuk diverifikasi oleh Tim Auditor.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Nama Penanggung Jawab (PIC / Kaprodi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  placeholder="Contoh: Dr. Fulan, M.Kom."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <label className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-gray-800 font-medium leading-normal select-none">
                  Saya telah memeriksa dan menyetujui seluruh butir evaluasi ini untuk diaudit oleh Tim Auditor / KPMA.
                </span>
              </label>

              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !agreed || !picName.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 text-xs flex items-center gap-2"
                >
                  {isProcessing ? "Menyimpan..." : "Kirim & Kunci Data Final"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
