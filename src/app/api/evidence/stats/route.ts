import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cycleParam = searchParams.get("cycle") || "";
    const prodiId = searchParams.get("prodiId") || "all";
    const facultyId = searchParams.get("facultyId") || "all";

    const userRole = session.user.role || "GKM";
    const userFacultyId = session.user.facultyId;
    const userProdiId = session.user.prodiId;

    const whereEvidence: any = {};

    // 1. Role Constraints
    if (userRole === "GKM") {
      if (!userProdiId) return NextResponse.json({ success: true, totalEvidence: 0, categories: [] });
      whereEvidence.prodiId = userProdiId;
    } else if (userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") {
      if (!userFacultyId) return NextResponse.json({ success: true, totalEvidence: 0, categories: [] });
      if (prodiId && prodiId !== "all") {
        whereEvidence.prodiId = prodiId;
        whereEvidence.prodi = { facultyId: userFacultyId };
      } else {
        whereEvidence.prodi = { facultyId: userFacultyId };
      }
    } else {
      if (prodiId && prodiId !== "all") {
        whereEvidence.prodiId = prodiId;
      } else if (facultyId && facultyId !== "all") {
        whereEvidence.prodi = { facultyId };
      }
    }

    // 2. Cycle Filter
    if (cycleParam && cycleParam !== "all") {
      const [tahun, sem] = cycleParam.split(":");
      if (tahun && sem) {
        whereEvidence.tahun_akademik = tahun;
        whereEvidence.semester = sem;
      }
    }

    // 3. Detect target prodi jenjang if prodi is filtered
    let targetProdiJenjang: string | null = null;
    const effectiveProdiId = whereEvidence.prodiId;
    if (effectiveProdiId) {
      const p = await prisma.prodi.findUnique({
        where: { id: effectiveProdiId },
        select: { jenjang: true, name: true },
      });
      if (p?.jenjang) {
        targetProdiJenjang = p.jenjang.trim();
      }
    }

    // 4. Fetch instruments (filtered by prodi jenjang if prodi is selected)
    const allInstruments = await prisma.instrument.findMany({
      select: {
        id: true,
        category: true,
        name: true,
        jenjang_peruntukan: true,
        questions: true,
      },
      orderBy: [{ category: "asc" }, { id: "asc" }],
    });

    const instruments = targetProdiJenjang
      ? allInstruments.filter((inst) => {
          const j = (inst.jenjang_peruntukan || "").trim().toLowerCase();
          const targetJ = targetProdiJenjang!.toLowerCase();
          return j === "semua" || j === targetJ;
        })
      : allInstruments;

    // 5. Count evidence grouped by instrumentId
    const evidenceGroups = await prisma.monevevidence.groupBy({
      by: ["instrumentId"],
      where: whereEvidence,
      _count: { id: true },
    });

    const evidenceCountByInstrument = new Map<string, number>();
    let overallEvidenceTotal = 0;
    evidenceGroups.forEach((g) => {
      evidenceCountByInstrument.set(g.instrumentId, g._count.id);
      overallEvidenceTotal += g._count.id;
    });

    // 5. Group instruments by category
    interface CategorySummary {
      category: string;
      totalEvidence: number;
      instrumentCount: number;
      instruments: Array<{
        id: string;
        name: string;
        jenjang: string;
        subQuestionCount: number;
        evidenceCount: number;
      }>;
    }

    const categoryMap = new Map<string, CategorySummary>();

    instruments.forEach((inst) => {
      const catName = inst.category?.trim() || "Lainnya";
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, {
          category: catName,
          totalEvidence: 0,
          instrumentCount: 0,
          instruments: [],
        });
      }

      const catObj = categoryMap.get(catName)!;
      const count = evidenceCountByInstrument.get(inst.id) || 0;

      let subCount = 0;
      try {
        const qArr = JSON.parse(inst.questions || "[]");
        if (Array.isArray(qArr)) subCount = qArr.length;
      } catch (_) {}

      catObj.instrumentCount++;
      catObj.totalEvidence += count;
      catObj.instruments.push({
        id: inst.id,
        name: inst.name,
        jenjang: inst.jenjang_peruntukan,
        subQuestionCount: subCount,
        evidenceCount: count,
      });
    });

    // Urutkan kategori berdasarkan total dokumen terbanyak
    const categories = Array.from(categoryMap.values()).sort(
      (a, b) => b.totalEvidence - a.totalEvidence || a.category.localeCompare(b.category)
    );

    return NextResponse.json({
      success: true,
      totalEvidence: overallEvidenceTotal,
      prodiJenjang: targetProdiJenjang,
      categories,
    });
  } catch (error: any) {
    console.error("Evidence stats error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
