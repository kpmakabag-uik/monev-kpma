import { getUniversityExecutiveSummary } from "@/app/actions/report";
import UniversityReportView from "./UniversityReportView";
import { notFound } from "next/navigation";

export default async function UniversityLaporanEksekutifPage() {
  const result = await getUniversityExecutiveSummary();

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Gagal memuat laporan eksekutif universitas: {result.error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <UniversityReportView data={result.data} />
    </div>
  );
}
