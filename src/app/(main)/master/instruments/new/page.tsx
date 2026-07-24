import prisma from "@/lib/prisma";
import InstrumentForm from "../InstrumentForm";

export default async function NewInstrument() {
  const levels = await prisma.level.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="w-full">
      <InstrumentForm levels={levels} />
    </div>
  );
}
