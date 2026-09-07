"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SearchableSelect from "@/components/SearchableSelect";

export default function AnalisisForm({ 
  cycles, 
  faculties, 
  selectedCycle, 
  selectedProdi,
  userRole 
}: any) {
  const router = useRouter();
  const [cycleId, setCycleId] = useState(selectedCycle || "");
  const [prodiId, setProdiId] = useState(selectedProdi || "");

  const prodiOptions = faculties.flatMap((f: any) => 
    (f.prodi || f.prodis || []).map((p: any) => ({
      value: p.id,
      label: `${f.name} - ${p.jenjang} ${p.name}`
    }))
  );

  const handleCycleChange = (val: string) => {
    setCycleId(val);
    const targetProdi = prodiId || selectedProdi || prodiOptions[0]?.value;
    if (val && targetProdi) {
      router.push(`/master/analisis?cycleId=${val}&prodiId=${targetProdi}`);
    }
  };

  const handleProdiChange = (val: string) => {
    setProdiId(val);
    if (cycleId && val) {
      router.push(`/master/analisis?cycleId=${cycleId}&prodiId=${val}`);
    }
  };

  const cycleOptions = cycles.map((c: any) => ({
    value: c.id,
    label: `${c.tahun_akademik} - ${c.semester}`
  }));

  const isGkm = userRole === "GKM";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Siklus Monev</label>
        <SearchableSelect 
          options={cycleOptions}
          value={cycleId}
          onChange={handleCycleChange}
          placeholder="-- Pilih Siklus --"
        />
      </div>

      <div className="w-full md:w-1/2 flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
        {isGkm ? (
          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>{prodiOptions[0]?.label || "Program Studi Anda"}</span>
          </div>
        ) : (
          <SearchableSelect 
            options={prodiOptions}
            value={prodiId}
            onChange={handleProdiChange}
            placeholder="-- Cari Program Studi --"
          />
        )}
      </div>
    </div>
  );
}
