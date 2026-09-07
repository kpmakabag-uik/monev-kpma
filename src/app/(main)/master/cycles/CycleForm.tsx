"use client";

import { useState } from "react";
import { createCycle } from "@/app/actions/master";

export default function CycleForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await createCycle(formData);
    setIsLoading(false);
    setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-institusi hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-all"
      >
        <span>+</span> Tambah Siklus
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">Tambah Siklus Baru</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Akademik</label>
                <input 
                  type="text" 
                  name="tahun_akademik"
                  required
                  placeholder="e.g. 2026/2027"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-institusi focus:border-institusi outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                <select 
                  name="semester"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-institusi focus:border-institusi outline-none"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    name="startDate"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-institusi focus:border-institusi outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Batas Waktu (Due Date)</label>
                  <input 
                    type="date" 
                    name="endDate"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-institusi focus:border-institusi outline-none text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-2 bg-institusi hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
