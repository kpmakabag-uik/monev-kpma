"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

interface EvidenceItem {
  id: string;
  prodiId: string;
  prodiName: string;
  jenjang: string;
  facultyName: string;
  instrumentId: string;
  questionId: string;
  questionNo?: string;
  questionText?: string | null;
  evaluasiDiri?: string | null;
  tahunAkademik: string;
  semester: string;
  url: string;
  fileName: string;
}

interface InstrumentSummary {
  id: string;
  name: string;
  jenjang: string;
  subQuestionCount: number;
  evidenceCount: number;
  category: string;
}

interface CategorySummary {
  category: string;
  totalEvidence: number;
  instrumentCount: number;
  instruments: Array<{
    id: string;
    name: string;
    jenjang: string;
    subQuestionCount: number;
    evidenceCount: number;
  }>;
}

interface EvidenceRepositoryProps {
  prodis: any[];
  cycles: any[];
  faculties: any[];
  activeCycle?: any;
  userRole: string;
  userProdiId?: string | null;
  userFacultyId?: string | null;
}

// Skema warna aksen untuk kategori IAPS 5.1
const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; border: string; badge: string; icon: string }
> = {
  "BUDAYA MUTU": {
    bg: "bg-blue-50/70 hover:bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    icon: "🏛️",
  },
  "RELEVANSI PENDIDIKAN": {
    bg: "bg-emerald-50/70 hover:bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "🎓",
  },
  "AKUNTABILITAS": {
    bg: "bg-indigo-50/70 hover:bg-indigo-50",
    text: "text-indigo-900",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    icon: "⚖️",
  },
  "DIFERENSIASI MISI": {
    bg: "bg-amber-50/70 hover:bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: "🎯",
  },
  "RELEVANSI PENELITIAN": {
    bg: "bg-purple-50/70 hover:bg-purple-50",
    text: "text-purple-900",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    icon: "🔬",
  },
  "SARANA PRASARANA": {
    bg: "bg-cyan-50/70 hover:bg-cyan-50",
    text: "text-cyan-900",
    border: "border-cyan-200",
    badge: "bg-cyan-100 text-cyan-700",
    icon: "🏢",
  },
  "RELEVANSI PKM": {
    bg: "bg-rose-50/70 hover:bg-rose-50",
    text: "text-rose-900",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    icon: "🤝",
  },
  "TINDAK LANJUT": {
    bg: "bg-teal-50/70 hover:bg-teal-50",
    text: "text-teal-900",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    icon: "📈",
  },
};

function getCategoryStyle(categoryName: string) {
  const norm = categoryName.trim().toUpperCase();
  for (const key of Object.keys(CATEGORY_STYLES)) {
    if (norm.includes(key)) return CATEGORY_STYLES[key];
  }
  return {
    bg: "bg-gray-50/70 hover:bg-gray-50",
    text: "text-gray-900",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-700",
    icon: "📁",
  };
}

