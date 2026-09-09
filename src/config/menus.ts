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
  // ==========================================
  // GRUP 1: MONEV MUTU (AKTIVITAS UTAMA)
  // ==========================================
  {
    key: "main.dashboard",
    name: "Dashboard",
    href: "/dashboard",
    group: "MONEV MUTU",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>'
  },
  {
    key: "main.pengisian_monev",
    name: "Pengisian MONEV",
    href: "/monev",
    group: "MONEV MUTU",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>'
  },
  {
    key: "main.bukti",
    name: "Repositori Bukti",
    href: "/bukti",
    group: "MONEV MUTU",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9h4m-4 4h4m-4 4h2"></path>'
  },
  {
    key: "main.laporan_analisis",
    name: "Laporan & Eksekutif",
    group: "MONEV MUTU",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
    subMenus: [
      { key: "main.laporan_analisis.laporan_monev", name: "Laporan MONEV", href: "/laporan", group: "MONEV MUTU" },
      { key: "main.laporan_analisis.laporan_eksekutif_prodi", name: "Eksekutif (Prodi)", href: "/laporan-eksekutif", group: "MONEV MUTU" },
      { key: "main.laporan_analisis.laporan_eksekutif_univ", name: "Eksekutif (Univ)", href: "/laporan-eksekutif/universitas", group: "MONEV MUTU" },
      { key: "main.laporan_analisis.analisis_monev", name: "Analisis KPMA", href: "/master/analisis", group: "MONEV MUTU" },
    ]
  },
  {
    key: "regulasi.menu",
    name: "Regulasi & Panduan",
    group: "MONEV MUTU",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>',
    subMenus: [
      { key: "regulasi.panduan_interaktif", name: "Panduan Interaktif", href: "/panduan", group: "MONEV MUTU" },
      { key: "regulasi.peraturan", name: "Peraturan SPMI", href: "/regulasi/peraturan", group: "MONEV MUTU" },
      { key: "regulasi.panduan", name: "Panduan Instrumen", href: "/regulasi/instrumen", group: "MONEV MUTU" },
    ]
  },

  // ==========================================
  // GRUP 2: PENGATURAN & MASTER (ADMINISTRASI)
  // ==========================================
  {
    key: "master.data_master",
    name: "Data Master",
    group: "PENGATURAN & MASTER",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>',
    subMenus: [
      { key: "master.siklus", name: "Siklus Akademik", href: "/master/cycles", group: "PENGATURAN & MASTER" },
      { key: "master.organisasi.fakultas", name: "Fakultas", href: "/master/faculty", group: "PENGATURAN & MASTER" },
      { key: "master.organisasi.prodi", name: "Program Studi", href: "/master/prodi", group: "PENGATURAN & MASTER" },
      { key: "master.organisasi.jenjang", name: "Jenjang", href: "/master/jenjang", group: "PENGATURAN & MASTER" },
      { key: "master.instrumen", name: "Data Instrumen", href: "/master/instruments", group: "PENGATURAN & MASTER" },
      { key: "master.pengguna", name: "Data Pengguna", href: "/master/users", group: "PENGATURAN & MASTER" },
    ]
  },
  {
    key: "konfigurasi.pengaturan",
    name: "Pengaturan Sistem",
    group: "PENGATURAN & MASTER",
    iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>',
    subMenus: [
      { key: "konfigurasi.umum", name: "Pengaturan Umum", href: "/master/pengaturan", group: "PENGATURAN & MASTER" },
      { key: "konfigurasi.penyimpanan", name: "Penyimpanan Drive", href: "/master/settings", group: "PENGATURAN & MASTER" },
      { key: "konfigurasi.hak_akses", name: "Hak Akses (RBAC)", href: "/master/permissions", group: "PENGATURAN & MASTER" },
    ]
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
