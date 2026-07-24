"use client";

import { useState } from "react";

interface ProdiProgress {
  id: string;
  name: string;
  jenjang: string;
  gkmProgress: number;
  gpmProgress: number;
  kbProgress: number;
  kpmaProgress: number;
  isCompleted: boolean;
}

interface FacultyProgress {
  id: string;
  name: string;
  prodis: ProdiProgress[];
}

export default function ExportButtons({ data, cycle }: { data: FacultyProgress[], cycle: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Monev");

      // Set column widths
      worksheet.columns = [
        { width: 30 }, // Fakultas
        { width: 50 }, // Prodi
        { width: 10 }, // Jenjang
        { width: 10 }, // GKM
        { width: 10 }, // GPM
        { width: 10 }, // Bukti
        { width: 10 }, // KPMA
        { width: 20 }, // Status
      ];

      // 1. Institutional Header (Text only for now, matching layout)
      worksheet.mergeCells("B1:H1");
      const head1 = worksheet.getCell("B1");
      head1.value = "KANTOR PENJAMINAN MUTU DAN AUDIT INTERNAL";
      head1.font = { name: 'Arial', bold: true, size: 14 };

      worksheet.mergeCells("B2:H2");
      const head2 = worksheet.getCell("B2");
      head2.value = "UNIVERSITAS IBN KHALDUN BOGOR";
      head2.font = { name: 'Arial', bold: true, size: 12 };

      // Double line separator (Visual approximation)
      worksheet.getRow(3).border = { bottom: { style: 'double' } };

      // 2. Report Title
      worksheet.mergeCells("A5:H5");
      const titleCell = worksheet.getCell("A5");
      titleCell.value = "LAPORAN MONITORING DAN EVALUASI (SiMONEV)";
      titleCell.font = { name: 'Arial', bold: true, size: 14 };

      // 3. Metadata
      worksheet.getCell("A6").value = `Siklus: ${cycle}`;
      worksheet.getCell("A6").font = { name: 'Arial', bold: true, size: 10 };
      worksheet.getCell("A7").value = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
      worksheet.getCell("A7").font = { name: 'Arial', bold: true, size: 10 };

      // 4. Table Header
      const headerRow = worksheet.getRow(9);
      headerRow.values = ["Fakultas", "Program Studi", "Jenjang", "GKM (%)", "GPM (%)", "Bukti (%)", "KPMA (%)", "Status"];
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E4B85' } // institusi color
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // 5. Table Body
      data.forEach(f => {
        f.prodis.forEach(p => {
          const row = worksheet.addRow([
            f.name,
            p.name,
            p.jenjang,
            p.gkmProgress,
            p.gpmProgress,
            p.kbProgress,
            p.kpmaProgress,
            p.isCompleted ? "SELESAI" : "BELUM SELESAI"
          ]);
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.alignment = { vertical: 'middle' };
          });
          // Center progress columns
          row.getCell(3).alignment = { horizontal: 'center' };
          row.getCell(4).alignment = { horizontal: 'center' };
          row.getCell(5).alignment = { horizontal: 'center' };
          row.getCell(6).alignment = { horizontal: 'center' };
          row.getCell(7).alignment = { horizontal: 'center' };
        });
      });

      // Export file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Laporan_Monev_${cycle.replace(/[\/\s]/g, '_')}.xlsx`;
      link.click();
    } catch (_error) {
      console.error("Export Excel failed", _error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      
      const doc = new jsPDF();
      
      // 1. Kop Surat (Letterhead)
      const logoUrl = "/logo-kpma.png";
      try {
        // Try to add logo
        doc.addImage(logoUrl, 'PNG', 14, 10, 20, 20);
      } catch (_e) {
        console.warn("Could not load logo for PDF", _e);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("KANTOR PENJAMINAN MUTU DAN AUDIT INTERNAL", 38, 18);
      doc.setFontSize(12);
      doc.text("UNIVERSITAS IBN KHALDUN BOGOR", 38, 25);
      
      // Line separator
      doc.setLineWidth(0.5);
      doc.line(14, 32, 196, 32);
      doc.setLineWidth(0.1);
      doc.line(14, 33, 196, 33);

      // 2. Report Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("LAPORAN MONITORING DAN EVALUASI (SiMONEV)", 14, 45);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Siklus: ${cycle}`, 14, 52);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 57);

      const tableData: (string | number)[][] = [];
      data.forEach(f => {
        f.prodis.forEach(p => {
          tableData.push([
            f.name,
            p.name,
            p.jenjang,
            `${p.gkmProgress}%`,
            `${p.gpmProgress}%`,
            `${p.kbProgress}%`,
            `${p.kpmaProgress}%`,
            p.isCompleted ? "Selesai" : "Belum"
          ]);
        });
      });

      autoTable(doc, {
        startY: 65,
        head: [['Fakultas', 'Program Studi', 'Jnj', 'GKM', 'GPM', 'Bukti', 'KPMA', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 75, 133], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 50 },
          7: { fontStyle: 'bold' }
        },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });

      doc.save(`Laporan_Monev_${cycle.replace(/[\/\s]/g, '_')}.pdf`);
    } catch (_error) {
      console.error("Export PDF failed", _error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToExcel}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Excel
      </button>
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
        PDF
      </button>
    </div>
  );
}

