import React from "react";

export interface MenuDefinition {
  key: string;
  name: string;
  href?: string;
  iconSvg?: string;
  subMenus?: MenuDefinition[];
  group: string;
}

export const ALL_MENUS: MenuDefinition[] = [
  // MAIN GROUP
  {
    key: "main.dashboard",
    name: "Dashboard",
    href: "/dashboard",
    group: "MAIN",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>'
  },
  {
    key: "main.pengisian_monev",
    name: "Pengisian MONEV",
    href: "/monev",
    group: "MAIN",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>'
  },
  {
    key: "main.laporan_analisis",
    name: "Laporan & Analisis",
    group: "MAIN",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
    subMenus: [
      { key: "main.laporan_analisis.laporan_monev", name: "Laporan MONEV", href: "/laporan", group: "MAIN" },
      { key: "main.laporan_analisis.analisis_monev", name: "Analisis MONEV", href: "/master/analisis", group: "MAIN" },
      { key: "main.laporan_analisis.laporan_eksekutif_prodi", name: "Laporan Eksekutif (Prodi)", href: "/laporan-eksekutif", group: "MAIN" },
      { key: "main.laporan_analisis.laporan_eksekutif_univ", name: "Laporan Eksekutif (Univ)", href: "/laporan-eksekutif/universitas", group: "MAIN" },
    ]
  },
  // Khusus non-admin yang hanya punya laporan monev
  {
    key: "main.laporan_monev_only",
    name: "Laporan MONEV",
    href: "/laporan",
    group: "MAIN",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>'
  },
  
  // REGULASI GROUP
  {
    key: "regulasi.peraturan",
    name: "Peraturan",
    href: "/regulasi/peraturan",
    group: "REGULASI",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>'
  },
  {
    key: "regulasi.panduan",
    name: "Panduan Instrumen",
    href: "/regulasi/instrumen",
    group: "REGULASI",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>'
  },
  
  // MASTER DATA GROUP
  {
    key: "master.siklus",
    name: "Siklus Akademik",
    href: "/master/cycles",
    group: "MASTER DATA",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>'
  },
  {
    key: "master.organisasi",
    name: "Data Organisasi",
    group: "MASTER DATA",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>',
    subMenus: [
      { key: "master.organisasi.fakultas", name: "Fakultas", href: "/master/faculty", group: "MASTER DATA" },
      { key: "master.organisasi.prodi", name: "Program Studi", href: "/master/prodi", group: "MASTER DATA" },
      { key: "master.organisasi.jenjang", name: "Jenjang", href: "/master/jenjang", group: "MASTER DATA" },
    ]
  },
  {
    key: "master.instrumen",
    name: "Data Instrumen",
    href: "/master/instruments",
    group: "MASTER DATA",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>'
  },
  {
    key: "master.pengguna",
    name: "Data Pengguna",
    href: "/master/users",
    group: "MASTER DATA",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>'
  },
  
  // KONFIGURASI GROUP
  {
    key: "konfigurasi.umum",
    name: "Pengaturan Umum",
    href: "/master/pengaturan",
    group: "KONFIGURASI",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>'
  },
  {
    key: "konfigurasi.penyimpanan",
    name: "Penyimpanan",
    href: "/master/settings",
    group: "KONFIGURASI",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>'
  },
  {
    key: "konfigurasi.hak_akses",
    name: "Hak Akses (RBAC)",
    href: "/master/permissions",
    group: "KONFIGURASI",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>'
  }
];

// Flat map of all accessible menu keys (including submenus)
export const getAllMenuKeys = (): string[] => {
  const keys: string[] = [];
  ALL_MENUS.forEach(menu => {
    keys.push(menu.key);
    if (menu.subMenus) {
      menu.subMenus.forEach(sub => keys.push(sub.key));
    }
  });
  return keys;
};
