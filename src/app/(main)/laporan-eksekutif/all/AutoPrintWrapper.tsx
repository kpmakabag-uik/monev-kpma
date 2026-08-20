"use client";

import { useEffect, useState } from "react";

export default function AutoPrintWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait a brief moment for Recharts and other elements to mount and render fully
    const timer = setTimeout(() => {
      setIsReady(true);
      window.print();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-lg text-sm font-bold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Cetak PDF
        </button>
        <button 
          onClick={() => window.close()}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow-lg text-sm font-bold transition-colors"
        >
          Tutup Tab
        </button>
      </div>

      {!isReady && (
        <div className="print:hidden fixed inset-0 bg-white/80 z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Mempersiapkan dokumen untuk dicetak...</p>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
