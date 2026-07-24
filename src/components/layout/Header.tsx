"use client";

import { useEffect, useState } from "react";

import { getActiveCycle } from "@/app/actions/master";

export default function Header() {
  const [cycle, setCycle] = useState({ tahun: "Loading...", semester: "..." });

  useEffect(() => {
    getActiveCycle().then(data => {
      if (data) {
        setCycle({ tahun: data.tahun_akademik, semester: data.semester });
      }
    }).catch(console.error);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 shadow-sm flex items-center justify-between">
      <div className="hidden md:block">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Evaluasi Mutu PT</h2>
        <p className="text-xs text-gray-500 mt-0.5">Berpedoman pada Standar IAPS 5.1</p>
      </div>
      
      <div className="flex items-center w-full md:w-auto justify-end">
        <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg flex items-center gap-3 shadow-inner">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-institusi opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-institusi"></span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 mr-1">Siklus Aktif:</span>
            <span className="font-semibold text-institusi">
              Semester {cycle.semester} ({cycle.tahun})
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
