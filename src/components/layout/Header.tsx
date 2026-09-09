"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getActiveCycle } from "@/app/actions/master";
import { ALL_MENUS } from "@/config/menus";

export default function Header() {
  const [cycle, setCycle] = useState({ tahun: "Loading...", semester: "..." });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getActiveCycle().then(data => {
      if (data) {
        setCycle({ tahun: data.tahun_akademik, semester: data.semester });
      }
    }).catch(console.error);
  }, []);

  const isDashboard = pathname === "/dashboard" || pathname === "/";

  // Determine parent and current menu name
  let parentMenuName = "";
  let currentMenuName = "";

  for (const menu of ALL_MENUS) {
    if (menu.href && (pathname === menu.href || (menu.href !== "/dashboard" && pathname.startsWith(menu.href + "/")))) {
      currentMenuName = menu.name;
      break;
    }
    if (menu.subMenus) {
      for (const sub of menu.subMenus) {
        if (sub.href && (pathname === sub.href || pathname.startsWith(sub.href + "/"))) {
          parentMenuName = menu.name;
          currentMenuName = sub.name;
          break;
        }
      }
      if (currentMenuName) break;
    }
  }

  // Fallbacks for dynamic routes
  if (!currentMenuName && !isDashboard) {
    if (pathname.includes("/monev/")) {
      parentMenuName = "Pengisian MONEV";
      currentMenuName = "Formulir Butir Monev";
    } else if (pathname.includes("/laporan-eksekutif/")) {
      parentMenuName = "Laporan & Eksekutif";
      currentMenuName = "Ringkasan Eksekutif";
    } else {
      currentMenuName = "Menu MONEV";
    }
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 md:px-8 py-3.5 shadow-sm flex items-center justify-between gap-4">
      {/* Left section: Dashboard title OR Back button + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {isDashboard ? (
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight leading-tight">Evaluasi Mutu PT</h2>
            <p className="text-[11px] text-gray-500">Berpedoman pada Standar IAPS 5.1</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg text-xs font-bold border border-gray-200 shadow-sm transition-all group shrink-0 active:scale-95"
              title="Kembali ke menu sebelumnya"
            >
              <svg className="w-4 h-4 text-gray-500 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Kembali</span>
            </button>

            <div className="flex flex-col min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400 font-medium truncate">
                <Link href="/dashboard" className="hover:text-institusi hover:underline">
                  Dashboard
                </Link>
                {parentMenuName && (
                  <>
                    <span>/</span>
                    <span className="text-gray-500">{parentMenuName}</span>
                  </>
                )}
                <span>/</span>
                <span className="text-institusi font-bold truncate">{currentMenuName}</span>
              </div>
              <h2 className="text-sm md:text-base font-bold text-gray-800 tracking-tight leading-tight truncate">
                {currentMenuName}
              </h2>
            </div>
          </div>
        )}
      </div>
      
      {/* Right section: Panduan Button & Active Cycle badge */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Link
          href="/panduan"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 md:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-institusi rounded-lg text-xs font-bold border border-blue-200 shadow-sm transition-all hover:shadow active:scale-95 group"
          title="Buka Pusat Panduan & Pedoman Penggunaan Interaktif"
        >
          <span className="text-sm group-hover:scale-110 transition-transform">💡</span>
          <span className="hidden sm:inline">Panduan Interaktif</span>
        </Link>

        <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-2.5 shadow-inner">
          <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-institusi opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-institusi"></span>
          </div>
          <div className="text-xs md:text-sm">
            <span className="text-gray-500 hidden sm:inline mr-1">Siklus:</span>
            <span className="font-semibold text-institusi">
              {cycle.semester} ({cycle.tahun})
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
