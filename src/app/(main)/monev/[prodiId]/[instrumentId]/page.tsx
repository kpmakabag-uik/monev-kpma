import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import MonevForm from "./MonevForm";
import { decrypt } from "@/lib/encryption";

export default async function MonevFormDetailPage({
  params
}: {
  params: Promise<{ prodiId: string; instrumentId: string }>
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { prodiId, instrumentId } = await params;
  const decodedInstrumentId = decodeURIComponent(instrumentId);
  const userRole = session.user.role;

  // IDOR Prevention for Page View
  if (userRole === "GKM" && session.user.prodiId !== prodiId) {
    redirect("/dashboard"); // Redirect to safe page
  }
  if (userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") {
    const pDetail = await prisma.prodi.findUnique({ where: { id: prodiId }, select: { facultyId: true } });
    if (!pDetail || pDetail.facultyId !== session.user.facultyId) {
      redirect("/dashboard");
    }
  }

  const cycle = (await prisma.cycle.findFirst({ where: { isActive: true } })) || {
    id: "default",
    tahun_akademik: "2025/2026",
    semester: "Genap",
    isActive: true,
    startDate: null as Date | null,
    endDate: null as Date | null,
  };

  // Determine existing record for the cycleulty details
  const prodiDetail = await prisma.prodi.findUnique({
    where: { id: prodiId },
    include: { faculty: true }
  });

  const facultyName = prodiDetail?.faculty?.name || "Fakultas_Unknown";
  const prodiName = prodiDetail?.name || "Prodi_Unknown";
  const jenjang = prodiDetail?.jenjang || "S1";

  // 2. Fetch Instrument Data
  const instrument = await prisma.instrument.findUnique({
    where: { id: decodedInstrumentId }
  });

  const instData = instrument || {
    id: decodedInstrumentId, category: "BUDAYA MUTU", name: "Standar & Tata Kelola SPMI",
    kriteria: "Visi Misi", indikator: "Sistem Penjaminan Mutu Internal (SPMI)",
    questions: JSON.stringify([
      { id: "q1", text: "Apakah Program Studi memiliki Standar Pendidikan Tinggi yang melampaui SN Dikti?", bobot: 0 }
    ])
  };

  // 4. Fetch existing Record if any
  const existingRecord = await prisma.monevrecord.findUnique({
    where: {
      prodiId_instrumentId_tahun_akademik_semester: {
        prodiId,
        instrumentId: decodedInstrumentId,
        tahun_akademik: cycle.tahun_akademik,
        semester: cycle.semester
      }
    }
  });

  // Check submission & due date lock status
  const submission = await prisma.monevsubmission.findUnique({
    where: {
      prodiId_tahun_akademik_semester: {
        prodiId,
        tahun_akademik: cycle.tahun_akademik,
        semester: cycle.semester
      }
    }
  });

  let isExpired = false;
  let lockReason = "";
  if (cycle.endDate) {
    const end = new Date(cycle.endDate);
    end.setHours(23, 59, 59, 999);
    if (new Date() > end) {
      isExpired = true;
      lockReason = `Batas waktu pengisian siklus ini telah berakhir pada ${new Date(cycle.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`;
    }
  }

  if (submission?.isSubmitted) {
    lockReason = `Pengisian MONEV telah difinalisasi dan disahkan dengan Pakta Integritas pada ${submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}.`;
  }

  const isLocked = isExpired || (submission?.isSubmitted ?? false);

  let decryptedAnswers = "{}";
  if (existingRecord?.answers) {
    decryptedAnswers = existingRecord.answers.includes(":") ? decrypt(existingRecord.answers) : existingRecord.answers;
  }

  return (
    <div className="w-full pb-10">
      <MonevForm
        key={`${prodiId}-${decodedInstrumentId}-${cycle.tahun_akademik}-${cycle.semester}`}
        instrumentId={instData.id}
        instrumentName={instData.name || ""}
        instrumentCategory={instData.category || ""}
        instrumentIndikator={instData.indikator || ""}
        prodiId={prodiId}
        facultyName={facultyName}
        prodiName={prodiName}
        jenjang={jenjang}
        tahunAkademik={cycle.tahun_akademik}
        semester={cycle.semester}
        questions={JSON.parse(instData.questions || "[]")}
        initialAnswers={existingRecord ? JSON.parse(decryptedAnswers) : {}}
        initialAnalisa={existingRecord?.analisa_kpma || ""}
        userRole={userRole || "GKM"}
        isLocked={isLocked}
        lockReason={lockReason}
        isAnalysisPublished={existingRecord?.isAnalysisPublished ?? false}
      />
    </div>
  );
}
