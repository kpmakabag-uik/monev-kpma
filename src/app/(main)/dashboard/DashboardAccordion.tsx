"use client";

import { useState } from "react";
import Link from "next/link";

type ProdiProgress = {
  id: string;
  name: string;
  jenjang: string;
  gkmProgress: number;
  gpmProgress: number;
  kbProgress: number;
  kpmaProgress: number;
  isCompleted: boolean;
};

type FacultyProgress = {
  id: string;
  name: string;
  gkmProgress: number;
  gpmProgress: number;
  kbProgress: number;
  kpmaProgress: number;
  prodis: ProdiProgress[];
};

export default function DashboardAccordion({ faculties }: { faculties: FacultyProgress[] }) {
  const [openFaculties, setOpenFaculties] = useState<Record<string, boolean>>({});

  const toggleFaculty = (id: string) => {
    setOpenFaculties((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (faculties.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
        Belum ada data program studi.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faculties.map((faculty) => (
        <div key={faculty.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Faculty Header (Accordion Trigger) */}
          <button
            onClick={() => toggleFaculty(faculty.id)}
            className="w-full px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 hover:bg-gray-100/50 transition-colors border-b border-gray-100 text-left"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className={`transform transition-transform ${openFaculties[faculty.id] ? "rotate-180" : ""}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{faculty.name}</h2>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                {faculty.prodis.length} Prodi
              </span>
            </div>

            {/* Cumulative Progress for Faculty */}
            <div className="flex gap-4 sm:gap-6 w-full sm:w-auto">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">GKM</span>
                <span className="text-sm font-bold text-blue-600">{faculty.gkmProgress}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">GPM</span>
                <span className="text-sm font-bold text-green-600">{faculty.gpmProgress}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Bukti</span>
                <span className="text-sm font-bold text-yellow-600">{faculty.kbProgress}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">KPMA</span>
                <span className="text-sm font-bold text-purple-600">{faculty.kpmaProgress}%</span>
              </div>
            </div>
          </button>

          {/* Prodi List (Accordion Content) */}
          {openFaculties[faculty.id] && (
            <div className="divide-y divide-gray-100">
              {faculty.prodis.map((prodi) => (
                <Link
                  href={`/monev?prodiId=${prodi.id}`}
                  key={prodi.id}
                  className={`block p-6 hover:bg-blue-50/20 transition-colors ${
                    prodi.isCompleted ? "bg-green-50/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-800">{prodi.name}</h3>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-bold border border-gray-200">
                        Jenjang: {prodi.jenjang}
                      </span>
                      {prodi.isCompleted && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold border border-green-200">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Selesai
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 hover:text-blue-600">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>

                  {/* 4 Progress Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* GKM Progress */}
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-semibold text-gray-500">GKM (Evaluasi Diri)</span>
                        <span className="text-xs font-bold text-gray-800">{prodi.gkmProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${prodi.gkmProgress}%` }}></div>
                      </div>
                    </div>

                    {/* GPM Progress */}
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-semibold text-gray-500">GPM (Audit Internal)</span>
                        <span className="text-xs font-bold text-gray-800">{prodi.gpmProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${prodi.gpmProgress}%` }}></div>
                      </div>
                    </div>

                    {/* Bukti Progress */}
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-semibold text-gray-500">Kesesuaian Bukti</span>
                        <span className="text-xs font-bold text-gray-800">{prodi.kbProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-yellow-500 h-1.5 rounded-full transition-all" style={{ width: `${prodi.kbProgress}%` }}></div>
                      </div>
                    </div>

                    {/* KPMA Progress */}
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-semibold text-gray-500">KPMA (Analisis Akhir)</span>
                        <span className="text-xs font-bold text-gray-800">{prodi.kpmaProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${prodi.kpmaProgress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
