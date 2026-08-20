import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getExecutiveSummary } from "@/app/actions/report";
import ExecutiveReportView from "../[prodiId]/ExecutiveReportView";
import AutoPrintWrapper from "./AutoPrintWrapper";

interface Faculty {
  id: string;
  name: string;
}

interface Prodi {
  id: string;
  name: string;
  jenjang: string;
  faculty: Faculty;
}

export default async function PrintAllPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.role;
  const userFaculty = session.user.facultyId;

  // Protect route
  if (userRole !== "KPMA" && userRole !== "PIMPINAN_UNIVERSITAS" && userRole !== "PIMPINAN_FAKULTAS") {
    redirect("/laporan-eksekutif");
  }

  // 1. Fetch accessible Prodis based on role
  let prodis: Prodi[] = [];
  if (userRole === "KPMA" || userRole === "PIMPINAN_UNIVERSITAS") {
    prodis = await prisma.prodi.findMany({ include: { faculty: true } });
  } else if (userRole === "PIMPINAN_FAKULTAS") {
    prodis = await prisma.prodi.findMany({ 
      where: { facultyId: userFaculty || undefined },
      include: { faculty: true }
    });
  }

  // 2. Fetch active cycle
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) return <div>Tidak ada siklus aktif.</div>;

  // 3. Fetch summary for all prodis concurrently
  const summaries = await Promise.all(
    prodis.map(async (prodi) => {
      const res = await getExecutiveSummary(prodi.id, cycle.id);
      return res.success ? res.data : null;
    })
  );

  const validSummaries = summaries.filter(Boolean) as any[];

  return (
    <AutoPrintWrapper>
      <div className="bg-white">
        {validSummaries.map((data, idx) => (
          <div key={idx} className={idx < validSummaries.length - 1 ? "print:break-after-page" : ""}>
            <ExecutiveReportView data={data} />
            {/* Add visual separation on screen (hidden on print) */}
            {idx < validSummaries.length - 1 && (
              <div className="h-4 bg-gray-200 print:hidden my-8" />
            )}
          </div>
        ))}
        {validSummaries.length === 0 && (
          <div className="p-8 text-center text-gray-500">Tidak ada data untuk dicetak.</div>
        )}
      </div>
    </AutoPrintWrapper>
  );
}