export default function EvidenceRepository({
  prodis,
  cycles,
  faculties,
  activeCycle,
  userRole,
  userProdiId,
  userFacultyId,
}: EvidenceRepositoryProps) {
  // Mode Tampilan: Dashboard & Rekap Kategori vs Pencarian Lengkap
  const [activeTab, setActiveTab] = useState<"dashboard" | "search">("dashboard");

  // Filter Global
  const [cycleFilter, setCycleFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [prodiFilter, setProdiFilter] = useState(
    userRole === "GKM" && userProdiId ? userProdiId : "all"
  );

  // State untuk Tab Dashboard & Rekap
  const [statsLoading, setStatsLoading] = useState(true);
  const [categoriesStats, setCategoriesStats] = useState<CategorySummary[]>([]);
  const [overallTotal, setOverallTotal] = useState(0);

  // Deteksi objek Prodi yang sedang dipilih di filter atas
  const selectedProdiObj = useMemo(() => {
    if (prodiFilter && prodiFilter !== "all") {
      return prodis.find((p) => p.id === prodiFilter) || null;
    }
    return null;
  }, [prodiFilter, prodis]);

  // Filter lokal tabel instrumen di Dashboard
  const [instrumentSearch, setInstrumentSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedJenjang, setSelectedJenjang] = useState<string>(
    userRole === "GKM" && userProdiId
      ? prodis.find((p) => p.id === userProdiId)?.jenjang || "all"
      : "all"
  );

  // Otomatis sinkronisasi filter jenjang jika program studi di filter atas berubah
  useEffect(() => {
    if (selectedProdiObj?.jenjang) {
      setSelectedJenjang(selectedProdiObj.jenjang);
    } else {
      setSelectedJenjang("all");
    }
  }, [selectedProdiObj]);

  // State untuk Modal Rekapan Dokumen
  const [modalTarget, setModalTarget] = useState<{
    type: "instrument" | "category";
    id: string;
    name: string;
    category?: string;
    subCount?: number;
  } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDocs, setModalDocs] = useState<EvidenceItem[]>([]);
  const [modalSearch, setModalSearch] = useState("");

  // State untuk Tab Pencarian Dokumen
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [searchLoading, setSearchLoading] = useState(true);
  const [searchItems, setSearchItems] = useState<EvidenceItem[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(0);

  // State untuk Export Excel
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async (options?: { instrumentId?: string; category?: string; q?: string }) => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (cycleFilter !== "all") params.set("cycle", cycleFilter);
      if (prodiFilter !== "all") params.set("prodiId", prodiFilter);
      if (facultyFilter !== "all") params.set("facultyId", facultyFilter);

      // Prioritas kata kunci pencarian
      const queryToExport =
        options?.q !== undefined ? options.q : activeTab === "search" ? q : debouncedQ;
      if (queryToExport && queryToExport.trim()) params.set("q", queryToExport.trim());

      if (options?.instrumentId) {
        params.set("instrumentId", options.instrumentId);
      }
      if (options?.category) {
        params.set("category", options.category);
      } else if (activeTab === "dashboard" && selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }

      const url = `/api/evidence/export?${params.toString()}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Export error:", err);
      alert("Gagal mengekspor data ke Excel");
    } finally {
      setTimeout(() => setExporting(false), 1200);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  // 1. Fetch Statistik Dashboard (Jumlah Dokumen per Kategori & Instrumen)
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cycleFilter !== "all") params.set("cycle", cycleFilter);
      if (prodiFilter !== "all") params.set("prodiId", prodiFilter);
      if (facultyFilter !== "all") params.set("facultyId", facultyFilter);

      const res = await fetch(`/api/evidence/stats?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCategoriesStats(data.categories || []);
        setOverallTotal(data.totalEvidence || 0);
      } else {
        setCategoriesStats([]);
        setOverallTotal(0);
      }
    } catch (err) {
      console.error("Fetch evidence stats error:", err);
      setCategoriesStats([]);
    } finally {
      setStatsLoading(false);
    }
  }, [cycleFilter, prodiFilter, facultyFilter]);

  // 2. Fetch Data Tab Pencarian Dokumen
  const fetchSearchData = useCallback(async () => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQ) params.set("q", debouncedQ);
      if (cycleFilter !== "all") params.set("cycle", cycleFilter);
      if (prodiFilter !== "all") params.set("prodiId", prodiFilter);
      if (facultyFilter !== "all") params.set("facultyId", facultyFilter);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/evidence?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSearchItems(data.items || []);
        setSearchTotal(data.total || 0);
        setSearchTotalPages(data.totalPages || 0);
      } else {
        setSearchItems([]);
        setSearchTotal(0);
        setSearchTotalPages(0);
      }
    } catch (err) {
      console.error("Fetch evidence search error:", err);
      setSearchItems([]);
    } finally {
      setSearchLoading(false);
    }
  }, [debouncedQ, cycleFilter, prodiFilter, facultyFilter, page, limit]);

  // Effect fetch stats
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Effect fetch search
  useEffect(() => {
    if (activeTab === "search") {
      fetchSearchData();
    }
  }, [activeTab, fetchSearchData]);

  // 3. Fetch Data Dokumen untuk Modal Rekap Detail
  const openRecapModal = async (target: {
    type: "instrument" | "category";
    id: string;
    name: string;
    category?: string;
    subCount?: number;
  }) => {
    setModalTarget(target);
    setModalSearch("");
    setModalLoading(true);
    setModalDocs([]);

    try {
      const params = new URLSearchParams();
      if (target.type === "instrument") {
        params.set("instrumentId", target.id);
      } else {
        params.set("category", target.id);
      }
      if (cycleFilter !== "all") params.set("cycle", cycleFilter);
      if (prodiFilter !== "all") params.set("prodiId", prodiFilter);
      if (facultyFilter !== "all") params.set("facultyId", facultyFilter);
      params.set("limit", "500");

      const res = await fetch(`/api/evidence?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setModalDocs(data.items || []);
      }
    } catch (err) {
      console.error("Fetch modal docs error:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // Switch to search tab with specific filter
  const switchToSearchWithQuery = (keyword: string) => {
    setModalTarget(null);
    setQ(keyword);
    setActiveTab("search");
  };

  // Flatten instrumen untuk daftar tabel
  const allInstruments: InstrumentSummary[] = useMemo(() => {
    const list: InstrumentSummary[] = [];
    categoriesStats.forEach((cat) => {
      cat.instruments.forEach((inst) => {
        list.push({
          id: inst.id,
          name: inst.name,
          jenjang: inst.jenjang,
          subQuestionCount: inst.subQuestionCount,
          evidenceCount: inst.evidenceCount,
          category: cat.category,
        });
      });
    });
    return list;
  }, [categoriesStats]);

  // Filter daftar tabel instrumen
  const filteredInstruments = useMemo(() => {
    return allInstruments.filter((inst) => {
      // 1. Jika ada prodi spesifik yang difilter, hanya tampilkan instrumen untuk jenjang prodi tersebut atau jenjang SEMUA
      if (selectedProdiObj?.jenjang) {
        const pJen = selectedProdiObj.jenjang.toLowerCase();
        const instJen = (inst.jenjang || "").toLowerCase();
        if (instJen !== "semua" && instJen !== pJen) {
          return false;
        }
      } else {
        // 2. Jika tidak ada prodi spesifik, gunakan filter tombol jenjang manual
        if (
          selectedJenjang !== "all" &&
          inst.jenjang.toUpperCase() !== selectedJenjang.toUpperCase() &&
          inst.jenjang.toUpperCase() !== "SEMUA"
        ) {
          return false;
        }
      }

      // 3. Filter Kategori
      if (selectedCategory !== "all" && inst.category !== selectedCategory) {
        return false;
      }

      // 4. Filter Pencarian Teks
      if (instrumentSearch.trim()) {
        const term = instrumentSearch.toLowerCase();
        const matchId = inst.id.toLowerCase().includes(term);
        const matchName = inst.name.toLowerCase().includes(term);
        const matchCat = inst.category.toLowerCase().includes(term);
        const matchJen = inst.jenjang.toLowerCase().includes(term);
        if (!matchId && !matchName && !matchCat && !matchJen) return false;
      }
      return true;
    });
  }, [allInstruments, selectedProdiObj, selectedCategory, selectedJenjang, instrumentSearch]);

  // Filter dokumen dalam modal rekap
  const filteredModalDocs = useMemo(() => {
    if (!modalSearch.trim()) return modalDocs;
    const term = modalSearch.toLowerCase();
    return modalDocs.filter(
      (d) =>
        d.fileName.toLowerCase().includes(term) ||
        (d.questionText && d.questionText.toLowerCase().includes(term)) ||
        (d.evaluasiDiri && d.evaluasiDiri.toLowerCase().includes(term)) ||
        (d.questionNo && d.questionNo.toLowerCase().includes(term)) ||
        d.prodiName.toLowerCase().includes(term)
    );
  }, [modalDocs, modalSearch]);

  // Filter list prodi berdasarkan fakultas yang dipilih
  const filteredProdis = prodis.filter((p) => {
    if (facultyFilter === "all") return true;
    return p.facultyId === facultyFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Navigasi Tab */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-blue-600 text-white rounded-xl shadow-xs font-bold text-xl">
              📂
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">
                  Repositori Dokumen Bukti MONEV
                </h1>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  IAPS 5.1
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dashboard rekapitulasi jumlah dokumen per kategori & tabel instrumen serta fasilitas penelusuran dokumen bukti.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 px-4 py-2.5 rounded-xl text-center shadow-2xs">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                Total Dokumen Terindeks
              </p>
              <p className="text-xl font-black text-blue-900">
                {overallTotal.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal text-blue-700">berkas</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="mt-6 flex items-center gap-2 border-b border-gray-100 pb-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "dashboard"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <span>📊 Dashboard & Rekap Kategori</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded-full font-black">
              {categoriesStats.length} Kategori
            </span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "search"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <span>🔍 Penelusuran Dokumen Bukti</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-700 rounded-full font-bold">
              Pencarian Cepat
            </span>
          </button>
        </div>
      </div>

      {/* 2. Global Filters Bar (Sebaris dengan Tombol Export Excel) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {/* Filter Siklus Akademik */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Siklus Akademik
            </label>
            <select
              value={cycleFilter}
              onChange={(e) => {
                setCycleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none text-gray-700 font-medium"
            >
              <option value="all">Semua Siklus</option>
              {cycles.map((c) => (
                <option key={c.id} value={`${c.tahun_akademik}:${c.semester}`}>
                  {c.tahun_akademik} - {c.semester} {c.isActive ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Fakultas */}
          {(userRole === "KPMA" || userRole === "PIMPINAN_UNIVERSITAS") && (
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Fakultas
              </label>
              <select
                value={facultyFilter}
                onChange={(e) => {
                  setFacultyFilter(e.target.value);
                  setProdiFilter("all");
                  setSelectedJenjang("all");
                  setPage(1);
                }}
                className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none text-gray-700 font-medium"
              >
                <option value="all">Semua Fakultas</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Program Studi */}
          {userRole !== "GKM" && (
            <div className={userRole !== "KPMA" && userRole !== "PIMPINAN_UNIVERSITAS" ? "sm:col-span-2" : ""}>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Program Studi
              </label>
              <select
                value={prodiFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setProdiFilter(val);
                  setPage(1);
                  if (val !== "all") {
                    const p = prodis.find((item) => item.id === val);
                    if (p?.jenjang) {
                      setSelectedJenjang(p.jenjang);
                    }
                  } else {
                    setSelectedJenjang("all");
                  }
                }}
                className="w-full py-2 px-3 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none text-gray-700 font-medium"
              >
                <option value="all">Semua Program Studi</option>
                {filteredProdis.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.jenjang}] {p.name} ({p.faculty?.name || ""})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tombol Export Excel Sebaris dengan Filter */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={() => handleExportExcel()}
            disabled={exporting || (activeTab === "search" ? searchTotal === 0 : overallTotal === 0)}
            className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs inline-flex items-center justify-center gap-2 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Unduh seluruh rekapitulasi dokumen bukti beserta tautan Google Drive ke Excel"
          >
            <span className="text-base">📥</span>
            <div className="text-left">
              <p className="leading-tight">{exporting ? "Menyiapkan..." : "Export Excel"}</p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAMPILAN 1: DASHBOARD & REKAP DOKUMEN PER KATEGORI                      */}
      {/* ========================================================================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* A. Ringkasan Kartu Kategori (Category Grid Cards) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Rekapitulasi Dokumen per Kategori Instrumen
                  </h2>
                  {selectedProdiObj && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Prodi: {selectedProdiObj.name} ({selectedProdiObj.jenjang})
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedProdiObj
                    ? `Menampilkan jumlah dokumen bukti yang diunggah khusus oleh ${selectedProdiObj.name}.`
                    : `Klik kartu kategori untuk memfilter tabel atau klik tombol "Lihat Berkas" untuk melihat seluruh berkasnya.`}
                </p>
              </div>

              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Reset Filter Kategori</span>
                  <span>✕</span>
                </button>
              )}
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : categoriesStats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoriesStats.map((cat) => {
                  const style = getCategoryStyle(cat.category);
                  const isSelected = selectedCategory === cat.category;

                  return (
                    <div
                      key={cat.category}
                      onClick={() =>
                        setSelectedCategory(isSelected ? "all" : cat.category)
                      }
                      className={`cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                        isSelected
                          ? "ring-2 ring-blue-600 border-blue-400 bg-blue-50/40 shadow-sm"
                          : `${style.bg} ${style.border} hover:shadow-xs hover:-translate-y-0.5`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{style.icon}</span>
                          <div>
                            <h3 className="font-extrabold text-xs text-gray-900 tracking-tight leading-snug line-clamp-1">
                              {cat.category}
                            </h3>
                            <p className="text-[11px] text-gray-500">
                              {cat.instrumentCount} Tabel Instrumen
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-xl font-black text-gray-900 leading-none">
                            {cat.totalEvidence.toLocaleString("id-ID")}
                          </p>
                          <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">
                            Dokumen Bukti
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRecapModal({
                              type: "category",
                              id: cat.category,
                              name: `Kategori ${cat.category}`,
                            });
                          }}
                          className="px-2.5 py-1 bg-white/90 hover:bg-white text-gray-700 text-[10px] font-bold rounded-lg border border-gray-200/80 shadow-2xs hover:text-blue-600 transition-colors"
                          title="Buka daftar seluruh berkas kategori ini"
                        >
                          Lihat Berkas ↗
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-400 text-xs">
                Belum ada data dokumen bukti yang tersinkronisasi.
              </div>
            )}
          </div>

          {/* B. Daftar Tabel Instrumen & Rekap Dokumen (Sesuai Tampilan screenshot user!) */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            {/* Table Header & Search Filter */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-800 tracking-tight text-sm flex items-center gap-2 flex-wrap">
                  <span>Daftar Tabel Instrumen</span>
                  <span className="text-xs font-normal text-gray-500">
                    ({filteredInstruments.length} tabel ditemukan)
                  </span>
                  {selectedProdiObj && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      Khusus {selectedProdiObj.name} ({selectedProdiObj.jenjang})
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {selectedProdiObj
                    ? `Menampilkan instrumen yang berlaku dan jumlah dokumen bukti yang diunggah khusus oleh ${selectedProdiObj.name}.`
                    : "Klik jumlah dokumen atau tombol rekapan untuk membuka dan mengakses berkas secara langsung."}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Cari Kode, Jenjang, atau Kategori..."
                  value={instrumentSearch}
                  onChange={(e) => setInstrumentSearch(e.target.value)}
                  className="block w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
                {instrumentSearch && (
                  <button
                    onClick={() => setInstrumentSearch("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Sub Filter: Jenjang Pill Switcher */}
            <div className="px-4 py-2.5 bg-gray-50/30 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              {selectedProdiObj ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-600 font-bold uppercase text-[10px]">
                    Filter Jenjang (Otomatis Sesuai Prodi):
                  </span>
                  <span className="px-3 py-0.5 rounded-full font-black bg-blue-600 text-white text-[11px] shadow-2xs">
                    {selectedProdiObj.jenjang} & SEMUA
                  </span>
                  <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    📍 {selectedProdiObj.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-gray-400 font-bold uppercase text-[10px] mr-1">
                    Filter Jenjang:
                  </span>
                  {["all", "SEMUA", "S1", "S2", "S3"].map((jen) => (
                    <button
                      key={jen}
                      onClick={() => setSelectedJenjang(jen)}
                      className={`px-2.5 py-0.5 rounded-full font-bold transition-colors ${
                        selectedJenjang === jen
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {jen === "all" ? "Semua Jenjang" : jen}
                    </button>
                  ))}
                </div>
              )}

              {selectedProdiObj && userRole !== "GKM" && (
                <button
                  onClick={() => {
                    setProdiFilter("all");
                    setSelectedJenjang("all");
                  }}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Tampilkan Semua Program Studi ✕
                </button>
              )}
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/50 text-xs text-gray-900 border-b border-gray-200">
                    <th className="p-4 font-bold w-28">Kode</th>
                    <th className="p-4 font-bold w-24">Jenjang</th>
                    <th className="p-4 font-bold w-48">Kategori</th>
                    <th className="p-4 font-bold min-w-[220px]">Nama Tabel</th>
                    <th className="p-4 font-bold w-24 text-center">Jml Sub</th>
                    <th className="p-4 font-bold w-36 text-center">Jml Dokumen</th>
                    <th className="p-4 font-bold w-36 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {statsLoading ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-500">
                        <div className="inline-flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Menghitung rekapitulasi dokumen bukti...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredInstruments.length > 0 ? (
                    filteredInstruments.map((inst) => {
                      const hasDocs = inst.evidenceCount > 0;
                      return (
                        <tr key={inst.id} className="hover:bg-blue-50/20 transition-colors">
                          {/* Kode */}
                          <td className="p-4 text-sm font-mono font-black text-gray-900">
                            {inst.id}
                          </td>

                          {/* Jenjang */}
                          <td className="p-4 text-xs font-bold text-blue-600 uppercase">
                            <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded">
                              {inst.jenjang}
                            </span>
                          </td>

                          {/* Kategori */}
                          <td className="p-4 text-xs font-bold text-gray-600 uppercase tracking-tighter">
                            {inst.category}
                          </td>

                          {/* Nama Tabel */}
                          <td className="p-4 text-xs font-bold text-gray-900 leading-snug">
                            {inst.name}
                          </td>

                          {/* Jml Sub */}
                          <td className="p-4 text-xs text-gray-600 text-center font-semibold">
                            {inst.subQuestionCount} Sub
                          </td>

                          {/* Jml Dokumen (CLICKABLE BADGE) */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() =>
                                openRecapModal({
                                  type: "instrument",
                                  id: inst.id,
                                  name: inst.name,
                                  category: inst.category,
                                  subCount: inst.subQuestionCount,
                                })
                              }
                              className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 transition-all ${
                                hasDocs
                                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-2xs cursor-pointer hover:scale-105"
                                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer"
                              }`}
                              title={hasDocs ? "Klik untuk melihat seluruh dokumen bukti" : "Belum ada dokumen bukti"}
                            >
                              <span>📄</span>
                              <span>{inst.evidenceCount} Dokumen</span>
                            </button>
                          </td>

                          {/* Aksi */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() =>
                                  openRecapModal({
                                    type: "instrument",
                                    id: inst.id,
                                    name: inst.name,
                                    category: inst.category,
                                    subCount: inst.subQuestionCount,
                                  })
                                }
                                className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-[10px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                                title="Buka Detail Rekap Dokumen"
                              >
                                <span>📂 Rekap</span>
                              </button>

                              <button
                                onClick={() => switchToSearchWithQuery(inst.id)}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                                title="Telusuri di Tab Pencarian Lengkap"
                              >
                                <span>🔍</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-500">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="font-semibold text-gray-700">
                          Tidak ada instrumen yang cocok dengan &quot;{instrumentSearch}&quot;
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAMPILAN 2: TAB PENELUSURAN LENGKAP                                     */}
      {/* ========================================================================= */}
      {activeTab === "search" && (
        <div className="space-y-4">
          {/* Search Box & Export Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama file, butir (misal BM-1), teks pertanyaan, temuan evaluasi diri, atau nama prodi..."
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => handleExportExcel()}
              disabled={exporting || searchTotal === 0}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs inline-flex items-center justify-center gap-2 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              title="Export hasil pencarian dokumen ini ke Excel"
            >
              <span>📥 Export Excel</span>
            </button>
          </div>

          {/* Table Pencarian Dokumen Bukti */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4 min-w-[240px]">Dokumen Bukti</th>
                    <th className="p-4 min-w-[340px]">Pertanyaan Monitoring & Evaluasi Diri</th>
                    <th className="p-4 min-w-[200px]">Program Studi</th>
                    <th className="p-4 w-28">Siklus</th>
                    <th className="p-4 w-36 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {searchLoading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-500">
                        <div className="inline-flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Memuat dokumen bukti...</span>
                        </div>
                      </td>
                    </tr>
                  ) : searchItems.length > 0 ? (
                    searchItems.map((item, idx) => {
                      const rowNumber = (page - 1) * limit + idx + 1;
                      return (
                        <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="p-4 text-center font-semibold text-gray-400">
                            {rowNumber}
                          </td>

                          {/* Nama Dokumen */}
                          <td className="p-4 align-top">
                            <div className="flex items-start gap-2">
                              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md shrink-0 mt-0.5">
                                📄
                              </span>
                              <div>
                                <p className="font-bold text-gray-900 leading-snug">
                                  {item.fileName}
                                </p>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold"
                                >
                                  <span>Buka Google Drive</span>
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Pertanyaan & Evaluasi Diri */}
                          <td className="p-4 align-top max-w-md">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[11px]">
                                {item.instrumentId}
                              </span>
                              {item.questionNo && (
                                <span className="text-gray-700 font-bold text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">
                                  Poin {item.questionNo}
                                </span>
                              )}
                            </div>

                            {item.questionText && (
                              <p className="text-[11px] text-gray-700 leading-relaxed font-medium" title={item.questionText}>
                                {item.questionText}
                              </p>
                            )}

                            {item.evaluasiDiri ? (
                              <div className="mt-2 p-2 bg-amber-50/90 border border-amber-200/80 rounded-lg text-[10px] text-amber-950 leading-normal">
                                <span className="font-bold text-amber-800 uppercase tracking-tight block mb-0.5">
                                  Keterangan / Temuan:
                                </span>
                                <span className="line-clamp-3" title={item.evaluasiDiri}>
                                  {item.evaluasiDiri}
                                </span>
                              </div>
                            ) : (
                              <div className="mt-1 text-[10px] text-gray-400 italic">
                                (Belum ada catatan temuan evaluasi diri)
                              </div>
                            )}
                          </td>

                          {/* Program Studi */}
                          <td className="p-4 align-top">
                            <p className="font-bold text-gray-900">{item.prodiName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500">
                              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">
                                {item.jenjang}
                              </span>
                              <span>{item.facultyName}</span>
                            </div>
                          </td>

                          {/* Siklus */}
                          <td className="p-4 align-top">
                            <span className="text-gray-700 font-medium text-[11px]">
                              {item.tahunAkademik}
                            </span>
                            <p className="text-[10px] text-gray-400">{item.semester}</p>
                          </td>

                          {/* Aksi */}
                          <td className="p-4 text-center align-top">
                            <div className="flex items-center justify-center gap-1.5">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold transition-colors shadow-2xs"
                                title="Buka Dokumen di Google Drive"
                              >
                                <span>Drive ↗</span>
                              </a>

                              <Link
                                href={`/monev/${item.prodiId}/${item.instrumentId}#question-${item.questionId}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-semibold transition-colors"
                                title="Buka di Formulir Pengisian MONEV"
                              >
                                <span>Form ↗</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-400">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="font-semibold text-gray-700">
                          Tidak ada dokumen bukti yang cocok
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Search */}
            {searchTotalPages > 1 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                <div>
                  Menampilkan {Math.min((page - 1) * limit + 1, searchTotal)} -{" "}
                  {Math.min(page * limit, searchTotal)} dari {searchTotal.toLocaleString("id-ID")} dokumen
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Sebelumnya
                  </button>

                  <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold">
                    {page} / {searchTotalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(searchTotalPages, p + 1))}
                    disabled={page >= searchTotalPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL REKAPAN DOKUMEN BUKTI INTERAKTIF (CLICKABLE RECAP)               */}
      {/* ========================================================================= */}
      {modalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-blue-600 text-white rounded-xl font-black text-lg">
                  📑
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {modalTarget.id}
                    </span>
                    <h3 className="text-base font-black text-gray-900 leading-snug">
                      {modalTarget.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                    {modalTarget.category && (
                      <span className="font-semibold text-gray-700">
                        {modalTarget.category}
                      </span>
                    )}
                    <span>•</span>
                    <span className="font-bold text-blue-700">
                      {modalDocs.length} Dokumen Bukti Terunggah
                    </span>
                    {selectedProdiObj && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Khusus {selectedProdiObj.name} ({selectedProdiObj.jenjang})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalTarget(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                title="Tutup (Esc)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Toolbar Filter */}
            <div className="p-4 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Saring nama dokumen, poin, atau pertanyaan..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={() => {
                    if (modalTarget.type === "instrument") {
                      handleExportExcel({ instrumentId: modalTarget.id });
                    } else {
                      handleExportExcel({ category: modalTarget.id });
                    }
                  }}
                  disabled={exporting || modalDocs.length === 0}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 border border-emerald-200 cursor-pointer disabled:opacity-50"
                  title="Export seluruh dokumen bukti pada daftar ini ke Excel"
                >
                  <span>📥 Export Excel</span>
                </button>

                <button
                  onClick={() => switchToSearchWithQuery(modalTarget.id)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 border border-blue-200"
                >
                  <span>Buka di Penelusuran Lengkap ↗</span>
                </button>
              </div>
            </div>

            {/* Modal Body / Table of Documents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {modalLoading ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memuat berkas rekapan dokumen...</span>
                  </div>
                </div>
              ) : filteredModalDocs.length > 0 ? (
                <div className="space-y-3">
                  {filteredModalDocs.map((doc, idx) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-gray-50/70 hover:bg-blue-50/30 border border-gray-200/80 rounded-xl transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      {/* Left: Info Dokumen & Pertanyaan */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-start gap-2.5">
                          <span className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg shrink-0 mt-0.5 text-base">
                            📄
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400">
                                #{idx + 1}
                              </span>
                              <h4 className="text-xs font-bold text-gray-900 leading-snug">
                                {doc.fileName}
                              </h4>
                            </div>

                            {/* Poin & Teks Pertanyaan */}
                            <div className="mt-1 flex items-start gap-1.5 text-[11px] text-gray-600">
                              {doc.questionNo && (
                                <span className="font-extrabold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded shrink-0">
                                  Poin {doc.questionNo}
                                </span>
                              )}
                              {doc.questionText && (
                                <span className="line-clamp-2 text-gray-700">
                                  {doc.questionText}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Evaluasi Diri / Temuan */}
                        {doc.evaluasiDiri && (
                          <div className="ml-9 p-2 bg-amber-50/90 border border-amber-200/80 rounded-lg text-[10px] text-amber-950">
                            <span className="font-bold text-amber-800 uppercase block mb-0.5">
                              Temuan Evaluasi Diri:
                            </span>
                            <span className="line-clamp-3">{doc.evaluasiDiri}</span>
                          </div>
                        )}

                        {/* Prodi & Siklus */}
                        <div className="ml-9 flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                          <span className="font-bold text-gray-700">
                            {doc.prodiName} ({doc.jenjang})
                          </span>
                          <span>•</span>
                          <span>{doc.facultyName}</span>
                          <span>•</span>
                          <span className="text-gray-600 font-semibold">
                            {doc.tahunAkademik} {doc.semester}
                          </span>
                        </div>
                      </div>

                      {/* Right: Tombol Akses Langsung */}
                      <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 self-end md:self-center">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                          title="Buka Langsung di Google Drive"
                        >
                          <span>Buka Drive</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        <Link
                          href={`/monev/${doc.prodiId}/${doc.instrumentId}#question-${doc.questionId}`}
                          className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                          title="Buka pada Formulir MONEV"
                        >
                          <span>Form MONEV ↗</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="font-semibold text-gray-700">
                    Belum ada dokumen bukti yang terunggah
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Program studi belum mengunggah berkas untuk instrumen ini pada filter yang dipilih.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
              <span>
                Menampilkan {filteredModalDocs.length} dari {modalDocs.length} berkas
              </span>
              <button
                onClick={() => setModalTarget(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
