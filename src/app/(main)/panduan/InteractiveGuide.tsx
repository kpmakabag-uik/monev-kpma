"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface InteractiveGuideProps {
  currentUserRole: string;
  currentUserName: string;
}

// 1. DATA PERAN & TUGAS
interface RoleGuide {
  id: string;
  title: string;
  roleName: string;
  badgeColor: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  tagline: string;
  mainGoals: string[];
  keyMenus: { name: string; href: string; desc: string }[];
  steps: { step: number; title: string; desc: string; tip?: string }[];
}

const ROLES_DATA: RoleGuide[] = [
  {
    id: "GKM",
    title: "GKM (Program Studi / Kaprodi)",
    roleName: "Gugus Kendali Mutu",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    bgColor: "from-blue-50/80 to-white",
    borderColor: "border-blue-200",
    icon: "🎓",
    tagline: "Pelaksana evaluasi diri mandiri, penyedia bukti otentik, dan penanggung jawab keabsahan data mutu prodi.",
    mainGoals: [
      "Mengisi seluruh butir instrumen IAPS 5.1 sesuai jenjang prodi.",
      "Mengunggah dokumen bukti terverifikasi ke Google Drive sistem.",
      "Menyusun catatan evaluasi diri yang mencerminkan kondisi riil.",
      "Mengunci pengisian dan mengesahkan Pakta Integritas sebelum batas waktu (due date).",
    ],
    keyMenus: [
      { name: "Pengisian MONEV", href: "/monev", desc: "Formulir instrumen butir evaluasi diri & upload dokumen." },
      { name: "Repositori Bukti", href: "/bukti", desc: "Arsip seluruh bukti terunggah prodi & ekspor Excel F4." },
      { name: "Laporan MONEV", href: "/laporan", desc: "Preview laporan mutu prodi dan dokumen resmi analisis KPMA." },
      { name: "Dashboard", href: "/dashboard", desc: "Pantau persentase progres pengisian butir dan hitung mundur waktu." },
    ],
    steps: [
      {
        step: 1,
        title: "Periksa Siklus & Batas Waktu",
        desc: "Buka menu Dashboard atau Pengisian MONEV. Perhatikan banner hitung mundur (countdown timer) di bagian atas untuk mengetahui sisa hari pengisian.",
        tip: "Jika waktu habis, formulir akan otomatis terkunci (hanya-baca).",
      },
      {
        step: 2,
        title: "Pilih Butir Instrumen",
        desc: "Masuk ke Pengisian MONEV, klik salah satu instrumen (misal: BM-1 Budaya Mutu). Sistem menampilkan pertanyaan, opsi skor/jawaban, dan kotak temuan evaluasi diri.",
      },
      {
        step: 3,
        title: "Unggah Dokumen Bukti ke Drive",
        desc: "Klik tombol 'Unggah Bukti' pada butir terkait. File otomatis tersimpan di Google Drive universitas dan diberi nama terstruktur (contoh: Dokumen Bukti BM-1-1A-01).",
        tip: "Dapat mengunggah lebih dari 1 file per butir dan menambahkan tautan URL eksternal.",
      },
      {
        step: 4,
        title: "Simpan Jawaban",
        desc: "Klik tombol 'Simpan Jawaban' di bagian bawah. Status butir akan berubah warna menjadi hijau (Selesai).",
      },
      {
        step: 5,
        title: "Kunci & Sahkan Pakta Integritas",
        desc: "Setelah seluruh instrumen prodi selesai 100%, klik tombol 'Kunci & Sahkan Pengisian (Pakta Integritas)'. Isi nama PIC dan centang pernyataan keabsahan.",
        tip: "Setelah dikunci, formulir prodi berstatus Terkunci. Jika perlu revisi, hubungi KPMA untuk membuka kuncian (Reopen).",
      },
    ],
  },
  {
    id: "GPM",
    title: "GPM (Fakultas / Gugus Penjaminan Mutu)",
    roleName: "Auditor Mutu Fakultas",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    bgColor: "from-emerald-50/80 to-white",
    borderColor: "border-emerald-200",
    icon: "🏛️",
    tagline: "Pemeriksa kesesuaian dokumen bukti, pemberi rekomendasi auditor, dan pengawal mutu fakultas.",
    mainGoals: [
      "Mengaudit kelengkapan dan kesesuaian bukti yang diunggah oleh seluruh prodi di bawah fakultas.",
      "Memberikan penilaian kesesuaian bukti (Sesuai / Kurang / Tidak Sesuai).",
      "Menuliskan catatan auditor / rekomendasi perbaikan butir instrumen.",
      "Memantau capaian pengisian prodi se-fakultas pada Dashboard.",
    ],
    keyMenus: [
      { name: "Dashboard Fakultas", href: "/dashboard", desc: "Monitoring rekapitulasi progres pengisian seluruh prodi fakultas." },
      { name: "Pengisian MONEV", href: "/monev", desc: "Pilih prodi untuk memeriksa jawaban dan mengisi penilaian auditor." },
      { name: "Repositori Bukti", href: "/bukti", desc: "Eksplorasi dan unduh berkas bukti seluruh prodi se-fakultas." },
      { name: "Analisis KPMA", href: "/master/analisis", desc: "Melihat catatan analisis dan rekomendasi resmi dari KPMA." },
    ],
    steps: [
      {
        step: 1,
        title: "Monitoring Progres Prodi",
        desc: "Pantau tabel progres di Dashboard. Identifikasi prodi yang telah mengisi bukti dan siap diaudit.",
      },
      {
        step: 2,
        title: "Buka Butir Pengisian Prodi",
        desc: "Masuk ke Pengisian MONEV, pilih nama Program Studi yang akan diaudit, lalu buka butir instrumen.",
      },
      {
        step: 3,
        title: "Uji Bukti & Tentukan Kesesuaian",
        desc: "Klik link bukti Google Drive untuk membuka berkas. Pada kolom auditor, tentukan status 'Kesesuaian Bukti' (Sesuai / Kurang / Tidak Sesuai).",
      },
      {
        step: 4,
        title: "Tulis Catatan Auditor",
        desc: "Tuliskan temuan audit, catatan rekomendasi, atau kekurangan dokumen pada kolom 'Catatan Auditor' lalu klik simpan.",
        tip: "Catatan ini dapat langsung dibaca oleh Prodi dan menjadi bahan analisis KPMA.",
      },
    ],
  },
  {
    id: "KPMA",
    title: "KPMA (Kantor Penjaminan Mutu Akademik)",
    roleName: "Administrator Universitas",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    bgColor: "from-purple-50/80 to-white",
    borderColor: "border-purple-200",
    icon: "⚙️",
    tagline: "Pusat kendali standar penjaminan mutu universitas, administrator siklus, perumus analisis mutu, dan pengambil kebijakan sistem.",
    mainGoals: [
      "Mengatur siklus akademik, tanggal mulai, dan batas akhir pengisian (due date).",
      "Merumuskan analisis butir mutu dan tindak lanjut per prodi.",
      "Menerbitkan hasil analisis secara massal per fakultas atau universitas (1-klik).",
      "Mengelola data master instrumen (import/export Excel), prodi, fakultas, dan akun pengguna.",
      "Memonitor repositori bukti universitas dan ekspor siap cetak F4 Landscape.",
    ],
    keyMenus: [
      { name: "Analisis MONEV KPMA", href: "/master/analisis", desc: "Lembar kerja analisis mutu & tombol Publikasi Massal." },
      { name: "Siklus Akademik", href: "/master/cycles", desc: "Set tahun akademik aktif, tanggal mulai & batas akhir (auto-lock)." },
      { name: "Repositori Bukti", href: "/bukti", desc: "Pencarian multi-dimensi seluruh bukti universitas & export Excel 2 sheet." },
      { name: "Data Instrumen", href: "/master/instruments", desc: "Manajemen butir, import/export template Excel instrumen." },
      { name: "Data Pengguna", href: "/master/users", desc: "Kelola akun pengguna, reset password, dan fitur impersonasi." },
      { name: "Penyimpanan Drive", href: "/master/settings", desc: "Koneksi Google Drive Web App Script & folder induk." },
    ],
    steps: [
      {
        step: 1,
        title: "Buka Siklus & Atur Tenggat Waktu",
        desc: "Masuk ke Data Master > Siklus Akademik. Tambahkan siklus baru atau aktifkan siklus yang berjalan, tentukan Start Date dan End Date.",
        tip: "Formulir prodi akan otomatis terkunci jika tanggal melewati End Date.",
      },
      {
        step: 2,
        title: "Perumusan Analisis & Rekomendasi",
        desc: "Buka menu Analisis KPMA (/master/analisis). Pilih fakultas dan prodi, lalu isi 'Analisis KPMA' dan 'Tindak Lanjut KPMA' per butir.",
      },
      {
        step: 3,
        title: "Publikasi Hasil Analisis",
        desc: "Gunakan fitur '📢 Publikasi Massal' untuk menerbitkan analisis draft menjadi status TERBIT resmi untuk seluruh prodi se-fakultas atau se-universitas dalam satu klik.",
        tip: "Sebelum diterbitkan, catatan hanya berstatus Draft Internal yang hanya terlihat oleh tim KPMA.",
      },
      {
        step: 4,
        title: "Buka Kunci Prodi (Reopen) jika Diperlukan",
        desc: "Jika prodi yang telah mengunci Pakta Integritas memerlukan perbaikan data resmi, KPMA dapat membuka kembali status kuncian via tabel submission.",
      },
    ],
  },
  {
    id: "PIMPINAN",
    title: "PIMPINAN (Dekan / Rektor / Warek)",
    roleName: "Eksekutif Universitas & Fakultas",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    bgColor: "from-amber-50/80 to-white",
    borderColor: "border-amber-200",
    icon: "📊",
    tagline: "Pengambil keputusan strategis berbasis visualisasi data mutu agregat, capaian akreditasi, dan ringkasan eksekutif.",
    mainGoals: [
      "Melihat profil mutu agregat fakultas atau universitas melalui diagram radar 9 Kriteria IAPS 5.1.",
      "Mengevaluasi rekapitulasi skor kelengkapan dan kepatuhan SPMI.",
      "Mengakses dokumen resmi Analisis KPMA sebagai bahan Rapat Tinjauan Manajemen (RTM).",
      "Memeriksa repositori bukti dokumen pendukung akreditasi.",
    ],
    keyMenus: [
      { name: "Eksekutif (Prodi)", href: "/laporan-eksekutif", desc: "Ringkasan eksekutif dan profil capaian per program studi." },
      { name: "Eksekutif (Univ)", href: "/laporan-eksekutif/universitas", desc: "Agregasi mutu universitas lintas seluruh fakultas." },
      { name: "Dokumen Analisis KPMA", href: "/master/analisis", desc: "Laporan catatan tindak lanjut mutu yang diterbitkan resmi." },
      { name: "Repositori Bukti", href: "/bukti", desc: "Arsip berkas akreditasi tingkat fakultas & universitas." },
    ],
    steps: [
      {
        step: 1,
        title: "Akses Ringkasan Eksekutif",
        desc: "Buka menu Laporan & Eksekutif > Eksekutif (Univ) atau Eksekutif (Prodi).",
      },
      {
        step: 2,
        title: "Analisis Grafik Radar 9 Kriteria",
        desc: "Amati kekuatan dan kelemahan standar mutu (Budaya Mutu, Relevansi Pendidikan, Penelitian, PkM, Akuntabilitas, Sarpras, dll.).",
      },
      {
        step: 3,
        title: "Tinjau Dokumen Analisis KPMA",
        desc: "Buka Dokumen Analisis KPMA untuk membaca rekomendasi strategis per butir sebelum menyusun Rencana Tindak Lanjut (RTL) institusi.",
      },
    ],
  },
];

