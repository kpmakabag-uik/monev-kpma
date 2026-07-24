import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditInstrumentForm from "./EditInstrumentForm";

export default async function EditInstrument({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const instrument = await prisma.instrument.findUnique({ where: { id: decodedId } });
  if (!instrument) notFound();
  const levels = await prisma.level.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="w-full">
      <EditInstrumentForm instrument={instrument} levels={levels} />
    </div>
  );
}
