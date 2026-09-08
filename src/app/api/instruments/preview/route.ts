import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") {
      return NextResponse.json({ error: "Akses ditolak. Hanya KPMA yang dapat melihat pratinjau instrumen." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File Excel tidak ditemukan." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet("Template Instrumen") || workbook.worksheets[0];

    if (!worksheet) {
      return NextResponse.json({ error: "Lembar kerja (worksheet) tidak ditemukan di dalam file Excel." }, { status: 400 });
    }

    // Deteksi baris header
    let startRow = 4;
    for (let r = 1; r <= 10; r++) {
      const row = worksheet.getRow(r);
      const cell1Val = String(row.getCell(1).value || "").toLowerCase();
      if (cell1Val.includes("kode")) {
        startRow = r + 1;
        break;
      }
    }

    interface InstrumentGroup {
      id: string;
      jenjang_peruntukan: string;
      category: string;
      name: string;
      questions: { id: string; text: string; bobot: number }[];
    }

    const instrumentsMap = new Map<string, InstrumentGroup>();
    let totalQuestionsCount = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < startRow) return;

      const getRawVal = (col: number) => {
        const val = row.getCell(col).value;
        if (!val) return "";
        if (typeof val === "object" && "text" in val) return String((val as any).text || "").trim();
        if (typeof val === "object" && "result" in val) return String((val as any).result || "").trim();
        return String(val).trim();
      };

      const kode = getRawVal(1);
      const jenjang = getRawVal(2) || "Semua";
      const kategori = getRawVal(3) || "Umum";
      const nama = getRawVal(4) || kode;
      const pertanyaan = getRawVal(5);

      if (!kode) return;

      if (!instrumentsMap.has(kode)) {
        instrumentsMap.set(kode, {
          id: kode,
          jenjang_peruntukan: jenjang,
          category: kategori,
          name: nama,
          questions: [],
        });
      }

      const inst = instrumentsMap.get(kode)!;
      if (nama && (!inst.name || inst.name === inst.id)) inst.name = nama;
      if (kategori && inst.category === "Umum") inst.category = kategori;
      if (jenjang && inst.jenjang_peruntukan === "Semua") inst.jenjang_peruntukan = jenjang;

      if (pertanyaan) {
        inst.questions.push({
          id: `q${inst.questions.length + 1}`,
          text: pertanyaan,
          bobot: 0,
        });
        totalQuestionsCount++;
      }
    });

    if (instrumentsMap.size === 0) {
      return NextResponse.json({
        error: "Tidak ada data instrumen yang dapat dibaca dari file Excel.",
      }, { status: 400 });
    }

    // Pastikan instrumen memiliki minimal 1 pertanyaan
    for (const inst of instrumentsMap.values()) {
      if (inst.questions.length === 0) {
        inst.questions.push({
          id: "q1",
          text: "Silahkan lengkapi bukti dan evaluasi dokumen.",
          bobot: 0,
        });
        totalQuestionsCount++;
      }
    }

    const allParsed = Array.from(instrumentsMap.values());
    const codes = allParsed.map((i) => i.id);

    // Cek keberadaan kode di database
    const existingInstruments = await prisma.instrument.findMany({
      where: { id: { in: codes } },
    });

    const existingMap = new Map(existingInstruments.map((item) => [item.id, item]));

    const newItems: Array<InstrumentGroup> = [];
    const duplicateItems: Array<{
      id: string;
      existing: {
        id: string;
        name: string;
        category: string;
        jenjang_peruntukan: string;
        questionCount: number;
      };
      incoming: InstrumentGroup;
      action: "update" | "skip";
    }> = [];

    allParsed.forEach((item) => {
      const exist = existingMap.get(item.id);
      if (exist) {
        let existQuestionCount = 0;
        try {
          const parsedQ = JSON.parse(exist.questions || "[]");
          if (Array.isArray(parsedQ)) existQuestionCount = parsedQ.length;
        } catch (_) {}

        duplicateItems.push({
          id: item.id,
          existing: {
            id: exist.id,
            name: exist.name,
            category: exist.category,
            jenjang_peruntukan: exist.jenjang_peruntukan,
            questionCount: existQuestionCount,
          },
          incoming: item,
          action: "update", // Default action
        });
      } else {
        newItems.push(item);
      }
    });

    return NextResponse.json({
      success: true,
      totalParsed: allParsed.length,
      totalQuestions: totalQuestionsCount,
      newItems,
      duplicateItems,
    });
  } catch (error: any) {
    console.error("Error previewing instruments:", error);
    return NextResponse.json({
      error: `Gagal membaca file Excel: ${error.message || "Terjadi kesalahan server"}`
    }, { status: 500 });
  }
}
