import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InstrumentForm from "./InstrumentForm";
import MasterInstrumentTable from "./MasterInstrumentTable";

export default async function InstrumentsPage() {
  const session = await auth();
  if (session?.user?.role !== "KPMA") redirect("/dashboard");
  const instrumentsData = await prisma.instrument.findMany();
  const levels = await prisma.level.findMany({ orderBy: { name: "asc" } });
  
  const { sortInstruments } = await import("@/lib/utils");
  const instruments = sortInstruments(instrumentsData);

  return (
    <div className="w-full">
      {/* 1. Interactive Form matches the mockup */}
      <InstrumentForm levels={levels} />

      {/* 2. Styled Data Table with Search */}
      <MasterInstrumentTable instruments={instruments} />
    </div>
  );
}
