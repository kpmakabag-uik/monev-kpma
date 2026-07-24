"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SearchableSelect from "@/components/SearchableSelect";

export default function DashboardFilter({ faculties }: { faculties: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const facultyId = searchParams.get("facultyId") || "";
  const prodiId = searchParams.get("prodiId") || "";

  // Check if filtering is applicable for this user role
  const canFilter = faculties.length > 1 || (faculties.length === 1 && faculties[0]?.prodis.length > 1);
  if (!canFilter) return null;

  const facultyOptions = [
    { value: "", label: "-- Semua Fakultas --" },
    ...faculties.map((f: any) => ({ value: f.id, label: f.name }))
  ];
  
  const selectedFaculty = faculties.find((f: any) => f.id === facultyId);
  const availableProdis = selectedFaculty ? selectedFaculty.prodis : faculties.flatMap((f: any) => f.prodis);
  
  const prodiOptions = [
    { value: "", label: "-- Semua Program Studi --" },
    ...availableProdis.map((p: any) => ({ value: p.id, label: `${p.jenjang} - ${p.name}` }))
  ];

  const updateFilters = (facId: string, prodId: string) => {
    const params = new URLSearchParams(searchParams);
    if (facId) params.set("facultyId", facId); else params.delete("facultyId");
    if (prodId) params.set("prodiId", prodId); else params.delete("prodiId");
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter Fakultas</label>
        <SearchableSelect 
          options={facultyOptions}
          value={facultyId}
          onChange={(val) => updateFilters(val, "")}
          placeholder="-- Semua Fakultas --"
        />
      </div>
      <div className="w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter Program Studi</label>
        <SearchableSelect 
          options={prodiOptions}
          value={prodiId}
          onChange={(val) => updateFilters(facultyId, val)}
          placeholder="-- Semua Program Studi --"
        />
      </div>
    </div>
  );
}
