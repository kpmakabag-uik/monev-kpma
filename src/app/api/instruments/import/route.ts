import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";

interface InstrumentPayloadItem {
  id: string;
  name: string;
  category: string;
  jenjang_peruntukan: string;
  questions: Array<{ id: string; text: string; bobot: number }>;
  action?: "create" | "update" | "skip";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") {
      return NextResponse.json({ error: "Akses ditolak. Hanya KPMA yang dapat mengimpor instrumen." }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. JIKA REQUEST MENGGUNAKAN JSON (Hasil dari konfirmasi Preview User)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const items: InstrumentPayloadItem[] = body.instruments || [];

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Daftar instrumen untuk diimpor tidak ditemukan." }, { status: 400 });
      }

      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      let totalQuestionsCount = 0;

      for (const item of items) {
        if (item.action === "skip") {
          skippedCount++;
          continue;
        }

        const questionsJson = JSON.stringify(item.questions || []);
        totalQuestionsCount += (item.questions || []).length;

        if (item.action === "create") {
          await prisma.instrument.create({
            data: {
              id: item.id,
              name: item.name,
              category: item.category,
              kriteria: "-",
              indikator: "-",
              jenjang_peruntukan: item.jenjang_peruntukan,
              questions: questionsJson,
            },
          });
          createdCount++;
        } else if (item.action === "update") {
          await prisma.instrument.update({
            where: { id: item.id },
            data: {
              name: item.name,
              category: item.category,
              jenjang_peruntukan: item.jenjang_peruntukan,
              questions: questionsJson,
            },
          });
          updatedCount++;
        } else {
          // Default: upsert jika action tidak spesifik
          const existing = await prisma.instrument.findUnique({ where: { id: item.id } });
          if (existing) {
            await prisma.instrument.update({
              where: { id: item.id },
              data: {
                name: item.name,
                category: item.category,
                jenjang_peruntukan: item.jenjang_peruntukan,
                questions: questionsJson,
              },
            });
            updatedCount++;
          } else {
            await prisma.instrument.create({
              data: {
                id: item.id,
                name: item.name,
                category: item.category,
                kriteria: "-",
                indikator: "-",
                jenjang_peruntukan: item.jenjang_peruntukan,
                questions: questionsJson,
              },
            });
            createdCount++;
          }
        }
      }

      revalidatePath("/master/instruments");
      revalidatePath("/monev");

      return NextResponse.json({
        success: true,
        message: `Berhasil mengimpor: ${createdCount} data baru ditambahkan, ${updatedCount} data diperbarui, dan ${skippedCount} data dilewati.`,
        createdCount,
        updatedCount,
        skippedCount,
        totalQuestions: totalQuestionsCount,
      });
    }

    // 2. JIKA REQUEST MENGGUNAKAN FORMDATA (Direct File Upload)
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

    let startRow = 4;
    for (let r = 1; r <= 10; r++) {
      const row = worksheet.getRow(r);
      const cell1Val = String(row.getCell(1).value || "").toLowerCase();
      if (cell1Val.includes("kode")) {
        startRow = r + 1;
        break;
      }
    }

    const instrumentsMap = new Map<string, InstrumentPayloadItem>();
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
        error: "Tidak ada data instrumen yang dapat dibaca dari file." 
      }, { status: 400 });
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const inst of instrumentsMap.values()) {
      if (inst.questions.length === 0) {
        inst.questions.push({
          id: "q1",
          text: "Silahkan lengkapi bukti dan evaluasi dokumen.",
          bobot: 0,
        });
        totalQuestionsCount++;
      }

      const existing = await prisma.instrument.findUnique({
        where: { id: inst.id },
      });

      if (existing) {
        await prisma.instrument.update({
          where: { id: inst.id },
          data: {
            name: inst.name,
            category: inst.category,
            jenjang_peruntukan: inst.jenjang_peruntukan,
            questions: JSON.stringify(inst.questions),
          },
        });
        updatedCount++;
      } else {
        await prisma.instrument.create({
          data: {
            id: inst.id,
            name: inst.name,
            category: inst.category,
            kriteria: "-",
            indikator: "-",
            jenjang_peruntukan: inst.jenjang_peruntukan,
            questions: JSON.stringify(inst.questions),
          },
        });
        createdCount++;
      }
    }

    revalidatePath("/master/instruments");
    revalidatePath("/monev");

    return NextResponse.json({
      success: true,
      message: `Berhasil memproses ${instrumentsMap.size} instrumen (${createdCount} baru, ${updatedCount} diperbarui) dengan total ${totalQuestionsCount} butir pertanyaan.`,
      createdCount,
      updatedCount,
      totalQuestions: totalQuestionsCount,
    });
  } catch (error: any) {
    console.error("Error importing instruments:", error);
    return NextResponse.json({
      error: `Gagal memproses impor instrumen: ${error.message || "Terjadi kesalahan server"}`
    }, { status: 500 });
  }
}
