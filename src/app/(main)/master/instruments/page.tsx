import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InstrumentForm from "./InstrumentForm";
import MasterInstrumentTable from "./MasterInstrumentTable";
import InstrumentExcelActions from "./InstrumentExcelActions";

export default async function InstrumentsPage() {
  const session = await auth();
  if (session?.user?.role !== "KPMA") redirect("/dashboard");
  const instrumentsData = await prisma.instrument.findMany();
  const levels = await prisma.level.findMany({ orderBy: { name: "asc" } });
  
  const { sortInstruments } = await import("@/lib/utils");
  const instruments = sortInstruments(instrumentsData);

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Bulk Excel Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Master Instrumen MONEV</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola butir instrumen evaluasi mutu akademik. Anda dapat input manual atau mengunggah massal file Excel.
          </p>
        </div>
        <InstrumentExcelActions />
      </div>

      {/* 1. Interactive Form */}
      <InstrumentForm levels={levels} />

      {/* 2. Styled Data Table with Search */}
      <MasterInstrumentTable instruments={instruments} />
    </div>
  );
}
