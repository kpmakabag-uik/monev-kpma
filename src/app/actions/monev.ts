"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { encrypt, decrypt } from "@/lib/encryption";

interface AnswerItem {
  evaluasiDiri?: string;
  pilihan?: string;
  buktiLinks?: string[];
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

    // In a real app we could rigorously validate if they changed restricted fields, 
    // but the Client Component already disables them.
    // For upsert, we might want to fetch existing first, and ONLY apply modifications on allowed fields

    // Simple path: Upsert all fields that are passed from client
    // Note: To be secure, Backend should reconstruct the JSON by only replacing allowed fields.

    const existing = await prisma.monevRecord.findUnique({
      where: {
        prodiId_instrumentId_tahun_akademik_semester: {
          prodiId, instrumentId, tahun_akademik: tahunAkademik, semester
        }
      }
    });

    let decryptedExisting = "{}";
    if (existing?.answers) {
      decryptedExisting = existing.answers.includes(":") ? decrypt(existing.answers as string) : existing.answers as string;
    }
    const mergedAnswers: Record<string, AnswerItem> = existing ? JSON.parse(decryptedExisting) : {};

    // Merge answers based on role permissions
    Object.keys(answers).forEach(qId => {
      if (!mergedAnswers[qId]) mergedAnswers[qId] = {};

      const qAns = answers[qId];
      if (role === "GKM" || role === "KPMA") {
        // GKM & KPMA can fill main answers and upload evidence
        mergedAnswers[qId].evaluasiDiri = qAns.evaluasiDiri;
        mergedAnswers[qId].pilihan = qAns.pilihan;
        if (qAns.buktiLinks) mergedAnswers[qId].buktiLinks = qAns.buktiLinks;
      }

      if (role === "GPM" || role === "KPMA") {
        // GPM & KPMA can fill audit notes
        mergedAnswers[qId].catatanAuditor = qAns.catatanAuditor;
        mergedAnswers[qId].kesesuaianBukti = qAns.kesesuaianBukti;
      }
    });

    const finalAnalisa = role === "KPMA" ? analisaKpma : (existing?.analisa_kpma || "");
    const finalTindakLanjut = role === "KPMA" ? tindakLanjutKpma : (existing?.tindak_lanjut_kpma || "");

    await prisma.monevRecord.upsert({
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
    const prevRecords = await prisma.monevRecord.findMany({
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
        const existing = await tx.monevRecord.findUnique({
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

        await tx.monevRecord.upsert({
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

    const records = await prisma.monevRecord.findMany({
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
      records: records.map(r => {
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
