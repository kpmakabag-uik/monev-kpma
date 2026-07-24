import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProdiSelector from "./ProdiSelector";
import InstrumentTable from "./InstrumentTable";
import ImportDataButton from "./ImportDataButton";

interface Instrument {
  id: string;
  name: string;
  category: string;
  jenjang_peruntukan: string;
}

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

  // 3. Fetch instruments based on selected Prodi
  let instruments: Instrument[] = [];
  if (selectedProdiDetails) {
    const instData = await prisma.instrument.findMany({
      where: {
        OR: [
          { jenjang_peruntukan: "Semua" },
          { jenjang_peruntukan: (selectedProdiDetails as Prodi).jenjang }
        ]
      }
    });
    const { sortInstruments } = await import("@/lib/utils");
    instruments = sortInstruments(instData);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Form MONEV</h1>
          <p className="text-gray-500 mt-1">Pilih Program Studi untuk melihat dan mengisi instrumen evaluasi.</p>
        </div>
        
        {/* Action Buttons & Selector */}
        <div className="flex items-center gap-3">
          {(userRole === "GKM" || userRole === "KPMA") && selectedProdiId && (
            <ImportDataButton prodiId={selectedProdiId} />
          )}
          <ProdiSelector 
            prodis={accessibleProdis} 
            selectedId={selectedProdiId} 
          />
        </div>
      </div>

      {selectedProdiDetails ? (
        <InstrumentTable 
          instruments={instruments} 
          prodiId={selectedProdiDetails.id} 
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
           <div className="text-4xl mb-3">🏢</div>
           <p className="font-medium">Tidak ada Program Studi yang tersedia untuk akun Anda.</p>
        </div>
      )}
    </div>
  );
}
