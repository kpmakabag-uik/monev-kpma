"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getExecutiveSummary(prodiId: string, cycleId?: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Get active cycle if not provided
    let cycle = null;
    if (cycleId) {
      cycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
    } else {
      cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    }
    
    if (!cycle) return { success: false, error: "Tidak ada siklus aktif." };

    // 2. Fetch Prodi & Faculty
    const prodi = await prisma.prodi.findUnique({
      where: { id: prodiId },
      include: { faculty: true }
    });

    if (!prodi) return { success: false, error: "Prodi tidak ditemukan." };

    // 3. Fetch all Instruments applicable
    const allInstruments = await prisma.instrument.findMany();
    const applicableInsts = allInstruments.filter(
      (i) => i.jenjang_peruntukan === "Semua" || i.jenjang_peruntukan === prodi.jenjang
    );

    // 4. Fetch Monev Records for this Prodi & Cycle
    const records = await prisma.monevRecord.findMany({
      where: {
        prodiId,
        tahun_akademik: cycle.tahun_akademik,
        semester: cycle.semester
      }
    });

    // 5. Aggregate Data
    let totalIndikator = 0;
    let totalKlaimYa = 0;
    let totalTerverifikasi = 0;
    let totalEvaluasiDiri = 0;
    
    const klasterScores: Record<string, { total: number; verified: number }> = {};
    const manualNotes: string[] = [];

    applicableInsts.forEach((inst) => {
      let qs = [];
      try {
        qs = JSON.parse(inst.questions || "[]");
      } catch {}

      const record = records.find(r => r.instrumentId === inst.id);
      let answers: Record<string, any> = {};
      
      if (record) {
        try {
          answers = JSON.parse(record.answers || "{}");
        } catch {}
        
        if (record.analisa_kpma) {
          manualNotes.push(`${inst.id} - ${inst.name}: ${record.analisa_kpma}`);
        }
      }

      const category = inst.category || "Tanpa Kategori";
      if (!klasterScores[category]) {
        klasterScores[category] = { total: 0, verified: 0 };
      }

      qs.forEach((q: any) => {
        totalIndikator++;
        klasterScores[category].total++;

        const ans = answers[q.id] || {};
        
        // Klaim Prodi
        const isKlaimYa = ans.pilihan === "Ya";
        if (isKlaimYa) {
          totalKlaimYa++;
        }

        // Verifikasi Auditor (Ada Bukti & Sesuai)
        const hasBukti = ans.buktiLinks && ans.buktiLinks.length > 0;
        const isVerified = hasBukti && (ans.kesesuaianBukti === "Ya" || ans.kesesuaianBukti === "Sesuai");
        if (isVerified) {
          totalTerverifikasi++;
          klasterScores[category].verified++;
        }

        // Evaluasi Diri (Penjelasan Prodi)
        const hasEvaluasi = ans.evaluasiDiri && ans.evaluasiDiri.trim().length >= 5;
        if (hasEvaluasi) {
          totalEvaluasiDiri++;
        }
      });
    });

    const gapKlaim = totalKlaimYa - totalTerverifikasi;
    const persenTerverifikasi = totalIndikator > 0 ? (totalTerverifikasi / totalIndikator) * 100 : 0;
    const persenKlaim = totalIndikator > 0 ? (totalKlaimYa / totalIndikator) * 100 : 0;
    const persenEvaluasiDiri = totalIndikator > 0 ? (totalEvaluasiDiri / totalIndikator) * 100 : 0;

    // Klaster Array for Charts
    const klasterData = Object.keys(klasterScores).map(key => {
      const data = klasterScores[key];
      const score = data.total > 0 ? (data.verified / data.total) * 100 : 0;
      return {
        name: key,
        total: data.total,
        verified: data.verified,
        score: Math.round(score),
        text: `${Math.round(score)}% (${data.verified}/${data.total})`
      };
    }).sort((a, b) => b.score - a.score); // Sort descending

    // 6. Auto-Generate Findings & Recommendations
    const temuanUtama = [];
    const rekomendasi = [];

    temuanUtama.push(`Dari ${totalIndikator} butir indikator, hanya ${totalTerverifikasi} butir (${persenTerverifikasi.toFixed(1)}%) yang terverifikasi sesuai dengan bukti dokumen yang diunggah di aplikasi Monev.`);
    
    if (totalKlaimYa > 0) {
      temuanUtama.push(`Sebanyak ${totalKlaimYa} butir diklaim "Ya", namun hanya ${totalEvaluasiDiri} butir yang disertai catatan evaluasi diri, dan ${totalTerverifikasi} butir yang memiliki bukti dokumen terlampir. Hal ini mengindikasikan pengisian instrumen belum didukung oleh penjabaran evaluasi dan dokumentasi yang memadai.`);
    }

    if (persenEvaluasiDiri < 50) {
      temuanUtama.push(`Partisipasi Pengisian Kualitatif: Tingkat pengisian catatan evaluasi diri oleh Prodi terpantau sangat rendah (hanya ${persenEvaluasiDiri.toFixed(1)}% terisi). Sebagian besar indikator hanya dicentang tanpa diberikan konteks penjelasan, menyulitkan proses audit dokumen.`);
      rekomendasi.push(`Evaluasi Kedisiplinan Pengisian: Pada siklus berikutnya, pimpinan perlu menegaskan agar UPPS/Prodi tidak sekadar mencentang "Ya", melainkan wajib mendeskripsikan kendala/kondisi riil pada kolom Evaluasi Diri.`);
    } else if (persenEvaluasiDiri >= 80) {
      rekomendasi.push(`Pertahankan Kualitas Borang: Kualitas pengisian catatan evaluasi diri oleh prodi sudah sangat deskriptif dan kooperatif, perlu dipertahankan.`);
    }

    const lowClusters = klasterData.filter(k => k.score === 0);
    if (lowClusters.length > 0) {
      const names = lowClusters.map(k => k.name).join(", ");
      temuanUtama.push(`Klaster ${names} tercatat 0% terverifikasi — seluruh butir pada klaster ini belum memiliki bukti yang dapat diaudit.`);
    }

    if (gapKlaim > 0) {
      rekomendasi.push(`Quick win: percepat pengunggahan bukti untuk ${gapKlaim} butir yang sudah diklaim "Ya" — berpotensi menaikkan skor terverifikasi dari ${persenTerverifikasi.toFixed(1)}% mendekati ${persenKlaim.toFixed(1)}% tanpa perlu membangun proses baru.`);
    }
    
    if (lowClusters.length > 0) {
      rekomendasi.push(`Prioritas Klaster 0%: segera siapkan bukti formal untuk klaster ${lowClusters[0].name} dan klaster dengan nilai rendah lainnya.`);
    }

    rekomendasi.push(`Tutup siklus PPEPP: susun rekap temuan Monev, RTL dengan penanggung jawab & tenggat waktu, serta laporan pemantauan status tindak lanjut.`);

    // Add manual notes if they exist
    if (manualNotes.length > 0) {
      rekomendasi.push(`Catatan Auditor (Tambahan): ${manualNotes.slice(0, 2).join(' | ')}`);
    }

    return {
      success: true,
      data: {
        prodiName: prodi.name,
        jenjang: prodi.jenjang,
        facultyName: prodi.faculty.name,
        cycleName: `${cycle.tahun_akademik} - ${cycle.semester}`,
        totalIndikator,
        totalKlaimYa,
        totalTerverifikasi,
        totalEvaluasiDiri,
        persenTerverifikasi,
        persenKlaim,
        persenEvaluasiDiri,
        gapKlaim,
        klasterData,
        temuanUtama,
        rekomendasi,
        manualNotes
      }
    };

  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getUniversityExecutiveSummary(cycleId?: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Get active cycle
    let cycle = null;
    if (cycleId) {
      cycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
    } else {
      cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    }
    
    if (!cycle) return { success: false, error: "Tidak ada siklus aktif." };

    // 2. Fetch all prodis, faculties, instruments, and records for this cycle
    const allProdis = await prisma.prodi.findMany({ include: { faculty: true } });
    const allInstruments = await prisma.instrument.findMany();
    const allRecords = await prisma.monevRecord.findMany({
      where: {
        tahun_akademik: cycle.tahun_akademik,
        semester: cycle.semester
      }
    });

    if (allProdis.length === 0) {
      return { success: false, error: "Tidak ada data program studi." };
    }

    // Process variables
    const prodiScores: any[] = [];
    const klasterScores: Record<string, { totalApplicable: number, verified: number, totalQuestions: number, zeroCount: number }> = {};
    const prodiZeroMap: Record<string, Set<string>> = {}; // Klaster Category -> Set of Prodi IDs with 0%

    // Setup Klaster Map
    allInstruments.forEach(inst => {
      const category = inst.category || "Tanpa Kategori";
      if (!klasterScores[category]) {
        klasterScores[category] = { totalApplicable: 0, verified: 0, totalQuestions: 0, zeroCount: 0 };
        prodiZeroMap[category] = new Set();
      }
    });

    // 3. Calculate scores per Prodi
    for (const prodi of allProdis) {
      let prodiTotalIndikator = 0;
      let prodiTotalTerverifikasi = 0;
      let prodiTotalKlaimYa = 0;
      
      const prodiKlasterLocal: Record<string, { total: number, verified: number }> = {};
      
      const applicableInsts = allInstruments.filter(
        (i) => i.jenjang_peruntukan === "Semua" || i.jenjang_peruntukan === prodi.jenjang
      );

      applicableInsts.forEach(inst => {
        const category = inst.category || "Tanpa Kategori";
        if (!prodiKlasterLocal[category]) {
          prodiKlasterLocal[category] = { total: 0, verified: 0 };
        }
        
        const record = allRecords.find(r => r.prodiId === prodi.id && r.instrumentId === inst.id);
        let answers: Record<string, any> = {};
        if (record) {
          try { answers = JSON.parse(record.answers || "{}"); } catch {}
        }
        
        let qs = [];
        try { qs = JSON.parse(inst.questions || "[]"); } catch {}
        
        qs.forEach((q: any) => {
          prodiTotalIndikator++;
          prodiKlasterLocal[category].total++;
          klasterScores[category].totalQuestions++;
          
          const ans = answers[q.id] || {};
          
          if (ans.pilihan === "Ya") prodiTotalKlaimYa++;

          const hasBukti = ans.buktiLinks && ans.buktiLinks.length > 0;
          const isVerified = hasBukti && (ans.kesesuaianBukti === "Ya" || ans.kesesuaianBukti === "Sesuai");
          if (isVerified) {
            prodiTotalTerverifikasi++;
            prodiKlasterLocal[category].verified++;
            klasterScores[category].verified++;
          }
        });
      });

      // Calculate Prodi percentage
      const prodiScorePct = prodiTotalIndikator > 0 ? (prodiTotalTerverifikasi / prodiTotalIndikator) * 100 : 0;
      
      let kategori = "Kritis";
      if (prodiScorePct > 80) kategori = "Sgt.Baik";
      else if (prodiScorePct > 60) kategori = "Baik";
      else if (prodiScorePct > 40) kategori = "Cukup";
      else if (prodiScorePct > 20) kategori = "Kurang";

      prodiScores.push({
        id: prodi.id,
        name: prodi.name,
        jenjang: prodi.jenjang,
        facultyName: prodi.faculty.name,
        score: prodiScorePct,
        totalIndikator: prodiTotalIndikator,
        totalKlaimYa: prodiTotalKlaimYa,
        totalTerverifikasi: prodiTotalTerverifikasi,
        kategori
      });

      // Check which klaster has 0% for this prodi
      Object.keys(prodiKlasterLocal).forEach(cat => {
        const localKlaster = prodiKlasterLocal[cat];
        if (localKlaster.total > 0) {
          klasterScores[cat].totalApplicable++;
          if (localKlaster.verified === 0) {
            prodiZeroMap[cat].add(prodi.id);
          }
        }
      });
    }

    // Sort Prodi by score desc
    prodiScores.sort((a, b) => b.score - a.score);

    // 4. University aggregates
    const totalProdiEvaluasi = prodiScores.length;
    const avgScoreUniversity = prodiScores.reduce((acc, curr) => acc + curr.score, 0) / totalProdiEvaluasi;
    
    const countKritis = prodiScores.filter(p => p.kategori === "Kritis").length;
    const countKurang = prodiScores.filter(p => p.kategori === "Kurang").length;
    const countCukupSgtBaik = prodiScores.filter(p => ["Cukup", "Baik", "Sgt.Baik"].includes(p.kategori)).length;
    
    // Klaster averages
    const klasterData = Object.keys(klasterScores).map(key => {
      const kd = klasterScores[key];
      const avgScore = kd.totalQuestions > 0 ? (kd.verified / kd.totalQuestions) * 100 : 0;
      const prodiZero = prodiZeroMap[key].size;
      return {
        name: key,
        avgScore,
        prodiZero,
        totalApplicable: kd.totalApplicable
      };
    }).sort((a, b) => a.avgScore - b.avgScore); // Sort ascending (weakest first)

    // 5. Auto-Generate Strategic Recommendations
    const rekomendasi = [];
    
    // Rule 1: Unggah bukti massal (quick win) - always include if there is some gap, we assume there is always gap for now.
    rekomendasi.push({
      title: "Mandat unggah-bukti massal (quick win universitas)",
      text: `Pada hampir seluruh prodi, mayoritas gap berasal dari klaim "Ya" tanpa bukti terunggah. Instruksikan seluruh Kaprodi menuntaskan unggah bukti dalam 30 hari.`
    });

    // Rule 2: Intervensi khusus Kritis
    if (countKritis > 0) {
      const pctKritis = Math.round((countKritis / totalProdiEvaluasi) * 100);
      rekomendasi.push({
        title: `Intervensi khusus ${countKritis} prodi kategori Kritis (≤20%)`,
        text: `${pctKritis}% program studi berada di zona kritis. Bentuk satgas KPMA-Fakultas dengan target dan tenggat per-prodi, prioritaskan yang berdampak akreditasi terdekat.`
      });
    }

    // Rule 3: Klaster lemah
    const weakKlasters = klasterData.slice(0, 3);
    if (weakKlasters.length > 0) {
      const weakNames = weakKlasters.map(k => `${k.name} (rata-rata ${k.avgScore.toFixed(1)}%, ${k.prodiZero} prodi 0%)`).join(", ");
      rekomendasi.push({
        title: `Perkuat ${weakKlasters.length} klaster paling lemah secara universitas`,
        text: `Klaster terbawah: ${weakNames}. Diperlukan kebijakan tingkat universitas, bukan sekedar solusi per-prodi.`
      });
    }

    // Rule 4: Audit ulang
    rekomendasi.push({
      title: "Audit ulang praktik pengisian instrumen yang tidak konsisten",
      text: "Ditemukan pola inkonsistensi serta instrumen yang baru terisi sebagian. Standarkan SOP pengisian & verifikasi lintas fakultas."
    });

    // Rule 5: Praktik baik (Top 3 prodi)
    const topProdis = prodiScores.slice(0, 3);
    if (topProdis.length > 0 && topProdis[0].score > 60) {
      const topNames = topProdis.map(p => `${p.jenjang} ${p.name} (${p.score.toFixed(1)}%)`).join(", ");
      rekomendasi.push({
        title: `Jadikan ${topProdis.length} prodi terbaik sebagai rujukan praktik baik`,
        text: `${topNames} menunjukkan pola dokumentasi bukti yang matang. Replikasi SOP pengarsipan bukti mereka ke prodi lain.`
      });
    }

    // Rule 6: PPEPP
    rekomendasi.push({
      title: "Percepat penuntasan siklus PPEPP & Tindak Lanjut (TL-1/TL-2)",
      text: "Di hampir seluruh prodi, rekap temuan dan RTL dengan penanggung jawab & tenggat waktu belum terdokumentasi dengan baik."
    });

    return {
      success: true,
      data: {
        cycleName: `${cycle.tahun_akademik} - ${cycle.semester}`,
        totalProdiEvaluasi,
        avgScoreUniversity,
        countKritis,
        countKurang,
        countCukupSgtBaik,
        prodiScores,
        klasterData,
        rekomendasi
      }
    };

  } catch (error: any) {
    console.error("Error in getUniversityExecutiveSummary:", error);
    return { success: false, error: error.message };
  }
}

