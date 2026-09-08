import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 401 });
    }

    const levels = await prisma.level.findMany({ orderBy: { name: "asc" } });
    const levelNames = levels.map((l) => l.name);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MONEV KPMA UIKA";
    workbook.created = new Date();

    // ==========================================
    // Sheet 1: Template Instrumen
    // ==========================================
    const ws = workbook.addWorksheet("Template Instrumen", {
      views: [{ showGridLines: true }],
    });

    ws.columns = [
      { key: "kode", width: 18 },
      { key: "jenjang", width: 16 },
      { key: "kategori", width: 25 },
      { key: "nama", width: 40 },
      { key: "pertanyaan", width: 65 },
    ];

    // Header Title
    ws.mergeCells("A1:E1");
    const titleCell = ws.getCell("A1");
    titleCell.value = "TEMPLATE IMPORT INSTRUMEN MONEV KPMA";
    titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(1).height = 32;

    // Petunjuk Singkat
    ws.mergeCells("A2:E2");
    const noteCell = ws.getCell("A2");
    noteCell.value = "Petunjuk: 1 baris mewakili 1 pertanyaan/sub-indikator. Jika 1 instrumen memiliki beberapa pertanyaan, gunakan Kode Instrumen yang sama pada baris-baris berikutnya.";
    noteCell.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF374151" } };
    noteCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
    noteCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    ws.getRow(2).height = 24;

    // Header Kolom (Row 3)
    const headers = [
      { col: 1, text: "Kode Instrumen *" },
      { col: 2, text: "Jenjang *" },
      { col: 3, text: "Kategori *" },
      { col: 4, text: "Nama / Judul Instrumen *" },
      { col: 5, text: "Teks Pertanyaan / Sub-Indikator *" },
    ];

    const headerRow = ws.getRow(3);
    headerRow.height = 28;

    headers.forEach((h) => {
      const cell = headerRow.getCell(h.col);
      cell.value = h.text;
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF15803D" } }; // Green 700
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "medium", color: { argb: "FF111827" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };
    });

    // Contoh Data
    const sampleRows = [
      ["AK-0030", "S1", "Akuntabilitas", "Suasana Akademik Program Studi", "Apakah terdapat dokumen formal kebijakan suasana akademik yang mencakup: otonomi keilmuan, kebebasan akademik, dan kebebasan mimbar akademik?"],
      ["AK-0030", "S1", "Akuntabilitas", "Suasana Akademik Program Studi", "Apakah kegiatan tridharma di perguruan tinggi menjunjung tinggi integritas dan etika akademik?"],
      ["AK-0030", "S1", "Akuntabilitas", "Suasana Akademik Program Studi", "Apakah suasana akademik yang kondusif terwujud secara konsisten setiap semester?"],
      ["BM-0010", "Semua", "Budaya Mutu", "Sosialisasi dan Pemahaman Visi Misi", "Apakah visi, misi, tujuan, dan sasaran disosialisasikan secara terstruktur kepada seluruh sivitas akademika?"],
      ["BM-0010", "Semua", "Budaya Mutu", "Sosialisasi dan Pemahaman Visi Misi", "Apakah tingkat pemahaman sivitas akademika terhadap visi misi mencapai minimal 85% berdasarkan hasil survei?"],
      ["TP-0005", "S2", "Tata Pamong", "Struktur Organisasi dan Tata Kerja", "Apakah struktur tata pamong dilengkapi dengan uraian tugas pokok dan fungsi (tupoksi) yang jelas untuk setiap posisi?"],
    ];

    sampleRows.forEach((row, idx) => {
      const r = ws.addRow(row);
      r.height = 24;
      r.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = {
          vertical: "middle",
          horizontal: colNumber <= 2 ? "center" : "left",
          wrapText: colNumber >= 4,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
      });
    });

    // ==========================================
    // Sheet 2: Petunjuk Pengisian & Jenjang
    // ==========================================
    const wsInfo = workbook.addWorksheet("Panduan & Jenjang", {
      views: [{ showGridLines: true }],
    });

    wsInfo.columns = [{ width: 28 }, { width: 60 }];

    const infoHead = wsInfo.getRow(1);
    infoHead.values = ["PANDUAN PENGISIAN TEMPLATE EXCEL INSTRUMEN MONEV", ""];
    wsInfo.mergeCells("A1:B1");
    wsInfo.getCell("A1").font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
    wsInfo.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    infoHead.height = 26;

    const infoRows = [
      ["Kode Instrumen", "Wajib diisi unik. Contoh: AK-0030, Tabel 1, TB-01. Jangan gunakan karakter terlarang."],
      ["Pengelompokan Sub-Pertanyaan", "Jika 1 instrumen memiliki 3 pertanyaan, buat 3 baris dengan Kode Instrumen yang sama persis."],
      ["Pilihan Jenjang yang Terdaftar", `Pilih salah satu: Semua, ${levelNames.join(", ")}`],
      ["Kategori", "Contoh: Akuntabilitas, Budaya Mutu, Tata Pamong, Pendidikan, Kemahasiswaan, Penelitian, Pengabdian."],
      ["Nama / Judul Butir", "Judul utama butir instrumen evaluasi."],
      ["Pertanyaan / Sub-Indikator", "Teks pernyataan atau pertanyaan butir yang harus dijawab dan dilampiri bukti dukung."],
      ["Metode Simpan (Upsert)", "Jika Kode Instrumen sudah ada di sistem, data akan diperbarui (update). Jika belum ada, akan otomatis dibuat baru."],
    ];

    infoRows.forEach((ir) => {
      const r = wsInfo.addRow(ir);
      r.height = 22;
      r.getCell(1).font = { name: "Arial", size: 10, bold: true };
      r.getCell(2).font = { name: "Arial", size: 10 };
      r.getCell(1).alignment = { vertical: "middle" };
      r.getCell(2).alignment = { vertical: "middle", wrapText: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="Template_Instrumen_Monev_KPMA.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating template:", error);
    return NextResponse.json({ error: "Gagal membuat template Excel" }, { status: 500 });
  }
}
