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
    const q = searchParams.get("q")?.trim() || "";
    const cycleParam = searchParams.get("cycle") || ""; // Format: "tahunAkademik:semester" or "all"
    const prodiId = searchParams.get("prodiId") || "all";
    const facultyId = searchParams.get("facultyId") || "all";
    const instrumentId = searchParams.get("instrumentId") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(500, Math.max(10, parseInt(searchParams.get("limit") || "25", 10)));

    const userRole = session.user.role || "GKM";
    const userFacultyId = session.user.facultyId;
    const userProdiId = session.user.prodiId;

    const where: any = {};

    // Specific Instrument & Category filters
    if (instrumentId && instrumentId !== "all") {
      where.instrumentId = instrumentId;
    }
    if (category && category !== "all") {
      where.category = category;
    }

    // 1. Text Search Filter (Cari Nama Dokumen, Kode Instrumen, Nama Prodi, Pertanyaan, atau Temuan Evaluasi Diri)
    if (q) {
      where.OR = [
        { fileName: { contains: q } },
        { instrumentId: { contains: q } },
        { prodi: { name: { contains: q } } },
        { questionText: { contains: q } },
        { evaluasiDiri: { contains: q } },
      ];
    }

    // 2. Role-Based Access Control
    if (userRole === "GKM") {
      if (!userProdiId) return NextResponse.json({ total: 0, items: [], page, totalPages: 0 });
      where.prodiId = userProdiId;
    } else if (userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") {
      if (!userFacultyId) return NextResponse.json({ total: 0, items: [], page, totalPages: 0 });
      if (prodiId && prodiId !== "all") {
        where.prodiId = prodiId;
        where.prodi = { facultyId: userFacultyId };
      } else {
        where.prodi = { facultyId: userFacultyId };
      }
    } else {
      // KPMA & PIMPINAN_UNIVERSITAS
      if (prodiId && prodiId !== "all") {
        where.prodiId = prodiId;
      } else if (facultyId && facultyId !== "all") {
        where.prodi = { facultyId };
      }
    }

    // 3. Cycle Filter
    if (cycleParam && cycleParam !== "all") {
      const [tahun, sem] = cycleParam.split(":");
      if (tahun && sem) {
        where.tahun_akademik = tahun;
        where.semester = sem;
      }
    }

    const [total, items] = await Promise.all([
      prisma.monevevidence.count({ where }),
      prisma.monevevidence.findMany({
        where,
        include: {
          prodi: {
            include: { faculty: true },
          },
        },
        orderBy: [
          { tahun_akademik: "desc" },
          { semester: "desc" },
          { instrumentId: "asc" },
          { questionId: "asc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: items.map((it) => ({
        id: it.id,
        prodiId: it.prodiId,
        prodiName: it.prodi.name,
        jenjang: it.prodi.jenjang,
        facultyName: it.prodi.faculty.name,
        instrumentId: it.instrumentId,
        questionId: it.questionId,
        questionNo: it.questionNo,
        questionText: it.questionText,
        evaluasiDiri: it.evaluasiDiri,
        tahunAkademik: it.tahun_akademik,
        semester: it.semester,
        url: it.url,
        fileName: it.fileName,
        updatedAt: it.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("Evidence search error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
