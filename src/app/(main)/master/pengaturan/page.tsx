"use client";

import { useState, useEffect } from "react";
import { getSetting, saveSetting } from "@/app/actions/settings";

export default function PengaturanPage() {
  const [ketuaKpma, setKetuaKpma] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const ketua = await getSetting("KETUA_KPMA", process.env.NEXT_PUBLIC_KETUA_KPMA || "");
      setKetuaKpma(ketua);
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const res = await saveSetting("KETUA_KPMA", ketuaKpma);
    if (res.success) {
      alert("Pengaturan berhasil disimpan");
    } else {
      alert(res.error || "Gagal menyimpan pengaturan");
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="p-6 text-gray-500">Memuat pengaturan...</div>;
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Pengaturan Sistem</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Data Penandatangan</h2>
        
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Ketua KPMA (beserta gelar)
            </label>
            <input
              type="text"
              value={ketuaKpma}
              onChange={(e) => setKetuaKpma(e.target.value)}
              placeholder="Contoh: Dr. Santi Lisnawati, M.Si., M.Pd."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Nama ini akan dicetak pada bagian bawah Laporan Analisis KPMA.
            </p>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center"
            >
              {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
