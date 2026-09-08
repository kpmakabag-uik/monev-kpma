import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EvidenceRepository from "./EvidenceRepository";

export const metadata = {
  title: "Repositori Bukti MONEV | UIKA Bogor",
};

export default async function EvidencePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user;
  const userRole = user.role || "GKM";
  const userFacultyId = user.facultyId;
  const userProdiId = user.prodiId;

  // Filter prodi berdasarkan peran pengguna
  let prodiFilter: any = {};
  if (userRole === "GKM" && userProdiId) {
    prodiFilter = { id: userProdiId };
  } else if ((userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") && userFacultyId) {
    prodiFilter = { facultyId: userFacultyId };
  }

  const [prodis, cycles, faculties] = await Promise.all([
    prisma.prodi.findMany({
      where: prodiFilter,
      include: { faculty: true },
      orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.cycle.findMany({
      orderBy: [{ tahun_akademik: "desc" }, { semester: "desc" }],
    }),
    prisma.faculty.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const activeCycle = cycles.find((c) => c.isActive) || cycles[0];

  return (
    <div className="w-full space-y-6">
      <EvidenceRepository
        prodis={prodis}
        cycles={cycles}
        faculties={faculties}
        activeCycle={activeCycle}
        userRole={userRole}
        userProdiId={userProdiId}
        userFacultyId={userFacultyId}
      />
    </div>
  );
}
