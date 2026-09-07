import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { decrypt } from "@/lib/encryption";
import AnalisisForm from "./AnalisisForm";
import AnalisisReport from "./AnalisisReport";
import BatchPublishModal from "./BatchPublishModal";

export default async function AnalisisPage({
  searchParams
}: {
  searchParams: Promise<{ cycleId?: string; prodiId?: string }>
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role || "GKM";
  const userFaculty = session.user.facultyId;
  const userProdi = session.user.prodiId;

  const { cycleId: queryCycleId, prodiId: queryProdiId } = await searchParams;

  // 1. Fetch cycles
  const cycles = await prisma.cycle.findMany({ 
    orderBy: [
      { tahun_akademik: "desc" },
      { semester: "desc" }
    ] 
  });
  const activeCycle = cycles.find(c => c.isActive) || cycles[0];
  const effectiveCycleId = queryCycleId || activeCycle?.id || "";

  // 2. Fetch accessible faculties and prodis based on role
  let facultyWhere: any = {};
  if (userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") {
    if (userFaculty) facultyWhere.id = userFaculty;
  } else if (userRole === "GKM") {
    if (userProdi) {
      facultyWhere.prodi = { some: { id: userProdi } };
    }
  }

  const faculties = await prisma.faculty.findMany({ 
    where: facultyWhere,
    include: { 
      prodi: userRole === "GKM" && userProdi ? { where: { id: userProdi } } : true 
    }, 
    orderBy: { name: "asc" } 
  });

  // 3. Determine effective prodiId
  let effectiveProdiId = queryProdiId || "";
  if (userRole === "GKM") {
    effectiveProdiId = userProdi || "";
  } else if (!effectiveProdiId) {
    // If GPM or Pimpinan, pick first prodi of faculty
    const firstP = faculties[0]?.prodi?.[0];
    if (firstP) effectiveProdiId = firstP.id;
  }

  // 4. If selection is made, fetch report data
  let reportData = null;
  if (effectiveCycleId && effectiveProdiId) {
    const cycle = cycles.find(c => c.id === effectiveCycleId);
    const prodi = await prisma.prodi.findUnique({ 
      where: { id: effectiveProdiId }, 
      include: { faculty: true } 
    });
    
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
      
      const records = await prisma.monevrecord.findMany({
        where: {
          prodiId: effectiveProdiId,
          tahun_akademik: cycle.tahun_akademik,
          semester: cycle.semester
        }
      });

      // Decrypt and parse answers
      const parsedRecords = records.map((r: any) => {
        let dec = r.answers as string;
        if (dec && dec.includes(":")) {
          dec = decrypt(dec);
        }
        let ans = {};
        try { ans = JSON.parse(dec); } catch {}
        return { ...r, parsedAnswers: ans as any };
      });

      const isPublished = parsedRecords.some((r: any) => r.isAnalysisPublished);

      reportData = {
        cycle,
        prodi,
        instruments,
        records: parsedRecords,
        isPublished
      };
    }
  }

  // Fetch KETUA_KPMA from environment variable
  let ketuaKpma = process.env.NEXT_PUBLIC_KETUA_KPMA || "Dr. Santi Lisnawati, M.Si., M.Pd.";
  const isKpma = userRole === "KPMA";

  return (
    <div className="space-y-6 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-institusi hover:bg-gray-50 shadow-sm transition-all group shrink-0"
            title="Kembali ke Dashboard"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analisis MONEV KPMA</h1>
            <p className="text-gray-500 mt-0.5 text-xs md:text-sm">
              Laporan resmi telaah & analisis mutu akademik internal oleh Kantor Penjaminan Mutu Akademik.
            </p>
          </div>
        </div>

        {isKpma && (
          <div className="flex items-center gap-2">
            <BatchPublishModal cycles={cycles} faculties={faculties} currentCycleId={effectiveCycleId} />
          </div>
        )}
      </div>

      {/* Selector Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <AnalisisForm 
          cycles={cycles} 
          faculties={faculties} 
          selectedCycle={effectiveCycleId} 
          selectedProdi={effectiveProdiId} 
          userRole={userRole}
        />
      </div>

      {/* Report or Unpublish Banner */}
      {reportData && (
        <div key={`${effectiveCycleId}-${effectiveProdiId}`} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
          {!isKpma && !reportData.isPublished ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-amber-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold border border-amber-300 shadow-inner">
                🔒
              </div>
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Status: Draft Internal KPMA
                </span>
                <h3 className="text-lg font-bold text-gray-900 pt-2">
                  Laporan Analisis Belum Dipublikasikan
                </h3>
                <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                  Catatan analisis, kriteria penilaian, dan rekomendasi tindak lanjut MONEV untuk program studi{" "}
                  <span className="font-semibold text-gray-800">{reportData.prodi.name}</span> pada siklus{" "}
                  <span className="font-semibold text-gray-800">{reportData.cycle.tahun_akademik} - {reportData.cycle.semester}</span>{" "}
                  saat ini sedang dalam proses perumusan internal oleh tim KPMA.
                </p>
              </div>
              <p className="text-xs text-amber-700 font-medium">
                Dokumen analisis resmi akan otomatis dapat diakses dan dicetak setelah diterbitkan oleh KPMA.
              </p>
            </div>
          ) : (
            <AnalisisReport data={reportData} ketuaKpma={ketuaKpma} userRole={userRole} />
          )}
        </div>
      )}
    </div>
  );
}
