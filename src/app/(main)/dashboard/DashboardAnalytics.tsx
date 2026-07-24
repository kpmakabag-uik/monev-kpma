"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Props {
  faculties: any[];
  instruments: any[];
  records: any[];
}

const COLORS = ["#10b981", "#ef4444"]; // Emerald-500, Red-500

export default function DashboardAnalytics({ faculties, instruments, records }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const analyticsData = useMemo(() => {
    let totalMemenuhi = 0;
    let totalBelumMemenuhi = 0;
    
    const facultyScores: any[] = [];
    const prodiScores: any[] = [];
    const instrumentFails: Record<string, number> = {};

    faculties.forEach((faculty) => {
      let facMemenuhi = 0;
      let facBelum = 0;

      faculty.prodis.forEach((prodi: any) => {
        let prodiMemenuhi = 0;
        let prodiBelum = 0;

        const applicableInsts = instruments.filter(
          (i) => i.jenjang_peruntukan === "Semua" || i.jenjang_peruntukan === prodi.jenjang
        );

        applicableInsts.forEach((inst) => {
          const record = records.find((r) => r.prodiId === prodi.id && r.instrumentId === inst.id);
          const answers = record?.parsedAnswers || {};

          let qs = [];
          try {
            qs = JSON.parse(inst.questions || "[]");
          } catch {}

          qs.forEach((q: any) => {
            const ans = answers[q.id] || {};
            const isEvalDiriFilled = !!ans.evaluasiDiri && ans.evaluasiDiri.trim() !== "";
            const kesesuaianVal = ans.kesesuaianBukti && ans.kesesuaianBukti !== "-" ? ans.kesesuaianBukti : (ans.pilihan || "-");
            const hasBukti = Array.isArray(ans.buktiLinks) && ans.buktiLinks.length > 0;

            const isMemenuhi = isEvalDiriFilled && kesesuaianVal === "Ya" && hasBukti;

            if (isMemenuhi) {
              totalMemenuhi++;
              facMemenuhi++;
              prodiMemenuhi++;
            } else {
              totalBelumMemenuhi++;
              facBelum++;
              prodiBelum++;
              
              // Track failures by instrument category/name
              const instName = inst.category || inst.name;
              instrumentFails[instName] = (instrumentFails[instName] || 0) + 1;
            }
          });
        });

        const totalProdi = prodiMemenuhi + prodiBelum;
        if (totalProdi > 0) {
          prodiScores.push({
            id: prodi.id,
            name: prodi.name,
            jenjang: prodi.jenjang,
            facultyName: faculty.name,
            memenuhi: prodiMemenuhi,
            belumMemenuhi: prodiBelum,
            Memenuhi: prodiMemenuhi,
            "Belum Memenuhi": prodiBelum,
            score: Math.round((prodiMemenuhi / totalProdi) * 100),
          });
        }
      });

      const totalFac = facMemenuhi + facBelum;
      if (totalFac > 0) {
        facultyScores.push({
          name: faculty.name,
          Memenuhi: facMemenuhi,
          "Belum Memenuhi": facBelum,
          score: Math.round((facMemenuhi / totalFac) * 100),
        });
      }
    });

    // Sort prodi by score descending for leaderboard
    prodiScores.sort((a, b) => b.score - a.score || b.memenuhi - a.memenuhi);

    // Format instrument fails for chart
    const heatmapData = Object.entries(instrumentFails)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 worst instruments

    return {
      totalMemenuhi,
      totalBelumMemenuhi,
      total: totalMemenuhi + totalBelumMemenuhi,
      facultyScores,
      prodiScores,
      heatmapData,
    };
  }, [faculties, instruments, records]);

  if (!isOpen) {
    return (
      <div className="flex justify-center mt-8 mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-institusi text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2 hover:bg-blue-800 transition-all hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Lihat Analisis Mutu (Komprehensif)
        </button>
      </div>
    );
  }

  const { totalMemenuhi, totalBelumMemenuhi, total, facultyScores, prodiScores, heatmapData } = analyticsData;
  const globalScore = total > 0 ? Math.round((totalMemenuhi / total) * 100) : 0;

  const pieData = [
    { name: "Memenuhi", value: totalMemenuhi },
    { name: "Belum Memenuhi", value: totalBelumMemenuhi },
  ];

  const isSingleFaculty = faculties.length === 1;
  const chartData = isSingleFaculty ? prodiScores : facultyScores;
  const chartTitle = isSingleFaculty ? "Perbandingan Program Studi" : "Perbandingan Fakultas";

  return (
    <div className="mt-8 space-y-6 border-t border-gray-200 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analisis Mutu Pendidikan</h2>
          <p className="text-gray-500 text-sm">Ringkasan hasil evaluasi seluruh instrumen</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          Tutup Analisis
        </button>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl shadow-sm">
          <p className="text-emerald-800 text-sm font-semibold mb-1">Total Indikator Memenuhi</p>
          <p className="text-3xl font-bold text-emerald-600">{totalMemenuhi}</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-6 rounded-xl shadow-sm">
          <p className="text-red-800 text-sm font-semibold mb-1">Total Belum Memenuhi (Butuh Atensi)</p>
          <p className="text-3xl font-bold text-red-600">{totalBelumMemenuhi}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
          <p className="text-blue-800 text-sm font-semibold mb-1">Indeks Mutu Keseluruhan</p>
          <p className="text-3xl font-bold text-blue-600">{globalScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Comparison */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{chartTitle}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={90} />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="Memenuhi" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Belum Memenuhi" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Rasio Pemenuhan Mutu</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Topik Kelemahan (Heatmap alternative) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Topik Instrumen Paling Banyak Gagal</h3>
        <p className="text-sm text-gray-500 mb-4">Area evaluasi yang butuh peningkatan tahun depan</p>
        <div className="space-y-3">
          {heatmapData.map((item, idx) => (
            <div key={item.name} className="flex items-center">
              <span className="w-6 text-gray-400 font-bold">{idx + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate">{item.name}</span>
                  <span className="text-sm text-red-600 font-bold">{item.count} indikator gagal</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((item.count / heatmapData[0].count) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          {heatmapData.length === 0 && (
            <p className="text-sm text-gray-500 italic">Belum ada data kegagalan.</p>
          )}
        </div>
      </div>

      {/* Leaderboard Prodi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Papan Peringkat Program Studi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Peringkat</th>
                <th className="px-6 py-3">Program Studi</th>
                <th className="px-6 py-3 text-center">Skor Mutu</th>
                <th className="px-6 py-3 text-center">Memenuhi</th>
                <th className="px-6 py-3 text-center">Belum Memenuhi</th>
              </tr>
            </thead>
            <tbody>
              {prodiScores.map((prodi, idx) => (
                <tr key={prodi.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-500">#{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{prodi.name} ({prodi.jenjang})</div>
                    <div className="text-xs text-gray-500">{prodi.facultyName}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      prodi.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                      prodi.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {prodi.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold">{prodi.memenuhi}</td>
                  <td className="px-6 py-4 text-center text-red-600 font-semibold">{prodi.belumMemenuhi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
