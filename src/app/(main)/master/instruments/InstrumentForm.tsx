"use client";

import { useState, useTransition } from "react";
import { createInstrument } from "@/app/actions/master";

interface Level {
  id: string;
  name: string;
}

export default function InstrumentForm({ levels }: { levels: Level[] }) {
  const [questions, setQuestions] = useState<{ id: string, text: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  const addRow = () => {
    setQuestions([...questions, { id: `q${Date.now()}`, text: "" }]);
  };

  const removeRow = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, val: string) => {
    const newQ = [...questions];
    newQ[idx].text = val;
    setQuestions(newQ);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("questions", JSON.stringify(questions.map((q, i) => ({ id: `q${i+1}`, text: q.text, bobot: 0 }))));
    
    startTransition(async () => {
      await createInstrument(formData);
      // Reset form
      (e.target as HTMLFormElement).reset();
      setQuestions([]);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
        <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
        <h2 className="text-lg font-bold text-gray-900">Tambah Instrumen Baru</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kode Tabel</label>
            <input required name="id" type="text" className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Contoh: Tabel 1" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Peruntukan Jenjang</label>
            <select required name="jenjang_peruntukan" className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
              <option value="Semua">Semua Jenjang</option>
              {levels.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
            <input required name="category" type="text" className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Contoh: BUDAYA MUTU" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nama / Judul Tabel</label>
            <input required name="name" type="text" className="w-full p-2.5 border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Ketersediaan dokumen formal..." />
          </div>
        </div>

        <div className="bg-gray-50/50 border border-gray-100 rounded-md p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
            <h3 className="text-sm font-bold text-gray-900">Rincian Pertanyaan / Sub-Indikator</h3>
            <button type="button" onClick={addRow} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center">
              + Tambah Baris
            </button>
          </div>
          
          {questions.length === 0 ? (
            <div className="text-center p-6 text-sm text-gray-400 border border-dashed border-gray-200 rounded">
              Belum ada pertanyaan. Klik &apos;Tambah Baris&apos;
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex gap-2 items-center w-full">
                  <div className="p-2 text-xs font-bold text-gray-400 w-8 text-center">{idx + 1}.</div>
                  <input 
                    type="text" 
                    value={q.text}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    required
                    placeholder="Tuliskan sub-indikator atau pertanyaan..."
                    className="flex-1 p-2 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                  <button type="button" onClick={() => removeRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm disabled:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            {isPending ? "Menyimpan..." : "Simpan Instrumen"}
          </button>
        </div>
      </form>
    </div>
  );
}

