import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import LaporanEksekutifTable from "./LaporanEksekutifTable";

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

export default async function LaporanMainPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.role;
  const userFaculty = session.user.facultyId;
  const userProdi = session.user.prodiId;

  // 1. Fetch accessible Prodis based on role
  let prodis: Prodi[] = [];
  if (userRole === "KPMA" || userRole === "PIMPINAN_UNIVERSITAS") {
    prodis = await prisma.prodi.findMany({ include: { faculty: true } });
  } else if (userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") {
    prodis = await prisma.prodi.findMany({ 
      where: { facultyId: userFaculty || undefined },
      include: { faculty: true }
    });
  } else if (userRole === "GKM") {
    prodis = await prisma.prodi.findMany({
      where: { id: userProdi || undefined },
      include: { faculty: true }
    });
  }

  // 2. Fetch cycles
  const cycles = await prisma.cycle.findMany({
    orderBy: [
      { tahun_akademik: 'desc' },
      { semester: 'desc' }
    ]
  });

  const activeCycle = cycles.find(c => c.isActive) || cycles[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan MONEV</h1>
        <p className="text-gray-500 mt-1">Pilih Program Studi dan Siklus untuk mencetak laporan isian data.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <LaporanEksekutifTable prodis={prodis} activeCycle={activeCycle} userRole={userRole} />
      </div>
    </div>
  );
}
