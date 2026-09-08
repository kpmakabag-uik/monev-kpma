import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { decrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const cycleParam = searchParams.get("cycle") || "";
    const prodiId = searchParams.get("prodiId") || "all";
    const facultyId = searchParams.get("facultyId") || "all";
    const instrumentId = searchParams.get("instrumentId") || "";
    const category = searchParams.get("category") || "";

    const userRole = session.user.role || "GKM";
    const userFacultyId = session.user.facultyId;
    const userProdiId = session.user.prodiId;

    const where: any = {};

    // 1. Text Search Filter
    if (q) {
      where.OR = [
        { fileName: { contains: q } },
        { instrumentId: { contains: q } },
        { prodi: { name: { contains: q } } },
        { questionText: { contains: q } },
        { evaluasiDiri: { contains: q } },
      ];
    }

    // 2. Specific Instrument & Category
    if (instrumentId && instrumentId !== "all") {
      where.instrumentId = instrumentId;
    }
    if (category && category !== "all") {
      where.category = category;
    }

    // 3. Role-Based Access Control
    if (userRole === "GKM") {
      if (!userProdiId) return NextResponse.json({ error: "Akun tidak terhubung ke Program Studi" }, { status: 403 });
      where.prodiId = userProdiId;
    } else if (userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") {
      if (!userFacultyId) return NextResponse.json({ error: "Akun tidak terhubung ke Fakultas" }, { status: 403 });
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

    // 4. Cycle Filter
    let filterTahun = "";
    let filterSemester = "";
    if (cycleParam && cycleParam !== "all") {
      const [tahun, sem] = cycleParam.split(":");
      if (tahun && sem) {
        where.tahun_akademik = tahun;
        where.semester = sem;
        filterTahun = tahun;
        filterSemester = sem;
      }
    } else {
      const activeCycle = await prisma.cycle.findFirst({
        where: { isActive: true },
        orderBy: { tahun_akademik: "desc" },
      });
      if (activeCycle) {
        filterTahun = activeCycle.tahun_akademik;
        filterSemester = activeCycle.semester;
      }
    }

    // 5. Query Uploaded Evidence Records (For Sheet 1)
    const items = await prisma.monevevidence.findMany({
      where,
      include: {
        prodi: {
          include: { faculty: true },
        },
      },
      orderBy: [
        { prodi: { name: "asc" } },
        { instrumentId: "asc" },
        { questionNo: "asc" },
        { fileName: "asc" },
      ],
    });

    // 6. Query Target Prodis & Master Instruments (For Sheet 2 Checklist)
    const prodiWhere: any = {};
    if (where.prodiId) {
      prodiWhere.id = where.prodiId;
    } else if (facultyId && facultyId !== "all") {
      prodiWhere.facultyId = facultyId;
    } else if (userRole === "GPM" || userRole === "PIMPINAN_FAKULTAS") {
      prodiWhere.facultyId = userFacultyId;
    }

    const targetProdis = await prisma.prodi.findMany({
      where: prodiWhere,
      include: { faculty: true },
      orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
    });

    const instWhere: any = {};
    if (instrumentId && instrumentId !== "all") {
      instWhere.id = instrumentId;
    }
    if (category && category !== "all") {
      instWhere.category = category;
    }

    const allMasterInstruments = await prisma.instrument.findMany({
      where: instWhere,
      orderBy: [{ category: "asc" }, { id: "asc" }],
    });

    // Answers from monevrecord for evaluasi diri in missing questions
    const monevRecords = await prisma.monevrecord.findMany({
      where: {
        prodiId: { in: targetProdis.map((p) => p.id) },
        ...(filterTahun && filterSemester ? { tahun_akademik: filterTahun, semester: filterSemester } : {}),
        ...(instrumentId && instrumentId !== "all" ? { instrumentId } : {}),
      },
      select: {
        prodiId: true,
        instrumentId: true,
        answers: true,
      },
    });

    const answersCache = new Map<string, Record<string, any>>();
    monevRecords.forEach((rec) => {
      try {
        const dec = rec.answers && rec.answers.includes(":") ? decrypt(rec.answers) : rec.answers;
        answersCache.set(`${rec.prodiId}:${rec.instrumentId}`, JSON.parse(dec || "{}"));
      } catch (_) {}
    });

    // Set of questions with uploaded evidence: "prodiId:instrumentId:questionId"
    const evidenceKeySet = new Set<string>();
    items.forEach((ev) => {
      evidenceKeySet.add(`${ev.prodiId}:${ev.instrumentId}:${ev.questionId}`);
    });

    // Compile missing questions for Sheet 2
    interface MissingQuestionRow {
      prodiName: string;
      jenjang: string;
      facultyName: string;
      tahun: string;
      semester: string;
      category: string;
      instrumentId: string;
      questionNo: string;
      questionText: string;
      evaluasiDiri: string;
    }

    let totalApplicableQuestions = 0;
    let questionsWithDocCount = 0;
    const missingRows: MissingQuestionRow[] = [];

    targetProdis.forEach((p) => {
      const pJenjang = (p.jenjang || "").toLowerCase();

      // Instruments applicable to this prodi
      const applicableInsts = allMasterInstruments.filter((inst) => {
        const instJen = (inst.jenjang_peruntukan || "").toLowerCase();
        return instJen === "semua" || instJen === pJenjang;
      });

      applicableInsts.forEach((inst) => {
        let qArr: Array<{ id: string; text: string }> = [];
        try {
          qArr = JSON.parse(inst.questions || "[]");
        } catch (_) {}

        const ansObj = answersCache.get(`${p.id}:${inst.id}`) || {};

        qArr.forEach((q) => {
          totalApplicableQuestions++;
          const key = `${p.id}:${inst.id}:${q.id}`;
          const hasDoc = evidenceKeySet.has(key);

          if (hasDoc) {
            questionsWithDocCount++;
          } else {
            const qNum = (q.id || "").replace(/[^0-9]/g, "") || "1";
            const qLetter = String.fromCharCode(65 + ((parseInt(qNum, 10) - 1) % 26));
            const evDiri = ansObj[q.id]?.evaluasiDiri || null;

            missingRows.push({
              prodiName: p.name,
              jenjang: p.jenjang,
              facultyName: p.faculty?.name || "-",
              tahun: filterTahun || "-",
              semester: filterSemester || "-",
              category: inst.category || "-",
              instrumentId: inst.id,
              questionNo: `1${qLetter}`,
              questionText: q.text || "-",
              evaluasiDiri: evDiri || "(Belum mengisi evaluasi diri)",
            });
          }
        });
      });
    });

    // 7. Create Excel Workbook with 2 Distinct Sheets
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistem MONEV KPMA UIKA Bogor";
    workbook.lastModifiedBy = session.user.name || "MONEV KPMA";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Context metadata text
    let scopeText = "Cakupan: Seluruh Universitas";
    if (where.prodiId) {
      const p = targetProdis.find((tp) => tp.id === where.prodiId) || items[0]?.prodi;
      if (p) scopeText = `Program Studi: [${p.jenjang}] ${p.name} - ${p.faculty?.name || ""}`;
    } else if (facultyId && facultyId !== "all") {
      const fName = targetProdis[0]?.faculty?.name || "Fakultas";
      scopeText = `Fakultas: ${fName}`;
    }

    const siklusText = cycleParam && cycleParam !== "all" ? `Siklus: ${cycleParam.replace(":", " ")}` : `Siklus: ${filterTahun} ${filterSemester}`;
    const tanggalExport = `Diunduh pada: ${new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    // Filter indicator text for Row 4 (matching Image 2: "Difilter berdasarkan : SOTK")
    const filterParts: string[] = [];
    if (q) filterParts.push(q.toUpperCase());
    if (instrumentId && instrumentId !== "all") filterParts.push(`TABEL ${instrumentId.toUpperCase()}`);
    if (category && category !== "all") filterParts.push(`KATEGORI ${category.toUpperCase()}`);

    const filterByText = filterParts.length > 0
      ? `Difilter berdasarkan : ${filterParts.join(" | ")}`
      : "Difilter berdasarkan : SEMUA DOKUMEN";

    // =========================================================================
    // SHEET 1: 📁 DOKUMEN TERUNGGAH (Inventaris Berkas & Tautan Google Drive)
    // =========================================================================
    const sheet1 = workbook.addWorksheet("Dokumen Terunggah", {
      properties: { tabColor: { argb: "FF107C41" } }, // Emerald Green Tab
      views: [{ showGridLines: true }],
      pageSetup: {
        paperSize: 14 as any, // F4 / Folio (8.5 x 13 in / 215 x 330 mm)
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        printTitlesRow: "5:5", // Header tabel berulang di setiap halaman cetak
        margins: {
          left: 0.4,
          right: 0.4,
          top: 0.5,
          bottom: 0.5,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    sheet1.headerFooter = {
      oddFooter: "&LHal &P dari &N",
      evenFooter: "&LHal &P dari &N",
    };

    sheet1.columns = [
      { key: "no", width: 5 },
      { key: "prodi", width: 22 },
      { key: "jenjang", width: 8 },
      { key: "fakultas", width: 20 },
      { key: "tahun", width: 12 },
      { key: "semester", width: 10 },
      { key: "kategori", width: 18 },
      { key: "kode", width: 10 },
      { key: "poin", width: 8 },
      { key: "pertanyaan", width: 38 },
      { key: "evaluasiDiri", width: 32 },
      { key: "fileName", width: 28 },
      { key: "link", width: 22 },
    ];

    sheet1.mergeCells("A1:M1");
    const s1h1 = sheet1.getCell("A1");
    s1h1.value = "KANTOR PENJAMINAN MUTU AKADEMIK (KPMA) - UNIVERSITAS IBN KHALDUN BOGOR";
    s1h1.font = { name: "Calibri", bold: true, size: 14, color: { argb: "FF1E3A8A" } };
    s1h1.alignment = { horizontal: "center", vertical: "middle" };

    sheet1.mergeCells("A2:M2");
    const s1h2 = sheet1.getCell("A2");
    s1h2.value = "INVENTARIS DOKUMEN BUKTI TERUNGGAH MONEV MUTU AKADEMIK (IAPS 5.1)";
    s1h2.font = { name: "Calibri", bold: true, size: 12, color: { argb: "FF107C41" } };
    s1h2.alignment = { horizontal: "center", vertical: "middle" };

    sheet1.mergeCells("A3:M3");
    const s1h3 = sheet1.getCell("A3");
    s1h3.value = `${scopeText} | ${siklusText} | Total Berkas: ${items.length} Dokumen | ${tanggalExport}`;
    s1h3.font = { name: "Calibri", italic: true, size: 10, color: { argb: "FF4B5563" } };
    s1h3.alignment = { horizontal: "center", vertical: "middle" };

    // Baris 4: Teks Indikator Filter sesuai Gambar 2 (Difilter berdasarkan : ...)
    const s1FilterRow = sheet1.addRow([filterByText]);
    s1FilterRow.height = 20;
    const s1h4 = s1FilterRow.getCell(1);
    s1h4.font = { name: "Calibri", bold: true, size: 11, color: { argb: "FF111827" } };
    s1h4.alignment = { horizontal: "left", vertical: "middle" };

    const s1HeaderRow = sheet1.addRow([
      "NO",
      "PROGRAM STUDI",
      "JENJANG",
      "FAKULTAS",
      "TAHUN AKADEMIK",
      "SEMESTER",
      "KATEGORI",
      "KODE TABEL",
      "POIN",
      "TEKS PERTANYAAN INSTRUMEN",
      "CATATAN / TEMUAN EVALUASI DIRI",
      "NAMA DOKUMEN BUKTI",
      "LINK TAUTAN (GOOGLE DRIVE)",
    ]);

    s1HeaderRow.height = 28;
    s1HeaderRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
      cell.font = { name: "Calibri", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "medium", color: { argb: "FF1E3A8A" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } },
      };
    });

    items.forEach((item, index) => {
      const row = sheet1.addRow([
        index + 1,
        item.prodi.name,
        item.prodi.jenjang,
        item.prodi.faculty.name,
        item.tahun_akademik,
        item.semester,
        item.category || "-",
        item.instrumentId,
        item.questionNo || "-",
        item.questionText || "-",
        item.evaluasiDiri || "-",
        item.fileName,
        item.url ? { text: "Buka Google Drive ↗", hyperlink: item.url } : "-",
      ]);

      // Catatan: Tidak menetapkan row.height agar tinggi baris otomatis (auto-fit) sesuai panjang teks konten
      const isEven = index % 2 === 0;

      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Calibri", size: 10 };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        if (isEven) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        }

        if (colNumber === 1 || colNumber === 3 || colNumber === 8 || colNumber === 9) {
          cell.alignment = { horizontal: "center", vertical: "top" };
        } else if (colNumber === 5 || colNumber === 6) {
          cell.alignment = { horizontal: "center", vertical: "top" };
        } else if (colNumber === 10 || colNumber === 11 || colNumber === 12 || colNumber === 2 || colNumber === 4 || colNumber === 7) {
          cell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        } else if (colNumber === 13) {
          cell.alignment = { horizontal: "center", vertical: "top", wrapText: true };
          if (item.url) {
            cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF2563EB" }, underline: true };
          }
        } else {
          cell.alignment = { horizontal: "left", vertical: "top" };
        }
      });
    });

    // =========================================================================
    // SHEET 2: ⚠️ BELUM ADA DOKUMEN (Checklist Butir Belum Memiliki Dokumen Bukti)
    // =========================================================================
    const sheet2 = workbook.addWorksheet("Belum Ada Dokumen", {
      properties: { tabColor: { argb: "FFD97706" } }, // Amber Tab
      views: [{ showGridLines: true }],
      pageSetup: {
        paperSize: 14 as any, // F4 / Folio (8.5 x 13 in / 215 x 330 mm)
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        printTitlesRow: "7:7", // Header tabel baris 7 berulang di setiap halaman cetak
        margins: {
          left: 0.4,
          right: 0.4,
          top: 0.5,
          bottom: 0.5,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    sheet2.headerFooter = {
      oddFooter: "&LHal &P dari &N",
      evenFooter: "&LHal &P dari &N",
    };

    sheet2.columns = [
      { key: "no", width: 5 },
      { key: "prodi", width: 22 },
      { key: "jenjang", width: 8 },
      { key: "fakultas", width: 20 },
      { key: "tahun", width: 12 },
      { key: "semester", width: 10 },
      { key: "kategori", width: 18 },
      { key: "kode", width: 10 },
      { key: "poin", width: 8 },
      { key: "pertanyaan", width: 40 },
      { key: "evaluasiDiri", width: 35 },
      { key: "status", width: 20 },
    ];

    sheet2.mergeCells("A1:L1");
    const s2h1 = sheet2.getCell("A1");
    s2h1.value = "KANTOR PENJAMINAN MUTU AKADEMIK (KPMA) - UNIVERSITAS IBN KHALDUN BOGOR";
    s2h1.font = { name: "Calibri", bold: true, size: 14, color: { argb: "FF1E3A8A" } };
    s2h1.alignment = { horizontal: "center", vertical: "middle" };

    sheet2.mergeCells("A2:L2");
    const s2h2 = sheet2.getCell("A2");
    s2h2.value = "CHECKLIST BUTIR PERTANYAAN BELUM ADA DOKUMEN BUKTI (IAPS 5.1)";
    s2h2.font = { name: "Calibri", bold: true, size: 12, color: { argb: "FFD97706" } };
    s2h2.alignment = { horizontal: "center", vertical: "middle" };

    sheet2.mergeCells("A3:L3");
    const s2h3 = sheet2.getCell("A3");
    s2h3.value = `${scopeText} | ${siklusText} | ${tanggalExport}`;
    s2h3.font = { name: "Calibri", italic: true, size: 10, color: { argb: "FF4B5563" } };
    s2h3.alignment = { horizontal: "center", vertical: "middle" };

    // Baris 4: Teks Indikator Filter sesuai Gambar 2 (Difilter berdasarkan : ...)
    const s2Row4 = sheet2.getRow(4);
    s2Row4.getCell(1).value = filterByText;
    s2Row4.getCell(1).font = { name: "Calibri", bold: true, size: 11, color: { argb: "FF111827" } };
    s2Row4.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    s2Row4.height = 20;

    // Filter daftar butir yang belum ada bukti jika ada kata kunci pencarian (q)
    const displayMissingRows = q
      ? missingRows.filter((row) => {
          const term = q.toLowerCase();
          return (
            row.prodiName.toLowerCase().includes(term) ||
            row.instrumentId.toLowerCase().includes(term) ||
            row.questionText.toLowerCase().includes(term) ||
            row.evaluasiDiri.toLowerCase().includes(term) ||
            row.category.toLowerCase().includes(term)
          );
        })
      : missingRows;

    // Summary KPI Box (Row 5)
    sheet2.mergeCells("A5:C5");
    const kpi1 = sheet2.getCell("A5");
    kpi1.value = `Total Butir Instrumen: ${totalApplicableQuestions} Butir`;
    kpi1.font = { name: "Calibri", bold: true, size: 11, color: { argb: "FF1F2937" } };
    kpi1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
    kpi1.alignment = { horizontal: "center", vertical: "middle" };

    sheet2.mergeCells("D5:F5");
    const kpi2 = sheet2.getCell("D5");
    kpi2.value = `Sudah Ada Bukti: ${questionsWithDocCount} Butir (${items.length} Berkas di Sheet 1)`;
    kpi2.font = { name: "Calibri", bold: true, size: 11, color: { argb: "FF047857" } };
    kpi2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } };
    kpi2.alignment = { horizontal: "center", vertical: "middle" };

    sheet2.mergeCells("G5:I5");
    const kpi3 = sheet2.getCell("G5");
    kpi3.value = `Belum Ada Bukti: ${displayMissingRows.length} Butir`;
    kpi3.font = { name: "Calibri", bold: true, size: 11, color: { argb: "FFB91C1C" } };
    kpi3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } };
    kpi3.alignment = { horizontal: "center", vertical: "middle" };

    sheet2.mergeCells("J5:L5");
    const kpi4 = sheet2.getCell("J5");
    const percent = totalApplicableQuestions > 0 ? ((questionsWithDocCount / totalApplicableQuestions) * 100).toFixed(1) : "0";
    kpi4.value = `Kelengkapan Bukti: ${percent}%`;
    kpi4.font = { name: "Calibri", bold: true, size: 11, color: { argb: "FF1E40AF" } };
    kpi4.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
    kpi4.alignment = { horizontal: "center", vertical: "middle" };

    sheet2.addRow([]); // Blank row 6

    // Table Header Sheet 2 on Row 7
    const s2HeaderRow = sheet2.addRow([
      "NO",
      "PROGRAM STUDI",
      "JENJANG",
      "FAKULTAS",
      "TAHUN AKADEMIK",
      "SEMESTER",
      "KATEGORI",
      "KODE TABEL",
      "POIN",
      "TEKS PERTANYAAN INSTRUMEN",
      "CATATAN / TEMUAN EVALUASI DIRI",
      "STATUS DOKUMEN BUKTI",
    ]);

    s2HeaderRow.height = 28;
    s2HeaderRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB45309" } }; // Warm Amber header
      cell.font = { name: "Calibri", bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "medium", color: { argb: "FF92400E" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } },
      };
    });

    if (displayMissingRows.length > 0) {
      displayMissingRows.forEach((rowItem, index) => {
        const row = sheet2.addRow([
          index + 1,
          rowItem.prodiName,
          rowItem.jenjang,
          rowItem.facultyName,
          rowItem.tahun,
          rowItem.semester,
          rowItem.category,
          rowItem.instrumentId,
          rowItem.questionNo,
          rowItem.questionText,
          rowItem.evaluasiDiri,
          "❌ Belum Diunggah",
        ]);

        // Catatan: Tidak menetapkan row.height agar tinggi baris otomatis (auto-fit) sesuai panjang teks konten
        const isEven = index % 2 === 0;

        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Calibri", size: 10 };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE2E8F0" } },
            left: { style: "thin", color: { argb: "FFE2E8F0" } },
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            right: { style: "thin", color: { argb: "FFE2E8F0" } },
          };

          if (isEven) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
          }

          if (colNumber === 1 || colNumber === 3 || colNumber === 8 || colNumber === 9) {
            cell.alignment = { horizontal: "center", vertical: "top" };
          } else if (colNumber === 5 || colNumber === 6) {
            cell.alignment = { horizontal: "center", vertical: "top" };
          } else if (colNumber === 10 || colNumber === 11 || colNumber === 2 || colNumber === 4 || colNumber === 7) {
            cell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
          } else if (colNumber === 12) {
            cell.alignment = { horizontal: "center", vertical: "top" };
            cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFB91C1C" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } };
          } else {
            cell.alignment = { horizontal: "left", vertical: "top" };
          }
        });
      });
    } else {
      // Empty state for Sheet 2: All evidence complete!
      const congratsRow = sheet2.addRow([
        "🎉",
        "SELAMAT! SELURUH BUTIR PERTANYAAN TELAH MEMILIKI DOKUMEN BUKTI TERUNGGAH.",
      ]);
      sheet2.mergeCells(`B${congratsRow.number}:L${congratsRow.number}`);
      congratsRow.height = 36;
      congratsRow.eachCell((cell) => {
        cell.font = { name: "Calibri", bold: true, size: 12, color: { argb: "FF047857" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    }

    // 8. Output Excel Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    let cleanScope = "Semua";
    if (where.prodiId && targetProdis[0]) {
      cleanScope = `${targetProdis[0].jenjang}_${targetProdis[0].name}`.replace(/[\s\/\\]+/g, "_");
    } else if (facultyId && facultyId !== "all" && targetProdis[0]?.faculty) {
      cleanScope = targetProdis[0].faculty.name.replace(/[\s\/\\]+/g, "_");
    }
    const cleanCycle = cycleParam && cycleParam !== "all" ? cycleParam.replace(/[\/:]+/g, "_") : "Semua_Siklus";
    const filename = `Rekap_Dokumen_Bukti_MONEV_${cleanScope}_${cleanCycle}.xlsx`;

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export evidence error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengekspor data ke Excel" }, { status: 500 });
  }
}
