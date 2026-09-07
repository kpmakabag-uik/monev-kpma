import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProdiSelector from "./ProdiSelector";
import InstrumentTable, { InstrumentWithProgress } from "./InstrumentTable";
import ImportDataButton from "./ImportDataButton";
import FinalizeSubmissionModal from "./FinalizeSubmissionModal";
import { decrypt } from "@/lib/encryption";

interface Prodi {
  id: string;
  name: string;
  jenjang: string;
  faculty: {
    id: string;
    name: string;
  };
}

export default async function MonevListPage({
  searchParams,
}: {
  searchParams: Promise<{ prodiId?: string }>
}) {
  const { prodiId: spProdiId } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.role;
  const userFaculty = session.user.facultyId;
  const userProdi = session.user.prodiId;

  // 1. Fetch accessible Prodis based on role
  let accessibleProdis: Prodi[] = [];
  if (userRole === "KPMA" || userRole === "PIMPINAN_UNIVERSITAS") {
    accessibleProdis = (await prisma.prodi.findMany({ include: { faculty: true } })) as unknown as Prodi[];
  } else if (userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") {
    accessibleProdis = (await prisma.prodi.findMany({ 
      where: { facultyId: userFaculty || undefined },
      include: { faculty: true }
    })) as unknown as Prodi[];
  } else if (userRole === "GKM") {
    accessibleProdis = (await prisma.prodi.findMany({
      where: { id: userProdi || undefined },
      include: { faculty: true }
    })) as unknown as Prodi[];
  }

  // 2. Determine selected Prodi
  const selectedProdiId = spProdiId || (accessibleProdis.length > 0 ? accessibleProdis[0].id : null);
  const selectedProdiDetails = accessibleProdis.find(p => p.id === selectedProdiId);

  // 3. Fetch active cycle for progress tracking
  const activeCycle = (await prisma.cycle.findFirst({ where: { isActive: true } })) || {
    id: "default",
    tahun_akademik: "2025/2026",
    semester: "Genap",
    isActive: true,
    startDate: null as Date | null,
    endDate: null as Date | null,
  };

  // 4. Fetch instruments and monev records based on selected Prodi
  let instrumentsWithProgress: InstrumentWithProgress[] = [];
  let submission = null;
  
  if (selectedProdiDetails) {
    const instData = await prisma.instrument.findMany({
      where: {
        OR: [
          { jenjang_peruntukan: "Semua" },
          { jenjang_peruntukan: (selectedProdiDetails as Prodi).jenjang }
        ]
      }
    });

    const monevRecords = await prisma.monevrecord.findMany({
      where: {
        prodiId: selectedProdiDetails.id,
        tahun_akademik: activeCycle.tahun_akademik,
        semester: activeCycle.semester,
      }
    });

    submission = await prisma.monevsubmission.findUnique({
      where: {
        prodiId_tahun_akademik_semester: {
          prodiId: selectedProdiDetails.id,
          tahun_akademik: activeCycle.tahun_akademik,
          semester: activeCycle.semester,
        }
      }
    });

    const { sortInstruments } = await import("@/lib/utils");
    const sortedInstruments = sortInstruments(instData);

    instrumentsWithProgress = sortedInstruments.map((inst: any) => {
      const questions = JSON.parse(inst.questions || "[]");
      const totalItems = questions.length;
      let filledItems = 0;
      let totalKlaimYa = 0;
      let uploadedBukti = 0;
      let filledKeterangan = 0;
      let verifiedItems = 0;
      let sesuaiItems = 0;

      const record = monevRecords.find((r: any) => r.instrumentId === inst.id);
      if (record?.answers) {
        try {
          const decrypted = record.answers.includes(":") ? decrypt(record.answers) : record.answers;
          const parsedAnswers = JSON.parse(decrypted);
          
          Object.keys(parsedAnswers).forEach((qId) => {
            const answer = parsedAnswers[qId];
            if (answer && answer.pilihan && answer.pilihan !== "" && answer.pilihan !== "-") {
              filledItems++;
              if (answer.pilihan === "Ya") {
                totalKlaimYa++;
                if (answer.buktiLinks && Array.isArray(answer.buktiLinks) && answer.buktiLinks.length > 0) {
                  uploadedBukti++;
                }
              }
              
              // Cek validitas keterangan (Evaluasi Diri)
              if (answer.evaluasiDiri) {
                const text = answer.evaluasiDiri.trim();
                const wordCount = text.split(/\s+/).length;
                const uniqueChars = new Set(text.replace(/\s/g, '').split('')).size;
                
                if (
                  text.length >= 10 && 
                  text !== "-" && 
                  text.toLowerCase() !== "tidak ada" &&
                  wordCount >= 3 &&
                  uniqueChars >= 4 &&
                  !/(.)\1{4,}/.test(text)
                ) {
                  filledKeterangan++;
                }
              }
            }
            if (answer && answer.kesesuaianBukti && answer.kesesuaianBukti !== "" && answer.kesesuaianBukti !== "-") {
              verifiedItems++;
              if (answer.kesesuaianBukti === "Ya" || answer.kesesuaianBukti === "Sesuai") {
                sesuaiItems++;
              }
            }
          });
        } catch (e) {
          console.error("Error parsing answers for instrument", inst.id);
        }
      }

      return {
        id: inst.id,
        name: inst.name,
        category: inst.category,
        jenjang_peruntukan: inst.jenjang_peruntukan,
        totalItems,
        filledItems,
        totalKlaimYa,
        uploadedBukti,
        filledKeterangan,
        verifiedItems,
        sesuaiItems
      };
    });

    let isExpired = false;
    let remainingDays: number | null = null;
    if (activeCycle.endDate) {
      const end = new Date(activeCycle.endDate);
      end.setHours(23, 59, 59, 999);
      const now = new Date();
      const diffMs = end.getTime() - now.getTime();
      remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffMs < 0) isExpired = true;
    }
    const isSubmitted = submission?.isSubmitted ?? false;
    const isLocked = isExpired || isSubmitted;
    const allDone = instrumentsWithProgress.length > 0 && instrumentsWithProgress.every(i => i.filledItems === i.totalItems);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Form MONEV</h1>
            <p className="text-gray-500 mt-1">Pilih Program Studi untuk melihat dan mengisi instrumen evaluasi.</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {(userRole === "GKM" || userRole === "KPMA") && selectedProdiId && !isLocked && (
              <ImportDataButton prodiId={selectedProdiId} />
            )}
            <ProdiSelector 
              prodis={accessibleProdis} 
              selectedId={selectedProdiId} 
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border shadow-sm transition-all">
          {isSubmitted ? (
            <div className="bg-emerald-50 border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">Pengisian Selesai & Disahkan Pakta Integritas</h4>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    Data terkunci pada {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"} oleh <strong>{submission?.pactAgreedBy || "PIC Prodi"}</strong>.
                  </p>
                </div>
              </div>
              <FinalizeSubmissionModal
                prodiId={selectedProdiDetails.id}
                prodiName={selectedProdiDetails.name}
                tahunAkademik={activeCycle.tahun_akademik}
                semester={activeCycle.semester}
                isSubmitted={true}
                submittedAt={submission?.submittedAt ?? null}
                pactAgreedBy={submission?.pactAgreedBy ?? null}
                allDone={allDone}
                userRole={userRole || "GKM"}
              />
            </div>
          ) : isExpired ? (
            <div className="bg-red-50 border-red-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-red-950">Batas Waktu Pengisian Telah Berakhir</h4>
                  <p className="text-xs text-red-800/80 mt-0.5">
                    Periode pengisian MONEV siklus {activeCycle.tahun_akademik} ({activeCycle.semester}) telah berakhir pada {activeCycle.endDate ? new Date(activeCycle.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}. Seluruh formulir terkunci dalam mode baca.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50/70 border-blue-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-black text-xs">
                  {remainingDays !== null ? `${remainingDays}H` : "🕒"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-blue-950">Periode Pengisian MONEV Sedang Aktif</h4>
                    {remainingDays !== null && remainingDays <= 3 && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-extrabold rounded-full uppercase animate-pulse">
                        Mendekati Batas Akhir
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-800/80 mt-0.5">
                    {activeCycle.endDate ? (
                      <>Batas waktu akhir pengisian: <strong>{new Date(activeCycle.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong> {remainingDays !== null ? `(Tersisa ${remainingDays} hari)` : ""}.</>
                    ) : (
                      "Batas waktu belum ditentukan oleh KPMA. Segera lengkapi data evaluasi diri Anda."
                    )}
                  </p>
                </div>
              </div>

              {(userRole === "GKM" || userRole === "KPMA") && (
                <FinalizeSubmissionModal
                  prodiId={selectedProdiDetails.id}
                  prodiName={selectedProdiDetails.name}
                  tahunAkademik={activeCycle.tahun_akademik}
                  semester={activeCycle.semester}
                  isSubmitted={false}
                  submittedAt={null}
                  pactAgreedBy={null}
                  allDone={allDone}
                  userRole={userRole || "GKM"}
                />
              )}
            </div>
          )}
        </div>

        <InstrumentTable 
          instruments={instrumentsWithProgress} 
          prodiId={selectedProdiDetails.id} 
          userRole={userRole}
          isLocked={isLocked}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Form MONEV</h1>
          <p className="text-gray-500 mt-1">Pilih Program Studi untuk melihat dan mengisi instrumen evaluasi.</p>
        </div>
        <ProdiSelector prodis={accessibleProdis} selectedId={selectedProdiId} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
        <div className="text-4xl mb-3">🏢</div>
        <p className="font-medium">Tidak ada Program Studi yang tersedia untuk akun Anda.</p>
      </div>
    </div>
  );
}
