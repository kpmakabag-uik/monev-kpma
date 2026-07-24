import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/encryption";
import AnalisisForm from "./AnalisisForm";
import AnalisisReport from "./AnalisisReport";

export default async function AnalisisPage({
  searchParams
}: {
  searchParams: Promise<{ cycleId?: string; prodiId?: string }>
}) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") {
    redirect("/dashboard");
  }

  const { cycleId, prodiId } = await searchParams;

  // Fetch options for the form
  const cycles = await prisma.cycle.findMany({ orderBy: { tahun_akademik: "desc" } });
  const faculties = await prisma.faculty.findMany({ include: { prodis: true }, orderBy: { name: "asc" } });

  // If a selection is made, fetch report data
  let reportData = null;
  if (cycleId && prodiId) {
    const cycle = cycles.find(c => c.id === cycleId);
    const prodi = await prisma.prodi.findUnique({ where: { id: prodiId }, include: { faculty: true } });
    
    if (cycle && prodi) {
      const instrumentsRaw = await prisma.instrument.findMany({
        where: {
          OR: [
            { jenjang_peruntukan: "Semua" },
            { jenjang_peruntukan: prodi.jenjang }
          ]
        }
      });
      const { sortInstruments } = await import("@/lib/utils");
      const instruments = sortInstruments(instrumentsRaw);
      
      const records = await prisma.monevRecord.findMany({
        where: {
          prodiId,
          tahun_akademik: cycle.tahun_akademik,
          semester: cycle.semester
        }
      });

      // Decrypt and parse answers
      const parsedRecords = records.map(r => {
        let dec = r.answers as string;
        if (dec && dec.includes(":")) {
          dec = decrypt(dec);
        }
        let ans = {};
        try { ans = JSON.parse(dec); } catch {}
        return { ...r, parsedAnswers: ans as any };
      });

      reportData = {
        cycle,
        prodi,
        instruments,
        records: parsedRecords
      };
    }
  }

  // Fetch KETUA_KPMA from environment variable
  let ketuaKpma = process.env.NEXT_PUBLIC_KETUA_KPMA || "Dr. Santi Lisnawati, M.Si., M.Pd.";

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analisis MONEV KPMA</h1>
        <p className="text-gray-500 mt-1">Generate laporan analisis berdasarkan siklus dan program studi.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <AnalisisForm cycles={cycles} faculties={faculties} selectedCycle={cycleId} selectedProdi={prodiId} />
      </div>

      {reportData && (
        <div key={`${cycleId}-${prodiId}`} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
          <AnalisisReport data={reportData} ketuaKpma={ketuaKpma} />
        </div>
      )}
    </div>
  );
}
