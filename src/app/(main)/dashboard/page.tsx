import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import DashboardAccordion from "./DashboardAccordion";
import DashboardAnalytics from "./DashboardAnalytics";
import ExportButtons from "./ExportButtons";
import DashboardTabs from "./DashboardTabs";
import DashboardFilter from "./DashboardFilter";
import { Prisma } from "@prisma/client";
import { decrypt } from "@/lib/encryption";

interface ProdiProgress {
  id: string;
  name: string;
  jenjang: string;
  gkmProgress: number;
  gpmProgress: number;
  kbProgress: number;
  kpmaProgress: number;
  isCompleted: boolean;
}

interface FacultyProgress {
  id: string;
  name: string;
  gkmProgress: number;
  gpmProgress: number;
  kbProgress: number;
  kpmaProgress: number;
  prodis: ProdiProgress[];
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ facultyId?: string; prodiId?: string }> }) {
  const { facultyId, prodiId } = await searchParams;
  const session = await auth();
  const userRole = session?.user?.role;
  const userFaculty = session?.user?.facultyId;
  const userProdi = session?.user?.prodiId;

  // 1. Get Setting
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const tahunAkademik = cycle?.tahun_akademik || "-";
  const semester = cycle?.semester || "-";

  // 2. Get Instruments
  const instrumentsData = await prisma.instrument.findMany();
  const { sortInstruments } = await import("@/lib/utils");
  const instruments = sortInstruments(instrumentsData);

  // 3. Get Faculties & Prodis based on role
  let facultyWhere: Prisma.facultyWhereInput = {};
  if (userRole !== "KPMA" && userRole !== "PIMPINAN_UNIVERSITAS") {
    if (userFaculty) {
      facultyWhere = { id: userFaculty };
    }
  }

  const allAllowedFaculties = await prisma.faculty.findMany({
    where: facultyWhere,
    include: {
      prodi: userProdi ? { where: { id: userProdi } } : true,
    },
    orderBy: { name: "asc" }
  });

  const faculties = allAllowedFaculties
    .filter(f => !facultyId || f.id === facultyId)
    .map(f => ({
      ...f,
      prodis: f.prodi.filter((p: any) => !prodiId || p.id === prodiId)
    }))
    .filter(f => f.prodis.length > 0);

  // Flat list of prodi ids
  const prodiIds = faculties.flatMap(f => f.prodis.map((p: any) => p.id));
  const prodiCount = prodiIds.length;

  // 4. Get Monev Records for active cycle
  const monevRecordsRaw = await prisma.monevrecord.findMany({
    where: {
      tahun_akademik: tahunAkademik,
      semester: semester,
      prodiId: { in: prodiIds }
    }
  });

  const monevRecords = monevRecordsRaw.map((r: any) => {
    let dec = r.answers as string;
    if (dec && dec.includes(":")) dec = decrypt(dec);
    let ans = {};
    try { ans = JSON.parse(dec); } catch {}
    return { ...r, parsedAnswers: ans as any };
  });

  // 4.5 Get Recent Activity
  const recentActivity = await prisma.monevrecord.findMany({
    where: {
      tahun_akademik: tahunAkademik,
      semester: semester,
      prodiId: { in: prodiIds }
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      prodi: true,
      instrument: true
    }
  });


  // 5. Calculate Progress
  const facultyProgressData: FacultyProgress[] = [];

  for (const faculty of faculties) {
    const prodiProgressData: ProdiProgress[] = [];
    
    for (const prodi of faculty.prodis) {
      const applicableInsts = instruments.filter(i => i.jenjang_peruntukan === 'Semua' || i.jenjang_peruntukan === prodi.jenjang);
      
      let totalQuestions = 0;
      applicableInsts.forEach(inst => {
        try {
          const qs = JSON.parse(inst.questions);
          totalQuestions += qs.length;
        } catch {
          // Ignore parse errors
        }
      });
      
      const totalInsts = applicableInsts.length;
      
      let gkmAns = 0, gpmAns = 0, kbAns = 0, kpmaAns = 0;
      
      for (const inst of applicableInsts) {
        const record = monevRecords.find((r: any) => r.prodiId === prodi.id && r.instrumentId === inst.id);
        if (record) {
           if (record.analisa_kpma) kpmaAns++;
           try {
             const answers = record.parsedAnswers;
             const qs = JSON.parse(inst.questions);
             for (const q of qs) {
               if (answers[q.id]?.pilihan) gkmAns++;
               if (answers[q.id]?.catatanAuditor) gpmAns++;
               if (answers[q.id]?.kesesuaianBukti) kbAns++;
             }
           } catch {
             // Ignore parse errors
           }
        }
      }
      
      const gkmProgress = totalQuestions > 0 ? Math.round((gkmAns / totalQuestions) * 100) : 0;
      const gpmProgress = totalQuestions > 0 ? Math.round((gpmAns / totalQuestions) * 100) : 0;
      const kbProgress = totalQuestions > 0 ? Math.round((kbAns / totalQuestions) * 100) : 0;
      const kpmaProgress = totalInsts > 0 ? Math.round((kpmaAns / totalInsts) * 100) : 0;
      
      const isCompleted = gkmProgress === 100 && gpmProgress === 100 && kbProgress === 100 && kpmaProgress === 100;
      
      prodiProgressData.push({
        id: prodi.id,
        name: prodi.name,
        jenjang: prodi.jenjang,
        gkmProgress,
        gpmProgress,
        kbProgress,
        kpmaProgress,
        isCompleted
      });
    }
    
    // Sort prodis alphabetically
    prodiProgressData.sort((a, b) => a.name.localeCompare(b.name));

    const numProdis = prodiProgressData.length;
    const fGkm = numProdis > 0 ? Math.round(prodiProgressData.reduce((acc, curr) => acc + curr.gkmProgress, 0) / numProdis) : 0;
    const fGpm = numProdis > 0 ? Math.round(prodiProgressData.reduce((acc, curr) => acc + curr.gpmProgress, 0) / numProdis) : 0;
    const fKb = numProdis > 0 ? Math.round(prodiProgressData.reduce((acc, curr) => acc + curr.kbProgress, 0) / numProdis) : 0;
    const fKpma = numProdis > 0 ? Math.round(prodiProgressData.reduce((acc, curr) => acc + curr.kpmaProgress, 0) / numProdis) : 0;
    
    // Only add faculty if it has prodis (relevant for GKM users who only see 1 prodi)
    if (numProdis > 0) {
      facultyProgressData.push({
        id: faculty.id,
        name: faculty.name,
        gkmProgress: fGkm,
        gpmProgress: fGpm,
        kbProgress: fKb,
        kpmaProgress: fKpma,
        prodis: prodiProgressData
      });
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Monitoring</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang kembali, <span className="font-semibold text-institusi">{session?.user?.name}</span>.
        </p>
      </div>

      <DashboardFilter faculties={allAllowedFaculties} />

      <DashboardTabs 
        monitoringContent={
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                <div className="w-12 h-12 bg-blue-50 text-institusi rounded-lg flex items-center justify-center text-2xl mr-4">
                  🎓
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium tracking-wide">Total Prodi Terpantau</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{prodiCount}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-2xl mr-4">
                  📅
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium tracking-wide">Siklus Ditampilkan</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{tahunAkademik} {semester}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-2xl mr-4">
                  📄
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium tracking-wide">Instrumen Standar</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{instruments.length}</p>
                </div>
              </div>
            </div>

            <DashboardAnalytics faculties={faculties} instruments={instruments} records={monevRecords} />

            {/* Recent Activity Section */}
            {recentActivity.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Aktivitas Pengisian Terbaru
                  </h2>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Feed</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentActivity.map((act: any) => (
                    <div key={act.id} className="px-6 py-3 hover:bg-blue-50/30 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                            {act.prodi.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-sm text-gray-800">
                              <span className="font-bold text-institusi">{act.prodi.name}</span>
                              <span className="text-gray-500 mx-1">telah mengisi butir</span>
                              <span className="font-bold text-gray-900">{act.instrumentId}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(act.updatedAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                            </p>
                        </div>
                      </div>
                      <a 
                        href={`/monev/${act.prodiId}/${act.instrumentId}`}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        LIHAT DATA →
                      </a>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        }
        progresContent={
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Progres Pengisian per Fakultas
              </h2>
              <ExportButtons data={facultyProgressData} cycle={`${tahunAkademik} ${semester}`} />
            </div>
            <DashboardAccordion faculties={facultyProgressData} />
          </div>
        }
      />
    </div>
  );
}