// 2. DATA ALUR BISNIS PPEPP INTERAKTIF
const WORKFLOW_STEPS = [
  {
    step: 1,
    name: "Penetapan Siklus",
    role: "KPMA",
    icon: "📅",
    color: "blue",
    summary: "Penetapan tahun akademik aktif, tanggal mulai, dan batas tenggat (due date) pengisian formulir.",
    details: [
      "KPMA menentukan kalender SPMI melalui menu Siklus Akademik.",
      "Sistem mengaktifkan hitung mundur (countdown banner) di halaman MONEV.",
      "Siklus terkunci otomatis saat melewati tenggat waktu.",
    ],
  },
  {
    step: 2,
    name: "Evaluasi Diri & Bukti",
    role: "GKM Prodi",
    icon: "📝",
    color: "emerald",
    summary: "Prodi mengisi butir instrumen IAPS 5.1, mengunggah bukti ke Google Drive, dan mengisi temuan evaluasi diri.",
    details: [
      "Mengisi pilihan skor/kondisi faktual pada tiap butir pertanyaan.",
      "Mengunggah dokumen PDF/gambar bukti; tautan tersimpan aman di Google Drive institusi.",
      "Mengunci data dan menandatangani Pakta Integritas digital.",
    ],
  },
  {
    step: 3,
    name: "Audit Dokumen",
    role: "GPM Fakultas",
    icon: "🔍",
    color: "purple",
    summary: "Auditor fakultas memverifikasi bukti yang diunggah, memberikan status kesesuaian, dan menuliskan catatan rekomendasi.",
    details: [
      "Membuka berkas bukti langsung melalui tautan Google Drive terintegrasi.",
      "Memberikan status Kesesuaian Bukti: Sesuai, Kurang, atau Tidak Sesuai.",
      "Menuliskan Catatan Auditor per butir sebagai masukan perbaikan bagi Prodi.",
    ],
  },
  {
    step: 4,
    name: "Analisis Mutu",
    role: "KPMA",
    icon: "📈",
    color: "amber",
    summary: "KPMA merumuskan catatan analisis komprehensif, rekomendasi tindak lanjut, dan menerbitkan secara massal.",
    details: [
      "Mengisi lembar kerja Analisis KPMA dan Tindak Lanjut Mutu per butir instrumen.",
      "Memilih status Draft (internal) atau Terbit (resmi terbaca prodi & fakultas).",
      "Fitur Publikasi Massal per Fakultas / Universitas dalam 1 klik cepat.",
    ],
  },
  {
    step: 5,
    name: "Tinjauan Manajemen",
    role: "Pimpinan & Rektor",
    icon: "🏛️",
    color: "rose",
    summary: "Pimpinan memonitor capaian agregat universitas melalui visualisasi radar dan laporan eksekutif untuk RTM.",
    details: [
      "Menganalisis capaian 9 kriteria akreditasi IAPS 5.1.",
      "Mencetak laporan eksekutif dan mengekspor rekapitulasi bukti F4 Landscape.",
      "Menyusun Rencana Tindak Lanjut (RTL) untuk peningkatan mutu berkelanjutan (Kaizen).",
    ],
  },
];

