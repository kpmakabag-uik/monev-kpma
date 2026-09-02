import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProdiSelector from "./ProdiSelector";
import InstrumentTable, { InstrumentWithProgress } from "./InstrumentTable";
import ImportDataButton from "./ImportDataButton";
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
  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } }) || { tahun_akademik: "2025/2026", semester: "Genap" };

  // 4. Fetch instruments and monev records based on selected Prodi
  let instrumentsWithProgress: InstrumentWithProgress[] = [];
  
  if (selectedProdiDetails) {
    const instData = await prisma.instrument.findMany({
      where: {
        OR: [
          { jenjang_peruntukan: "Semua" },
          { jenjang_peruntukan: (selectedProdiDetails as Prodi).jenjang }
        ]
      }
    });

    const monevRecords = await prisma.monevRecord.findMany({
      where: {
        prodiId: selectedProdiDetails.id,
        tahun_akademik: activeCycle.tahun_akademik,
        semester: activeCycle.semester,
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
                
                // Aturan validasi:
                // 1. Tidak kosong & bukan strip "-"
                // 2. Panjang minimal 10 karakter
                // 3. Minimal terdiri dari 3 kata (mencegah jawaban asalan seperti "sudah ada")
                // 4. Tidak boleh huruf berulang seperti "aaaaaa" (karakter unik minimal 4 jika string panjang)
                // 5. Tidak boleh ada 5 huruf sama berurutan berturut-turut
                if (
                  text.length >= 10 && 
                  text !== "-" && 
                  text.toLowerCase() !== "tidak ada" &&
                  wordCount >= 3 &&
                  uniqueChars >= 4 &&
                  !/(.)\1{4,}/.test(text) // Tidak ada karakter berulang 5x (ex: aaaaa)
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
          instruments={instrumentsWithProgress} 
          prodiId={selectedProdiDetails.id} 
          userRole={userRole}
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
