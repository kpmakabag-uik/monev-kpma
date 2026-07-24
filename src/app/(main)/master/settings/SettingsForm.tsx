"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSetting } from "@/app/actions/master";

interface SettingData {
  id: string;
  appscript_url: string | null;
  storage_type: string;
}

export default function SettingsForm({ initialData }: { initialData: SettingData | null }) {
  const [storageType, setStorageType] = useState(initialData?.storage_type || "GDRIVE");
  const [appscriptUrl, setAppscriptUrl] = useState(initialData?.appscript_url || "");

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateSetting(initialData?.id, { 
      storage_type: storageType,
      appscript_url: storageType === "GDRIVE" ? appscriptUrl : null
    });
    setIsLoading(false);
    router.refresh();
    alert("Pengaturan berhasil diperbarui!");
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">

      {/* Kartu Metode Penyimpanan */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold text-gray-800">Metode Penyimpanan Berkas</h3>
          <p className="text-xs text-gray-500 mt-1">Pilih di mana berkas bukti dan dokumen akan disimpan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label 
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              storageType === "GDRIVE" ? "border-institusi bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <input 
              type="radio" 
              name="storageType" 
              value="GDRIVE" 
              checked={storageType === "GDRIVE"}
              onChange={() => setStorageType("GDRIVE")}
              className="w-4 h-4 text-institusi"
            />
            <div>
              <p className="font-bold text-gray-800">Google Drive</p>
              <p className="text-[10px] text-gray-500">Simpan ke Google Drive menggunakan Apps Script (Proxy).</p>
            </div>
          </label>

          <label 
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              storageType === "LOCAL" ? "border-institusi bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <input 
              type="radio" 
              name="storageType" 
              value="LOCAL" 
              checked={storageType === "LOCAL"}
              onChange={() => setStorageType("LOCAL")}
              className="w-4 h-4 text-institusi"
            />
            <div>
              <p className="font-bold text-gray-800">Penyimpanan Lokal</p>
              <p className="text-[10px] text-gray-500">Simpan langsung di folder server (public/uploads).</p>
            </div>
          </label>
        </div>
      </div>

      {/* Kartu Google Apps Script - Hanya tampil jika GDRIVE */}
      {storageType === "GDRIVE" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="border-b pb-2">
            <h3 className="text-lg font-bold text-gray-800">Pengaturan Google Apps Script</h3>
            <p className="text-xs text-gray-500 mt-1">Dibutuhkan Web App URL untuk integrasi dengan Google Drive.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Google Apps Script Web App URL</label>
              <input 
                type="url" 
                value={appscriptUrl}
                onChange={(e) => setAppscriptUrl(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-institusi focus:border-institusi outline-none text-sm font-mono"
                placeholder="https://script.google.com/macros/s/.../exec"
                required={storageType === "GDRIVE"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info Penyimpanan Lokal */}
      {storageType === "LOCAL" && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-blue-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">Info Penyimpanan Lokal</h4>
            <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
              Berkas akan disimpan secara fisik di dalam folder <code className="bg-blue-100 px-1 rounded">public/uploads</code> di direktori aplikasi ini. 
              Pastikan aplikasi memiliki izin tulis (write permission) ke folder tersebut.
            </p>
          </div>
        </div>
      )}
      
      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-institusi hover:bg-blue-800 text-white px-8 py-3 rounded-lg shadow font-bold transition-all text-sm"
        >
          {isLoading ? "Menyimpan..." : "Simpan Semua Pengaturan"}
        </button>
      </div>
    </form>
  )
}
