"use client";

import { useState } from "react";
import { publishAnalysisBatchByFaculty } from "@/app/actions/monev";
import { useRouter } from "next/navigation";

interface Cycle {
  id: string;
  tahun_akademik: string;
  semester: string;
  isActive?: boolean;
}

interface Faculty {
  id: string;
  name: string;
  prodi?: Array<{ id: string; name: string }>;
  prodis?: Array<{ id: string; name: string }>;
}

export default function BatchPublishModal({
  cycles,
  faculties,
  currentCycleId,
}: {
  cycles: Cycle[];
  faculties: Faculty[];
  currentCycleId?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState(
    currentCycleId || cycles.find(c => c.isActive)?.id || cycles[0]?.id || ""
  );
  const [selectedFacultyId, setSelectedFacultyId] = useState("ALL");
  const [actionType, setActionType] = useState<"publish" | "unpublish">("publish");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const selectedCycle = cycles.find(c => c.id === selectedCycleId) || cycles[0];

  const totalProdisAll = faculties.reduce((acc, f) => {
    const pList = f.prodi || f.prodis || [];
    return acc + pList.length;
  }, 0);

  const handleExecute = async () => {
    if (!selectedCycle) {
      setFeedback({ type: "error", message: "Pilih siklus terlebih dahulu." });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const isPub = actionType === "publish";
    const res = await publishAnalysisBatchByFaculty({
      facultyId: selectedFacultyId,
      tahunAkademik: selectedCycle.tahun_akademik,
      semester: selectedCycle.semester,
      isPublished: isPub,
    });

    setIsLoading(false);

    if (res.success) {
      setFeedback({
        type: "success",
        message: `Berhasil! Status analisis untuk ${res.prodiCount} Program Studi telah diubah menjadi "${
          isPub ? "Terbit (Dapat dilihat Prodi)" : "Draft (Tersembunyi)"
        }".`
      });
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({
        type: "error",
        message: res.error || "Gagal mengubah status publikasi."
      });
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setFeedback(null);
        }}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all border border-indigo-700 active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
        <span>Publikasi Massal per Fakultas</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Publikasi Massal Analisis KPMA</h3>
                  <p className="text-xs text-gray-500">Terbitkan catatan evaluasi & tindak lanjut KPMA sekaligus.</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form controls */}
            <div className="space-y-4">
              {/* Siklus */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Siklus Monev</label>
                <select
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tahun_akademik} - {c.semester} {c.isActive ? "(Siklus Aktif)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Fakultas */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Fakultas / Seluruh Universitas</label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="ALL">
                    🌐 SEMUA FAKULTAS (Seluruh {totalProdisAll} Program Studi)
                  </option>
                  {faculties.map((f) => {
                    const count = (f.prodi || f.prodis || []).length;
                    return (
                      <option key={f.id} value={f.id}>
                        🏛️ {f.name} ({count} Prodi)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Aksi */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Pilih Aksi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType("publish")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      actionType === "publish"
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-gray-900">Publikasikan</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      Catatan KPMA resmi tampil ke Prodi & Fakultas.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType("unpublish")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      actionType === "unpublish"
                        ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-bold text-gray-900">Tarik ke Draft</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      Sembunyikan catatan dari Prodi (hanya internal KPMA).
                    </p>
                  </button>
                </div>
              </div>

              {/* Feedback alert */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  <span className="font-bold shrink-0">{feedback.type === "success" ? "✓" : "✕"}</span>
                  <span>{feedback.message}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecute}
                disabled={isLoading}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all flex items-center gap-2 ${
                  actionType === "publish"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : "active:scale-95"}`}
              >
                {isLoading && (
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                )}
                <span>{actionType === "publish" ? "Terapkan Publikasikan" : "Terapkan Tarik ke Draft"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
