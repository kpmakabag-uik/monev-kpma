"use client";

import { useState } from "react";
import { createDocument, updateDocument } from "@/app/actions/master";

interface DocumentData {
  id: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
}

export default function DocumentForm({ type, title, initialData }: { type: "PERATURAN" | "INSTRUMEN", title: string, initialData?: DocumentData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("type", type);

    try {
      // 1. Upload File if selected
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("customName", formData.get("title") as string);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          throw new Error("Gagal mengunggah file ke Google Drive");
        }

        const { url } = await uploadRes.json();
        formData.set("fileUrl", url);
      } else if (initialData?.fileUrl) {
        formData.set("fileUrl", initialData.fileUrl);
      }

      // 2. Save Document
      if (initialData) {
        await updateDocument(initialData.id, formData);
      } else {
        await createDocument(formData);
      }

      setIsOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {initialData ? (
        <button onClick={() => setIsOpen(true)} className="text-blue-500 hover:text-blue-700 mx-1">
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-institusi hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-all"
        >
          <span>+</span> Tambah {title}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">{initialData ? `Edit ${title}` : `Tambah ${title} Baru`}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Dokumen</label>
                <input 
                  type="text" 
                  name="title"
                  defaultValue={initialData?.title || undefined}
                  required
                  placeholder={`Contoh: SK Pelaksanaan AMI`}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-institusi focus:border-institusi outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan</label>
                <textarea 
                  name="description"
                  defaultValue={initialData?.description || undefined}
                  rows={2}
                  placeholder="Keterangan singkat tentang dokumen ini"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-institusi focus:border-institusi outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">File Dokumen (PDF/Word/Excel)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium transition-colors">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <span>Pilih File</span>
                  </label>
                  <span className="text-xs text-gray-500 truncate max-w-[200px]">
                    {file ? file.name : (initialData?.fileUrl ? "Gunakan file lama" : "Belum ada file")}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Maksimal 5MB. File akan diunggah ke Google Drive.</p>
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