// 3. DATA FITUR UNGGULAN & CARA KERJA
const FEATURES_CATALOG = [
  {
    id: "repositori-bukti",
    title: "Repositori Dokumen Bukti & Ekspor Excel F4",
    badge: "Fitur Unggulan",
    badgeColor: "bg-emerald-100 text-emerald-800",
    icon: "📁",
    desc: "Pusat arsip seluruh dokumen bukti akreditasi universitas dengan indexing otomatis dan pencarian instan.",
    highlights: [
      "Indexing otomatis saat bukti diunggah ke Google Drive.",
      "Pencarian cerdas 5 arah: Nama File, Kode Butir (misal: AK-24), Nama Prodi, Pertanyaan, & Catatan Evaluasi Diri.",
      "Filter otomatis sesuai jenjang prodi yang dipilih (S1, S2, S3, D3, atau Semua).",
      "Ekspor Excel 2-Sheet Siap Cetak Folio / F4 Landscape: Sheet 1 (Bukti + Hyperlink Drive aktif), Sheet 2 (Checklist butir belum ada bukti & KPI mutu).",
    ],
    quickLink: "/bukti",
    linkText: "Buka Repositori Bukti →",
  },
  {
    id: "analisis-kpma",
    title: "Analisis MONEV KPMA & Publikasi Massal",
    badge: "Otomasi KPMA",
    badgeColor: "bg-purple-100 text-purple-800",
    icon: "📢",
    desc: "Ruang kerja perumusan rekomendasi mutu oleh tim penjaminan mutu tingkat universitas.",
    highlights: [
      "Dua status publikasi: 'Draft Internal' (rahasia tim KPMA) dan 'Terbit' (resmi dapat dilihat prodi & fakultas).",
      "Tombol Publikasi Massal: Terbitkan atau tarik draft seluruh prodi per fakultas atau seluruh universitas dalam 1 klik.",
      "Akses dokumen resmi analisis dapat dibuka oleh Prodi langsung dari sidebar atau tombol [Dokumen Analisis KPMA].",
    ],
    quickLink: "/master/analisis",
    linkText: "Buka Analisis KPMA →",
  },
  {
    id: "auto-lock",
    title: "Hitung Mundur & Auto-Lock Batas Waktu",
    badge: "Integritas Data",
    badgeColor: "bg-rose-100 text-rose-800",
    icon: "⏳",
    desc: "Sistem penguncian otomatis untuk menjamin kedisiplinan jadwal pengisian evaluasi diri.",
    highlights: [
      "Banner hitung mundur (countdown) aktif secara real-time di halaman pengisian.",
      "Formulir prodi otomatis terkunci saat melewati batas waktu (due date) yang ditentukan KPMA.",
      "Prodi menandatangani Pakta Integritas digital saat menyelesaikan butir pengisian.",
      "KPMA memiliki fasilitas pembukaan kunci (Reopen) jika ada pengajuan revisi resmi.",
    ],
    quickLink: "/master/cycles",
    linkText: "Kelola Siklus & Batas Waktu →",
  },
  {
    id: "laporan-eksekutif",
    title: "Laporan Eksekutif & Visualisasi Radar IAPS 5.1",
    badge: "Executive Insight",
    badgeColor: "bg-blue-100 text-blue-800",
    icon: "📈",
    desc: "Dasbor agregat visual untuk Pimpinan Universitas (Rektor/Warek) dan Pimpinan Fakultas (Dekan).",
    highlights: [
      "Visualisasi diagram radar interaktif 9 kriteria akreditasi IAPS 5.1.",
      "Tabel matriks skor rata-rata capaian per kriteria mutu.",
      "Filter prodi, fakultas, dan jenjang secara fleksibel.",
      "Cetak laporan resmi siap pakai untuk bahan akreditasi institusi.",
    ],
    quickLink: "/laporan-eksekutif/universitas",
    linkText: "Buka Eksekutif Universitas →",
  },
  {
    id: "data-master",
    title: "Manajemen Data Master & Import Excel",
    badge: "Administrasi",
    badgeColor: "bg-gray-100 text-gray-800",
    icon: "🗄️",
    desc: "Pengelolaan struktur organisasi universitas, data instrumen, dan sinkronisasi berkas.",
    highlights: [
      "Import data butir instrumen secara massal menggunakan file template Excel (.xlsx).",
      "Preview data instrumen sebelum diproses ke database untuk mencegah duplikasi.",
      "Manajemen akun pengguna dan fitur Impersonasi (Login sebagai pengguna lain tanpa password).",
      "Konfigurasi Google Drive Web App Script untuk penyimpanan berkas cloud.",
    ],
    quickLink: "/master/instruments",
    linkText: "Kelola Instrumen MONEV →",
  },
];

