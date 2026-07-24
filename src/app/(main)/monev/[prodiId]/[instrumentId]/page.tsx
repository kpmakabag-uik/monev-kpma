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

  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } }) || { tahun_akademik: "2025/2026", semester: "Genap" };

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
  const existingRecord = await prisma.monevRecord.findUnique({
    where: {
      prodiId_instrumentId_tahun_akademik_semester: {
        prodiId,
        instrumentId: decodedInstrumentId,
        tahun_akademik: cycle.tahun_akademik,
        semester: cycle.semester
      }
    }
  });

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
      />
    </div>
  );
}
