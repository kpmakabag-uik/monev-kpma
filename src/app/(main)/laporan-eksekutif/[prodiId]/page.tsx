import { getExecutiveSummary } from "@/app/actions/report";
import ExecutiveReportView from "./ExecutiveReportView";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    prodiId: string;
  }>;
}

export default async function LaporanEksekutifPage({ params }: PageProps) {
  const { prodiId } = await params;
  const result = await getExecutiveSummary(prodiId);

  if (!result.success || !result.data) {
    if (result.error === "Prodi tidak ditemukan.") {
      notFound();
    }
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Gagal memuat laporan eksekutif: {result.error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ExecutiveReportView data={result.data} />
    </div>
  );
}
