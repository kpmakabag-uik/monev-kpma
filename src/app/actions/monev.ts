"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

export interface AnswerItem {
  evaluasiDiri?: string;
  pilihan?: string;
  buktiLinks?: string[];
  buktiNames?: Record<string, string>;
  catatanAuditor?: string;
  kesesuaianBukti?: string;
}

export async function saveMonevRecord({
  prodiId,
  instrumentId,
  tahunAkademik,
  semester,
  answers,
  analisaKpma,
  tindakLanjutKpma
}: {
  prodiId: string;
  instrumentId: string;
  tahunAkademik: string;
  semester: string;
  answers: Record<string, AnswerItem>;
  analisaKpma: string;
  tindakLanjutKpma: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const role = session.user.role;

    // IDOR Prevention
    if (role === "GKM" && session.user.prodiId !== prodiId) {
      return { success: false, error: "Forbidden: Anda tidak memiliki akses untuk Prodi ini." };
    }
    if (role === "GPM" || role === "PIMPINAN_FAKULTAS") {
      const prodiObj = await prisma.prodi.findUnique({ where: { id: prodiId }, select: { facultyId: true } });
      if (!prodiObj || prodiObj.facultyId !== session.user.facultyId) {
        return { success: false, error: "Forbidden: Anda hanya diperbolehkan mengakses Prodi di Fakultas Anda." };
      }
    }

    // Auto-Lock Verification for GKM
    if (role === "GKM") {
      const cycle = await prisma.cycle.findUnique({
        where: {
          tahun_akademik_semester: { tahun_akademik: tahunAkademik, semester }
        }
      });
      if (cycle?.endDate) {
        const end = new Date(cycle.endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date() > end) {
          return { success: false, error: "Batas waktu pengisian untuk siklus ini telah berakhir." };
        }
      }

      const submission = await prisma.monevsubmission.findUnique({
        where: {
          prodiId_tahun_akademik_semester: {
            prodiId,
            tahun_akademik: tahunAkademik,
            semester
          }
        }
      });

      if (submission?.isSubmitted) {
        return { success: false, error: "Data monev telah difinalisasi dan dikunci. Hubungi KPMA untuk membuka kembali." };
      }
    }

    // Fetch existing answers to merge
    const existing = await prisma.monevrecord.findUnique({
      where: {
        prodiId_instrumentId_tahun_akademik_semester: {
          prodiId, instrumentId, tahun_akademik: tahunAkademik, semester
        }
      }
    });

    let mergedAnswers: Record<string, AnswerItem> = {};
    if (existing && existing.answers) {
      try {
        mergedAnswers = JSON.parse(decrypt(existing.answers as string));
      } catch {
        mergedAnswers = {};
      }
    }

    // Merge answers based on role permissions
    Object.keys(answers).forEach(qId => {
      if (!mergedAnswers[qId]) mergedAnswers[qId] = {};

      const qAns = answers[qId];
      if (role === "GKM" || role === "KPMA") {
        // GKM & KPMA can fill main answers and upload evidence
        mergedAnswers[qId].evaluasiDiri = qAns.evaluasiDiri;
        mergedAnswers[qId].pilihan = qAns.pilihan;
        if (qAns.buktiLinks) mergedAnswers[qId].buktiLinks = qAns.buktiLinks;
        if (qAns.buktiNames) {
          mergedAnswers[qId].buktiNames = {
            ...(mergedAnswers[qId].buktiNames || {}),
            ...qAns.buktiNames
          };
        }
      }

      if (role === "GPM" || role === "KPMA") {
        // GPM & KPMA can fill audit notes
        mergedAnswers[qId].catatanAuditor = qAns.catatanAuditor;
        mergedAnswers[qId].kesesuaianBukti = qAns.kesesuaianBukti;
      }
    });

    const finalAnalisa = role === "KPMA" ? analisaKpma : (existing?.analisa_kpma || "");
    const finalTindakLanjut = role === "KPMA" ? tindakLanjutKpma : (existing?.tindak_lanjut_kpma || "");

    await prisma.monevrecord.upsert({
      where: {
        prodiId_instrumentId_tahun_akademik_semester: {
          prodiId, instrumentId, tahun_akademik: tahunAkademik, semester
        }
      },
      update: {
        answers: encrypt(JSON.stringify(mergedAnswers)),
        analisa_kpma: finalAnalisa,
        tindak_lanjut_kpma: finalTindakLanjut,
      },
      create: {
        prodiId,
        instrumentId,
        tahun_akademik: tahunAkademik,
        semester,
        answers: encrypt(JSON.stringify(mergedAnswers)),
        analisa_kpma: finalAnalisa,
        tindak_lanjut_kpma: finalTindakLanjut,
      }
    });

    // Sinkronisasi ke tabel monevevidence untuk indexing dan pencarian cepat
    try {
      const instObj = await prisma.instrument.findUnique({
        where: { id: instrumentId },
        select: { questions: true, category: true }
      });
      const qTextMap = new Map<string, string>();
      if (instObj?.questions) {
        try {
          const parsed = JSON.parse(instObj.questions);
          if (Array.isArray(parsed)) {
            parsed.forEach((q: { id: string; text: string }) => {
              if (q.id && q.text) qTextMap.set(q.id, q.text);
            });
          }
        } catch (_) {}
      }

      await prisma.monevevidence.deleteMany({
        where: {
          prodiId,
          instrumentId,
          tahun_akademik: tahunAkademik,
          semester,
        }
      });

      const evidenceRecords: Array<{
        prodiId: string;
        instrumentId: string;
        category?: string | null;
        questionId: string;
        questionNo?: string | null;
        questionText?: string | null;
        evaluasiDiri?: string | null;
        tahun_akademik: string;
        semester: string;
        url: string;
        fileName: string;
      }> = [];

      Object.keys(mergedAnswers).forEach(qId => {
        const item = mergedAnswers[qId];
        if (Array.isArray(item.buktiLinks) && item.buktiLinks.length > 0) {
          const qText = qTextMap.get(qId) || null;
          const evDiri = item.evaluasiDiri || null;
          const qNum = qId.replace(/[^0-9]/g, "") || "1";
          const qLetter = String.fromCharCode(65 + ((parseInt(qNum) - 1) % 26));

          item.buktiLinks.forEach((url, idx) => {
            const customName = item.buktiNames?.[url];
            const seq = String(idx + 1).padStart(2, "0");
            const defaultName = `Dokumen Bukti ${instrumentId}-1${qLetter}-${seq}`;
            const finalName = customName && customName.trim() ? customName.trim() : defaultName;

            evidenceRecords.push({
              prodiId,
              instrumentId,
              category: instObj?.category || null,
              questionId: qId,
              questionNo: `1${qLetter}`,
              questionText: qText,
              evaluasiDiri: evDiri,
              tahun_akademik: tahunAkademik,
              semester,
              url,
              fileName: finalName,
            });
          });
        }
      });

      if (evidenceRecords.length > 0) {
        await prisma.monevevidence.createMany({
          data: evidenceRecords,
        });
      }
    } catch (evErr) {
      console.warn("Sinkronisasi monevevidence warning:", evErr);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Save Error:", err);
    return { success: false, error: message };
  }
}

export async function importPreviousCycleData(prodiId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const role = session.user.role;
    if (role === "GKM" && session.user.prodiId !== prodiId) {
      return { success: false, error: "Forbidden: Anda tidak memiliki akses untuk Prodi ini." };
    }
    if (role === "GPM" || role === "PIMPINAN_FAKULTAS") {
      const prodiObj = await prisma.prodi.findUnique({ where: { id: prodiId }, select: { facultyId: true } });
      if (!prodiObj || prodiObj.facultyId !== session.user.facultyId) {
        return { success: false, error: "Forbidden: Anda hanya diperbolehkan mengakses Prodi di Fakultas Anda." };
      }
    }

    // 1. Get current active cycle
    const currentCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    if (!currentCycle) return { success: false, error: "Tidak ada siklus aktif ditemukan." };

    // 2. Get previous cycle (latest before current)
    const allCycles = await prisma.cycle.findMany({
      orderBy: [
        { tahun_akademik: 'desc' },
        { semester: 'desc' }
      ]
    });

    const currentIndex = allCycles.findIndex(c => c.id === currentCycle.id);
    const prevCycle = allCycles[currentIndex + 1];

    if (!prevCycle) return { success: false, error: "Tidak ada data siklus sebelumnya yang bisa diimpor." };

    // 3. Get all records from previous cycle for this prodi
    const prevRecords = await prisma.monevrecord.findMany({
      where: {
        prodiId,
        tahun_akademik: prevCycle.tahun_akademik,
        semester: prevCycle.semester
      }
    });

    if (prevRecords.length === 0) return { success: false, error: "Tidak ditemukan data pada siklus sebelumnya." };

    // 4. Process each record using interactive transaction
    let importedCount = 0;
    await prisma.$transaction(async (tx) => {
      for (const oldRec of prevRecords) {
        let decryptedOld = oldRec.answers as string;
        if (decryptedOld && decryptedOld.includes(":")) decryptedOld = decrypt(decryptedOld);

        let oldAnswers: Record<string, AnswerItem> = {};
        try {
          oldAnswers = JSON.parse(decryptedOld);
        } catch { continue; }

        // Clean answers: we only want the GKM parts
        const cleanAnswers: Record<string, AnswerItem> = {};
        Object.keys(oldAnswers).forEach(qId => {
          const item = oldAnswers[qId];
          cleanAnswers[qId] = {
            evaluasiDiri: item.evaluasiDiri,
            pilihan: item.pilihan,
            buktiLinks: item.buktiLinks
          };
        });

        // Find current record
        const existing = await tx.monevrecord.findUnique({
          where: {
            prodiId_instrumentId_tahun_akademik_semester: {
              prodiId,
              instrumentId: oldRec.instrumentId,
              tahun_akademik: currentCycle.tahun_akademik,
              semester: currentCycle.semester
            }
          }
        });

        let finalAnswers = cleanAnswers;
        if (existing) {
          let decryptedCurrent = existing.answers as string;
          if (decryptedCurrent && decryptedCurrent.includes(":")) decryptedCurrent = decrypt(decryptedCurrent);
          const currentAns: Record<string, AnswerItem> = JSON.parse(decryptedCurrent);
          Object.keys(cleanAnswers).forEach(qId => {
            if (!currentAns[qId]) currentAns[qId] = {};
            const cleanItem = cleanAnswers[qId];
            // Only copy if current is empty/null
            if (!currentAns[qId].pilihan) currentAns[qId].pilihan = cleanItem.pilihan;
            if (!currentAns[qId].evaluasiDiri) currentAns[qId].evaluasiDiri = cleanItem.evaluasiDiri;
            if (!currentAns[qId].buktiLinks || currentAns[qId].buktiLinks.length === 0) {
              currentAns[qId].buktiLinks = cleanItem.buktiLinks;
            }
          });
          finalAnswers = currentAns;
        }

        await tx.monevrecord.upsert({
          where: {
            prodiId_instrumentId_tahun_akademik_semester: {
              prodiId,
              instrumentId: oldRec.instrumentId,
              tahun_akademik: currentCycle.tahun_akademik,
              semester: currentCycle.semester
            }
          },
          update: { answers: encrypt(JSON.stringify(finalAnswers)) },
          create: {
            prodiId,
            instrumentId: oldRec.instrumentId,
            tahun_akademik: currentCycle.tahun_akademik,
            semester: currentCycle.semester,
            answers: encrypt(JSON.stringify(finalAnswers))
          }
        });
        importedCount++;
      }
    }, {
      maxWait: 5000,
      timeout: 60000,
    });

    return { success: true, count: importedCount, from: `${prevCycle.tahun_akademik} ${prevCycle.semester}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Import Error:", err);
    return { success: false, error: message };
  }
}

export async function getProdiMonevReport(prodiId: string, tahunAkademik: string, semester: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const role = session.user.role;
    if (role === "GKM" && session.user.prodiId !== prodiId) {
      return { success: false, error: "Forbidden: Anda tidak memiliki akses untuk Prodi ini." };
    }
    if (role === "GPM" || role === "PIMPINAN_FAKULTAS") {
      const prodiObj = await prisma.prodi.findUnique({ where: { id: prodiId }, select: { facultyId: true } });
      if (!prodiObj || prodiObj.facultyId !== session.user.facultyId) {
        return { success: false, error: "Forbidden: Anda hanya diperbolehkan mengakses Prodi di Fakultas Anda." };
      }
    }

    const records = await prisma.monevrecord.findMany({
      where: {
        prodiId,
        tahun_akademik: tahunAkademik,
        semester
      },
      include: {
        instrument: true
      }
    });

    const prodi = await prisma.prodi.findUnique({
      where: { id: prodiId },
      include: { faculty: true }
    });

    return {
      success: true,
      records: records.map((r: any) => {
        let decryptedAnswers = r.answers as string;
        if (decryptedAnswers && decryptedAnswers.includes(":")) {
          decryptedAnswers = decrypt(decryptedAnswers);
        }
        return {
          ...r,
          answers: JSON.parse(decryptedAnswers)
        };
      }),
      prodi
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    console.error("Report Fetch Error:", err);
    return { success: false, error: message };
  }
}

export async function submitFinalMonev({
  prodiId,
  tahunAkademik,
  semester,
  pactAgreedBy
}: {
  prodiId: string;
  tahunAkademik: string;
  semester: string;
  pactAgreedBy: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const role = session.user.role;
    if (role === "GKM" && session.user.prodiId !== prodiId) {
      return { success: false, error: "Forbidden: Anda tidak memiliki akses untuk Prodi ini." };
    }

    await prisma.monevsubmission.upsert({
      where: {
        prodiId_tahun_akademik_semester: {
          prodiId,
          tahun_akademik: tahunAkademik,
          semester
        }
      },
      update: {
        isSubmitted: true,
        submittedAt: new Date(),
        agreedToPact: true,
        pactAgreedAt: new Date(),
        pactAgreedBy: pactAgreedBy || session.user.name || "PIC Prodi"
      },
      create: {
        prodiId,
        tahun_akademik: tahunAkademik,
        semester,
        isSubmitted: true,
        submittedAt: new Date(),
        agreedToPact: true,
        pactAgreedAt: new Date(),
        pactAgreedBy: pactAgreedBy || session.user.name || "PIC Prodi"
      }
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, error: message };
  }
}

export async function reopenMonevSubmission({
  prodiId,
  tahunAkademik,
  semester
}: {
  prodiId: string;
  tahunAkademik: string;
  semester: string;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") return { success: false, error: "Akses Ditolak: Hanya KPMA yang dapat membuka kembali kuncian pengisian." };

    await prisma.monevsubmission.update({
      where: {
        prodiId_tahun_akademik_semester: {
          prodiId,
          tahun_akademik: tahunAkademik,
          semester
        }
      },
      data: {
        isSubmitted: false
      }
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, error: message };
  }
}

export async function togglePublishAnalysis({
  prodiId,
  tahunAkademik,
  semester,
  isPublished
}: {
  prodiId: string;
  tahunAkademik: string;
  semester: string;
  isPublished: boolean;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") return { success: false, error: "Akses Ditolak: Hanya KPMA yang dapat mengubah status publikasi." };

    await prisma.monevrecord.updateMany({
      where: {
        prodiId,
        tahun_akademik: tahunAkademik,
        semester
      },
      data: {
        isAnalysisPublished: isPublished,
        analysisPublishedAt: isPublished ? new Date() : null
      }
    });

    revalidatePath("/master/analisis");
    revalidatePath("/laporan");
    revalidatePath("/laporan-eksekutif");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, error: message };
  }
}

export async function publishAnalysisBatchByFaculty({
  facultyId,
  tahunAkademik,
  semester,
  isPublished
}: {
  facultyId: string;
  tahunAkademik: string;
  semester: string;
  isPublished: boolean;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") {
      return { success: false, error: "Akses Ditolak: Hanya KPMA yang dapat mengubah status publikasi." };
    }

    // Determine target prodis
    const prodiWhere: any = {};
    if (facultyId && facultyId !== "ALL") {
      prodiWhere.facultyId = facultyId;
    }

    const targetProdis = await prisma.prodi.findMany({
      where: prodiWhere,
      select: { id: true, name: true }
    });

    if (targetProdis.length === 0) {
      return { success: false, error: "Tidak ada Program Studi pada kriteria yang dipilih." };
    }

    const prodiIds = targetProdis.map(p => p.id);

    const result = await prisma.monevrecord.updateMany({
      where: {
        prodiId: { in: prodiIds },
        tahun_akademik: tahunAkademik,
        semester
      },
      data: {
        isAnalysisPublished: isPublished,
        analysisPublishedAt: isPublished ? new Date() : null
      }
    });

    revalidatePath("/master/analisis");
    revalidatePath("/laporan");
    revalidatePath("/laporan-eksekutif");

    return {
      success: true,
      updatedRecords: result.count,
      prodiCount: prodiIds.length
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, error: message };
  }
}

