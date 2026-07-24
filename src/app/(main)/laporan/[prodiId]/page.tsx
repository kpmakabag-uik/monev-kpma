import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProdiMonevReport } from "@/app/actions/monev";
import ReportView from "../ReportView";
import Link from "next/link";

export default async function LaporanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ prodiId: string }>;
  searchParams: Promise<{ tahun?: string; semester?: string }>;
}) {
  const { prodiId } = await params;
  const { tahun, semester } = await searchParams;
  
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!tahun || !semester) {
    redirect("/laporan");
  }

  const result = await getProdiMonevReport(prodiId, tahun, semester);

  if (!result.success || !result.prodi) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-100">
        <h2 className="font-bold">Error</h2>
        <p>{result.error || "Gagal memuat data laporan."}</p>
        <Link href="/laporan" className="mt-4 inline-block text-sm font-bold underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/laporan" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview Laporan MONEV</h1>
            <p className="text-gray-500 text-sm">
              {result.prodi.name} ({result.prodi.jenjang}) - {tahun} {semester}
            </p>
          </div>
        </div>
      </div>

      <ReportView 
        prodi={result.prodi} 
        records={result.records} 
        cycle={{ tahun, semester }} 
      />
    </div>
  );
}