// 4. FAQ INTERAKTIF
const FAQ_ITEMS = [
  {
    q: "Bagaimana jika formulir pengisian prodi berstatus 'Terkunci'?",
    a: "Formulir prodi terkunci terjadi karena dua alasan: (1) Prodi telah menekan tombol 'Kunci & Sahkan Pakta Integritas', atau (2) Batas waktu (due date) siklus telah terlewati. Jika perlu melakukan perubahan data atau penambahan bukti baru, silakan menghubungi administrator KPMA untuk mengajukan permohonan pembukaan kunci kembali (Reopen).",
    category: "Pengisian MONEV",
  },
  {
    q: "Di mana berkas bukti disimpan dan apakah ada batasan format?",
    a: "Seluruh berkas bukti disimpan secara aman di Google Drive resmi universitas yang terintegrasi melalui Google Apps Script. Format file yang didukung meliputi PDF, Dokumen Word, Spreadsheet Excel, serta gambar (JPG/PNG). Batas ukuran file per dokumen yang disarankan adalah di bawah 25 MB.",
    category: "Repositori Bukti",
  },
  {
    q: "Bagaimana cara mencetak Ekspor Excel Repositori Bukti agar pas di kertas?",
    a: "File Excel yang diekspor dari tombol [📥 Export Excel] sudah dikonfigurasi secara baku siap cetak: Ukuran kertas Folio / F4 (paper size 14), Orientasi Landscape, Skala 'Fit All Columns on One Page', dan perulangan header tabel di setiap halaman berikutnya. Anda cukup menekan tombol Print / Cetak di aplikasi Excel.",
    category: "Repositori Bukti",
  },
  {
    q: "Apa perbedaan peran GKM dan GPM dalam pengisian formulir?",
    a: "GKM (Gugus Kendali Mutu di tingkat Program Studi) bertugas melakukan evaluasi diri mandiri dan mengunggah berkas bukti. Sedangkan GPM (Gugus Penjaminan Mutu di tingkat Fakultas) bertugas sebagai auditor internal yang memverifikasi kesesuaian bukti dan memberikan catatan rekomendasi perbaikan.",
    category: "Peran & Akses",
  },
  {
    q: "Kapan dokumen Analisis KPMA dapat dibaca oleh Program Studi?",
    a: "Catatan Analisis KPMA baru dapat dibaca oleh Program Studi dan Fakultas setelah administrator KPMA mengubah statusnya dari 'Draft Internal' menjadi 'Terbit (Resmi)' atau menggunakan tombol '📢 Publikasi Massal'. Dokumen dapat diakses via sidebar 'Analisis KPMA' atau tombol [📑 Dokumen Analisis KPMA] di halaman laporan.",
    category: "Analisis KPMA",
  },
  {
    q: "Mengapa tautan Google Drive pada laporan meminta izin akses?",
    a: "Pastikan berkas di Google Drive universitas memiliki pengaturan izin akses 'Siapa saja yang memiliki link dapat melihat' (Anyone with link - Viewer). Konfigurasi ini biasanya dikelola secara otomatis oleh script Google Apps Script KPMA saat file pertama kali diunggah.",
    category: "Google Drive",
  },
];

