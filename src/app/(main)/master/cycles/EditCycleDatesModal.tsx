"use client";

import { useState } from "react";
import { updateCycleDates } from "@/app/actions/master";

interface EditCycleDatesModalProps {
  cycle: {
    id: string;
    tahun_akademik: string;
    semester: string;
    startDate: Date | null;
    endDate: Date | null;
  };
}

export default function EditCycleDatesModal({ cycle }: EditCycleDatesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialStart = cycle.startDate ? new Date(cycle.startDate).toISOString().split("T")[0] : "";
  const initialEnd = cycle.endDate ? new Date(cycle.endDate).toISOString().split("T")[0] : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateCycleDates(cycle.id, formData);
    setIsLoading(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors border border-slate-300"
        title="Atur Batas Waktu"
      >
        📅 Atur Batas Waktu
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Atur Batas Waktu Pengisian</h3>
                <p className="text-xs text-gray-500">{cycle.tahun_akademik} - {cycle.semester}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Mulai</label>
                <input 
                  type="date" 
                  name="startDate"
                  defaultValue={initialStart}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-institusi focus:border-institusi outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Batas Waktu Akhir (Due Date)</label>
                <input 
                  type="date" 
                  name="endDate"
                  defaultValue={initialEnd}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-institusi focus:border-institusi outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Setelah tanggal ini lewat (pukul 23:59), formulir Prodi otomatis terkunci (Read-Only).
                </p>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-5 py-2 bg-institusi hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 text-sm"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
