"use client";

import { useState } from "react";
import { importPreviousCycleData } from "@/app/actions/monev";
import { useRouter } from "next/navigation";

export default function ImportDataButton({ prodiId }: { prodiId: string }) {
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const handleImport = async () => {
    if (!confirm("Apakah Anda yakin ingin mengimpor data dari semester lalu? \n\nData yang sudah Anda isi di semester ini TIDAK akan tertimpa, hanya butir yang masih kosong yang akan diisi otomatis.")) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await importPreviousCycleData(prodiId);
      if (result.success) {
        alert(`Berhasil mengimpor ${result.count} data instrumen dari siklus ${result.from}.`);
        router.refresh();
      } else {
        alert("Gagal impor: " + result.error);
      }
    } catch {
      alert("Terjadi kesalahan saat proses impor.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <button
      onClick={handleImport}
      disabled={isImporting}
      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
      </svg>
      {isImporting ? "Mengimpor..." : "Impor dari Semester Lalu"}
    </button>
  );
}