export default function InteractiveGuide({ currentUserRole, currentUserName }: InteractiveGuideProps) {
  // State: Tab Navigasi Panduan Utama
  const [activeTab, setActiveTab] = useState<"peran" | "alur" | "fitur" | "simulator" | "faq">("peran");

  // State: Pemilihan Peran
  const initialRoleId = ["KPMA", "GPM", "GKM", "PIMPINAN_FAKULTAS", "PIMPINAN_UNIVERSITAS"].includes(currentUserRole)
    ? currentUserRole.startsWith("PIMPINAN")
      ? "PIMPINAN"
      : currentUserRole
    : "GKM";
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId);

  // State: Alur Stepper
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);

  // State: Pencarian Panduan Cepat
  const [searchQuery, setSearchQuery] = useState("");

  // State: FAQ Accordion
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  // State: Simulasi Interaktif
  const [simStep, setSimStep] = useState<"gkm" | "gpm" | "kpma" | "export">("gkm");
  const [simAnswer, setSimAnswer] = useState("A");
  const [simFilesCount, setSimFilesCount] = useState(2);
  const [simAuditorStatus, setSimAuditorStatus] = useState("Sesuai");
  const [simIsLocked, setSimIsLocked] = useState(false);
  const [simPublishStatus, setSimPublishStatus] = useState<"Draft" | "Terbit">("Draft");

  const toggleFaq = (index: number) => {
    setOpenFaqIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const selectedRole = useMemo(() => {
    return ROLES_DATA.find(r => r.id === selectedRoleId) || ROLES_DATA[0];
  }, [selectedRoleId]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_ITEMS;
    const q = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(
      item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO BANNER INTERAKTIF */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-10 shadow-xl border border-blue-800">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <span>💡 Pusat Bantuan & Edukasi Sistem</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Standar IAPS 5.1</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Pedoman Interaktif Penggunaan <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-200">
              Platform SiMONEV KPMA
            </span>
          </h1>

          <p className="text-sm md:text-base text-blue-100/90 leading-relaxed max-w-3xl">
            Selamat datang, <strong className="text-white underline decoration-blue-400 underline-offset-2">{currentUserName}</strong> ({currentUserRole}).
            Halaman ini adalah panduan komprehensif yang memandu seluruh alur kerja, pengisian instrumen,
            verifikasi auditor, analisis mutu eksekutif, hingga repositori berkas akreditasi universitas.
          </p>

          {/* Quick Search Box */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik panduan (misal: unggah bukti, pakta integritas, ekspor excel, auto-lock)..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-gray-900 placeholder-blue-200 focus:placeholder-gray-400 rounded-xl text-sm border border-white/20 focus:border-white focus:ring-4 focus:ring-blue-400/30 transition-all outline-none backdrop-blur-md shadow-inner"
              />
              <span className="absolute left-3.5 top-3.5 text-blue-200 pointer-events-none text-base">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-xs bg-white/20 hover:bg-white/30 text-white rounded-md px-2 py-1 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Stat Badges */}
          <div className="pt-3 flex flex-wrap gap-2 md:gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 flex items-center gap-2">
              <span>🏛️</span>
              <span className="font-semibold text-white">4 Peran Pengguna</span>
              <span className="text-blue-200">(GKM, GPM, KPMA, Pimpinan)</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 flex items-center gap-2">
              <span>📊</span>
              <span className="font-semibold text-white">9 Kriteria Mutu</span>
              <span className="text-blue-200">(IAPS 5.1 BAN-PT)</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 flex items-center gap-2">
              <span>📄</span>
              <span className="font-semibold text-white">63 Butir Instrumen</span>
              <span className="text-blue-200">Terstruktur</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 flex items-center gap-2">
              <span>🗂️</span>
              <span className="font-semibold text-white">3.200+ Bukti Mutu</span>
              <span className="text-blue-200">Terkoneksi Drive</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGASI UTAMA PANDUAN */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl shadow-sm px-2 pt-2 gap-1 overflow-x-auto custom-scrollbar-main">
        <button
          onClick={() => setActiveTab("peran")}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "peran"
              ? "border-institusi text-institusi bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <span>👤</span>
          <span>Panduan per Peran (Role)</span>
        </button>

        <button
          onClick={() => setActiveTab("alur")}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "alur"
              ? "border-institusi text-institusi bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <span>🔄</span>
          <span>Alur Siklus SPMI (PPEPP)</span>
        </button>

        <button
          onClick={() => setActiveTab("fitur")}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "fitur"
              ? "border-institusi text-institusi bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <span>⭐</span>
          <span>Katalog Fitur & Fasilitas</span>
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "simulator"
              ? "border-institusi text-institusi bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <span>🎮</span>
          <span>Simulasi Fitur Interaktif</span>
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "faq"
              ? "border-institusi text-institusi bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <span>❓</span>
          <span>FAQ & Solusi Kendala</span>
          {searchQuery && (
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {filteredFaqs.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. KONTEN TAB: PANDUAN PER PERAN */}
      {activeTab === "peran" && (
        <div className="space-y-6">
          {/* Role Switcher Pills */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span>Pilih Peran Akun Anda:</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Panduan, alur, dan menu kunci akan menyesuaikan secara spesifik berdasarkan peran yang dipilih.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {ROLES_DATA.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all border ${
                    selectedRoleId === role.id
                      ? "bg-institusi text-white border-institusi shadow-md scale-105"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <span className="text-sm">{role.icon}</span>
                  <span>{role.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Card */}
          <div className={`rounded-2xl border p-6 md:p-8 bg-gradient-to-br ${selectedRole.bgColor} ${selectedRole.borderColor} shadow-sm space-y-6 transition-all`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/80">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-3xl">
                  {selectedRole.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900">{selectedRole.title}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${selectedRole.badgeColor}`}>
                      {selectedRole.roleName}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-2xl">{selectedRole.tagline}</p>
                </div>
              </div>
            </div>

            {/* Dua Kolom: Tanggung Jawab & Menu Kunci */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tanggung Jawab */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <span>🎯</span> Tanggung Jawab & Tugas Utama
                </h4>
                <ul className="space-y-2 text-xs md:text-sm text-gray-700">
                  {selectedRole.mainGoals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Menu Kunci & Pintasan Cepat */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <span>🚀</span> Menu Navigasi Utama & Akses Cepat
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRole.keyMenus.map((menu, idx) => (
                    <Link
                      key={idx}
                      href={menu.href}
                      className="group p-3 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-800 group-hover:text-institusi">
                          {menu.name}
                        </span>
                        <span className="text-gray-400 group-hover:text-institusi text-xs font-bold transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{menu.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Panduan Langkah Demi Langkah (Step by Step) */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <span>📋</span> Langkah Penggunaan Operasional {selectedRole.id}
              </h4>

              <div className="space-y-3">
                {selectedRole.steps.map((step) => (
                  <div
                    key={step.step}
                    className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm flex items-start gap-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-institusi text-white font-extrabold flex items-center justify-center shrink-0 text-sm shadow">
                      {step.step}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h5 className="text-sm font-bold text-gray-900">{step.title}</h5>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                      {step.tip && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800 font-medium">
                          <span>💡</span>
                          <span><strong>Tips:</strong> {step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. KONTEN TAB: ALUR SIKLUS SPMI (PPEPP) */}
      {activeTab === "alur" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🔄</span> Alur Kerja Standar Penjaminan Mutu (PPEPP)
            </h3>
            <p className="text-xs md:text-sm text-gray-600 max-w-3xl">
              Sistem MONEV KPMA mengimplementasikan siklus SPMI berbasis standar <strong>IAPS 5.1 BAN-PT</strong> yang
              terintegrasi antara Program Studi, Fakultas, Auditor Internal, dan Kantor Penjaminan Mutu Akademik.
            </p>
          </div>

          {/* Interactive Stepper Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {WORKFLOW_STEPS.map((step) => {
              const isActive = activeWorkflowStep === step.step;
              return (
                <button
                  key={step.step}
                  onClick={() => setActiveWorkflowStep(step.step)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isActive
                      ? "bg-institusi text-white border-institusi shadow-lg scale-102 ring-4 ring-blue-100"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{step.icon}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Tahap {step.step}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs md:text-sm tracking-tight">{step.name}</h4>
                  <p className={`text-[11px] mt-1 line-clamp-1 ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                    PIC: {step.role}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Stepper Detail Box */}
          {(() => {
            const current = WORKFLOW_STEPS.find((s) => s.step === activeWorkflowStep) || WORKFLOW_STEPS[0];
            return (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-3 bg-blue-50 rounded-xl">{current.icon}</span>
                    <div>
                      <span className="text-xs font-bold text-institusi uppercase tracking-wider">
                        Tahap {current.step} dari 5
                      </span>
                      <h3 className="text-xl font-extrabold text-gray-900">{current.name}</h3>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-lg border border-gray-200">
                    Penanggung Jawab: <span className="text-institusi font-black">{current.role}</span>
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs md:text-sm text-blue-900 font-medium">
                  <strong>Ringkasan Alur:</strong> {current.summary}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    Aktivitas & Ketentuan Sistem pada Tahap Ini:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {current.details.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mb-2">
                          {idx + 1}
                        </div>
                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <button
                    disabled={activeWorkflowStep <= 1}
                    onClick={() => setActiveWorkflowStep((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold disabled:opacity-40 transition-colors"
                  >
                    ← Tahap Sebelumnya
                  </button>

                  <button
                    disabled={activeWorkflowStep >= WORKFLOW_STEPS.length}
                    onClick={() => setActiveWorkflowStep((prev) => Math.min(WORKFLOW_STEPS.length, prev + 1))}
                    className="px-4 py-2 bg-institusi hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-40 transition-colors shadow-sm"
                  >
                    Tahap Selanjutnya →
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 5. KONTEN TAB: KATALOG FITUR & FASILITAS */}
      {activeTab === "fitur" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>⭐</span> Katalog Fitur & Inovasi SiMONEV KPMA
            </h3>
            <p className="text-xs md:text-sm text-gray-600 max-w-3xl">
              Platform dirancang khusus dengan berbagai fitur otomatisasi untuk mempercepat akreditasi,
              menghindari kehilangan berkas bukti, dan mempermudah audit mutu perguruan tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES_CATALOG.map((feat) => (
              <div
                key={feat.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-3xl p-2.5 bg-gray-50 border border-gray-100 rounded-xl">{feat.icon}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base md:text-lg font-extrabold text-gray-900">{feat.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{feat.desc}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Kemampuan Utama:
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-700">
                      {feat.highlights.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold shrink-0">•</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Link
                    href={feat.quickLink}
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gray-50 hover:bg-institusi text-gray-700 hover:text-white rounded-xl text-xs font-bold transition-all border border-gray-200 hover:border-institusi shadow-sm"
                  >
                    {feat.linkText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. KONTEN TAB: SIMULASI FITUR INTERAKTIF (SANDBOX) */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🎮</span> Simulasi Interaktif Komponen Sistem
            </h3>
            <p className="text-xs md:text-sm text-gray-600 max-w-3xl">
              Coba langsung alur simulasi antarmuka di bawah ini untuk memahami secara visual bagaimana data diproses,
              dikunci, diaudit, diterbitkan, dan diekspor ke format cetak.
            </p>
          </div>

          {/* Simulator Controls */}
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-200 flex flex-wrap gap-2">
            <button
              onClick={() => setSimStep("gkm")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                simStep === "gkm" ? "bg-white text-institusi shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              1. Simulasi Input GKM (Prodi)
            </button>
            <button
              onClick={() => setSimStep("gpm")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                simStep === "gpm" ? "bg-white text-emerald-700 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              2. Simulasi Verifikasi GPM (Fakultas)
            </button>
            <button
              onClick={() => setSimStep("kpma")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                simStep === "kpma" ? "bg-white text-purple-700 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              3. Simulasi Publikasi KPMA
            </button>
            <button
              onClick={() => setSimStep("export")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                simStep === "export" ? "bg-white text-teal-700 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              4. Simulasi Cetak Excel F4
            </button>
          </div>

          {/* Simulator Display Canvas */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 md:p-8 shadow-sm space-y-6">
            {simStep === "gkm" && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded">BM-1</span>
                    <h4 className="font-bold text-gray-800 text-sm">Simulasi Butir: Penerapan Budaya Mutu SPMI</h4>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${simIsLocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {simIsLocked ? "🔒 Status: Terkunci (Pakta Integritas)" : "🔓 Status: Terbuka (Dapat Diedit)"}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">1. Pilihan Skor / Kondisi Mutu:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["A", "B", "C"].map((opt) => (
                      <button
                        key={opt}
                        disabled={simIsLocked}
                        onClick={() => setSimAnswer(opt)}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                          simAnswer === opt
                            ? "bg-blue-600 text-white border-blue-600 shadow"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 disabled:opacity-50"
                        }`}
                      >
                        Opsi Skor {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">2. Berkas Bukti Terunggah (Google Drive):</label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <span>📄</span>
                      <span>Total {simFilesCount} dokumen bukti telah tersimpan di Google Drive</span>
                    </div>
                    <button
                      disabled={simIsLocked}
                      onClick={() => setSimFilesCount(prev => prev + 1)}
                      className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      + Tambah Bukti Simulasi
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-gray-100">
                  <button
                    onClick={() => setSimIsLocked(!simIsLocked)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      simIsLocked ? "bg-amber-600 text-white" : "bg-rose-600 text-white"
                    }`}
                  >
                    {simIsLocked ? "Buka Kembali Kunci (Simulasi Reopen)" : "🔒 Kunci & Sahkan Pakta Integritas"}
                  </button>
                  <span className="text-[11px] text-gray-400">
                    {simIsLocked ? "Form tidak dapat diedit lagi oleh GKM" : "Form masih dapat diubah oleh GKM"}
                  </span>
                </div>
              </div>
            )}

            {simStep === "gpm" && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded">AUDIT</span>
                    <h4 className="font-bold text-gray-800 text-sm">Simulasi Verifikasi Dokumen oleh Auditor GPM</h4>
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">Prodi: Teknik Informatika</span>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-900 font-bold">Dokumen Bukti BM-1-1A-01.pdf</span>
                    <a href="#simulator" onClick={(e) => { e.preventDefault(); alert("Simulasi membuka Google Drive"); }} className="text-blue-600 hover:underline font-bold">
                      Buka Google Drive ↗
                    </a>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                    <label className="text-xs font-bold text-gray-700">Kesesuaian Bukti Menurut Auditor:</label>
                    <div className="flex gap-2">
                      {["Sesuai", "Kurang", "Tidak Sesuai"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setSimAuditorStatus(st)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                            simAuditorStatus === st
                              ? st === "Sesuai"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : st === "Kurang"
                                ? "bg-amber-600 text-white border-amber-600"
                                : "bg-rose-600 text-white border-rose-600"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Catatan / Rekomendasi Auditor Fakultas:</label>
                  <textarea
                    rows={3}
                    defaultValue="Bukti SK penjaminan mutu sudah valid, namun laporan pelaksanaan monev semester genap belum dilampirkan."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:bg-white outline-none"
                  />
                </div>
              </div>
            )}

            {simStep === "kpma" && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-black rounded">KPMA</span>
                    <h4 className="font-bold text-gray-800 text-sm">Simulasi Analisis & Publikasi Massal per Fakultas</h4>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${simPublishStatus === "Terbit" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                    Status: {simPublishStatus === "Terbit" ? "Terbit (Resmi Terlihat Prodi)" : "Draft Internal KPMA"}
                  </span>
                </div>

                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2 text-xs">
                  <p className="font-bold text-purple-900">Catatan Analisis KPMA:</p>
                  <p className="text-purple-800">
                    Prodi telah memiliki instrumen pengukuran mutu yang memadai. Tindak lanjut: Dorong implementasi siklus pengendalian (C) pada siklus semester berikutnya.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <h5 className="text-xs font-bold text-gray-800">📢 Publikasi Massal per Fakultas</h5>
                    <p className="text-[11px] text-gray-500">Terbitkan seluruh draft analisis prodi dalam 1 klik.</p>
                  </div>
                  <button
                    onClick={() => setSimPublishStatus(prev => (prev === "Draft" ? "Terbit" : "Draft"))}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    {simPublishStatus === "Draft" ? "Terbitkan Seluruh Draft" : "Tarik Kembali ke Draft"}
                  </button>
                </div>
              </div>
            )}

            {simStep === "export" && (
              <div className="space-y-5 max-w-2xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-black rounded">EXCEL</span>
                    <h4 className="font-bold text-gray-800 text-sm">Simulasi Format Ekspor Excel F4 Landscape</h4>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
                    Ukuran: Folio / F4 (Landscape)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <span>📄 Sheet 1:</span>
                      <span>Dokumen Terunggah</span>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      Berisi seluruh berkas bukti terunggah lengkap dengan kolom kode butir, teks pertanyaan, prodi, dan hyperlink aktif ke Google Drive.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <span>📋 Sheet 2:</span>
                      <span>Belum Ada Dokumen</span>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      Checklist butir instrumen yang belum memiliki berkas bukti untuk memandu auditor dan Kaprodi menyelesaikan kelengkapan mutu.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1">
                  <p className="font-bold text-gray-800">Fitur Cetak Siap Pakai:</p>
                  <p>• Margin dan ukuran telah diset otomatis ke kertas F4 (paper size 14).</p>
                  <p>• Skala otomatis <em>Fit all columns on one page</em> (bebas kolom terpotong).</p>
                  <p>• Pengulangan baris header tabel otomatis pada setiap halaman cetak berikutnya.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. KONTEN TAB: FAQ & TROUBLESHOOTING */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>❓</span> Pertanyaan yang Sering Diajukan (FAQ) & Solusi Kendala
            </h3>
            <p className="text-xs md:text-sm text-gray-600 max-w-3xl">
              Temukan jawaban cepat atas berbagai pertanyaan seputar hak akses, penguncian formulir,
              penyimpanan Google Drive, dan format laporan mutu.
            </p>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-400 space-y-2">
                <span className="text-4xl">🔍</span>
                <p className="text-sm">Tidak ditemukan topik FAQ yang cocok dengan kata kunci "{searchQuery}".</p>
                <button onClick={() => setSearchQuery("")} className="text-xs text-institusi font-bold underline">
                  Tampilkan semua FAQ
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-institusi bg-blue-50 px-2 py-0.5 rounded mr-2">
                            {faq.category}
                          </span>
                          <span className="font-bold text-xs md:text-sm text-gray-900">{faq.q}</span>
                        </div>
                      </div>
                      <span className="text-gray-400 font-bold text-base transition-transform duration-200">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 8. FOOTER BANNER: BUTUH BANTUAN TEKNIS? */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-700">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-base md:text-lg font-bold">Masih Menemukan Kendala atau Membutuhkan Bantuan?</h4>
          <p className="text-xs md:text-sm text-slate-300">
            Tim Kantor Penjaminan Mutu Akademik (KPMA) Universitas Ibn Khaldun Bogor siap mendampingi proses MONEV prodi Anda.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-xs font-bold transition-all shadow"
          >
            ← Kembali ke Dashboard
          </Link>
          <Link
            href="/monev"
            className="px-4 py-2.5 bg-institusi hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            Mulai Pengisian MONEV →
          </Link>
        </div>
      </div>
    </div>
  );
}
