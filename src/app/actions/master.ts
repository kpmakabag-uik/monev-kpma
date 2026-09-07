"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// SETTINGS
export async function updateSetting(id: string | undefined, data: { appscript_url?: string | null, storage_type?: string }) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  if (id) await prisma.setting.update({ where: { id }, data });
  else await prisma.setting.create({ 
    data: { 
      appscript_url: data.appscript_url, 
      storage_type: data.storage_type || "google_drive" 
    } 
  });
}

// CYCLE
export async function getActiveCycle() {
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  return cycle || { tahun_akademik: "2025/2026", semester: "Genap" };
}

export async function createCycle(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  const startDateVal = formData.get("startDate") as string;
  const endDateVal = formData.get("endDate") as string;
  await prisma.cycle.create({ 
    data: { 
      id: crypto.randomUUID(),
      tahun_akademik: formData.get("tahun_akademik") as string, 
      semester: formData.get("semester") as string,
      startDate: startDateVal ? new Date(startDateVal) : null,
      endDate: endDateVal ? new Date(endDateVal) : null,
    } 
  });
  revalidatePath("/master/cycles");
}

export async function updateCycleDates(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return { error: "Akses Ditolak" };
  const startDateVal = formData.get("startDate") as string;
  const endDateVal = formData.get("endDate") as string;
  await prisma.cycle.update({
    where: { id },
    data: {
      startDate: startDateVal ? new Date(startDateVal) : null,
      endDate: endDateVal ? new Date(endDateVal) : null,
    }
  });
  revalidatePath("/master/cycles");
  revalidatePath("/monev");
  return { success: true };
}

export async function deleteCycle(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") return { error: "Akses Ditolak" };
    
    const cycle = await prisma.cycle.findUnique({ where: { id } });
    if (!cycle) return { error: "Siklus tidak ditemukan" };

    // Hapus paksa semua data MonevRecord yang terkait dengan siklus ini terlebih dahulu,
    // baru kemudian hapus siklusnya (Cascade Delete Manual).
    await prisma.$transaction([
      prisma.monevrecord.deleteMany({
        where: {
          tahun_akademik: cycle.tahun_akademik,
          semester: cycle.semester
        }
      }),
      prisma.cycle.delete({ where: { id } })
    ]);

    revalidatePath("/master/cycles");
  } catch (err) {
    return { error: "Gagal menghapus siklus." };
  }
}

export async function setActiveCycle(id: string) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  await prisma.$transaction([
    prisma.cycle.updateMany({ data: { isActive: false } }),
    prisma.cycle.update({ where: { id }, data: { isActive: true } })
  ]);
  revalidatePath("/");
}

// DOCUMENT (REGULASI)
export async function createDocument(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  await prisma.document.create({ 
    data: { 
      type: formData.get("type") as string, 
      title: formData.get("title") as string, 
      description: formData.get("description") as string,
      fileUrl: formData.get("fileUrl") as string
    } 
  });
  revalidatePath("/regulasi/peraturan");
  revalidatePath("/regulasi/instrumen");
}

export async function updateDocument(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  await prisma.document.update({ 
    where: { id }, 
    data: { 
      title: formData.get("title") as string, 
      description: formData.get("description") as string,
      fileUrl: formData.get("fileUrl") as string
    } 
  });
  revalidatePath("/regulasi/peraturan");
  revalidatePath("/regulasi/instrumen");
}

export async function deleteDocument(id: string) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return { error: "Akses Ditolak" };
  await prisma.document.delete({ where: { id } });
  revalidatePath("/regulasi/peraturan");
  revalidatePath("/regulasi/instrumen");
}

// FACULTY
export async function createFaculty(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  await prisma.faculty.create({ data: { name: formData.get("name") as string } });
  redirect("/master/faculty");
}
export async function updateFaculty(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  await prisma.faculty.update({ where: { id }, data: { name: formData.get("name") as string } });
  redirect("/master/faculty");
}
export async function deleteFaculty(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") return { error: "Akses Ditolak" };
    await prisma.faculty.delete({ where: { id } });
    revalidatePath("/master/faculty");
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === "P2003") return { error: "Gagal menghapus: Fakultas ini masih memiliki Prodi atau Pengguna yang terhubung dengannya." };
    return { error: "Gagal menghapus Fakultas." };
  }
}

// PRODI
export async function createProdi(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  await prisma.prodi.create({ data: { name: formData.get("name") as string, jenjang: formData.get("jenjang") as string, facultyId: formData.get("facultyId") as string } });
  redirect("/master/prodi");
}
export async function updateProdi(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  await prisma.prodi.update({ where: { id }, data: { name: formData.get("name") as string, jenjang: formData.get("jenjang") as string, facultyId: formData.get("facultyId") as string } });
  redirect("/master/prodi");
}
export async function deleteProdi(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") return { error: "Akses Ditolak" };
    await prisma.prodi.delete({ where: { id } });
    revalidatePath("/master/prodi");
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === "P2003") return { error: "Gagal menghapus: Program Studi ini masih memiliki Pengguna atau Transaksi MONEV yang terhubung dengannya." };
    return { error: "Gagal menghapus Program Studi." };
  }
}

// INSTRUMENTS
export async function createInstrument(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  const questionsParam = formData.get("questions") as string;
  let questions = [];
  try {
     questions = questionsParam ? JSON.parse(questionsParam) : [];
  } catch {
     // Ignore parse error
  }
  
  if (questions.length === 0) {
    questions = [{ id: "q1", text: "Silahkan update detail indikator", bobot: 5 }];
  }

  await prisma.instrument.create({ 
    data: { 
      id: formData.get("id") as string, 
      name: formData.get("name") as string, 
      category: formData.get("category") as string, 
      kriteria: "-", 
      indikator: "-", 
      jenjang_peruntukan: formData.get("jenjang_peruntukan") as string, 
      questions: JSON.stringify(questions) 
    } 
  });
  revalidatePath("/master/instruments");
}
export async function updateInstrument(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  
  const questionsParam = formData.get("questions") as string;
  let questions = null;
  if (questionsParam) {
    try {
      questions = JSON.parse(questionsParam);
    } catch {
      // Ignore parse error
    }
  }
  
  interface InstrumentUpdateData {
    name: string;
    category: string;
    kriteria: string;
    indikator: string;
    jenjang_peruntukan: string;
    questions?: string;
  }

  const updateData: InstrumentUpdateData = { 
    name: formData.get("name") as string, 
    category: formData.get("category") as string, 
    kriteria: formData.get("kriteria") as string || "-", 
    indikator: formData.get("indikator") as string || "-", 
    jenjang_peruntukan: formData.get("jenjang_peruntukan") as string 
  };
  
  if (questions) {
    updateData.questions = JSON.stringify(questions);
  }

  await prisma.instrument.update({ where: { id }, data: updateData });
  redirect("/master/instruments");
}
export async function deleteInstrument(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") return { error: "Akses Ditolak" };
    await prisma.instrument.delete({ where: { id } });
    revalidatePath("/master/instruments");
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === "P2003") return { error: "Gagal menghapus: Instrumen ini sudah pernah diisi pada formulir MONEV." };
    return { error: "Gagal menghapus Instrumen." };
  }
}

// USERS
interface UserCreateData {
  name: string;
  username: string;
  password?: string;
  role: string;
  facultyId?: string | null;
  prodiId?: string | null;
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  const passwordHash = await bcrypt.hash(formData.get("password") as string, 10);
  const data: UserCreateData = { name: formData.get("name") as string, username: formData.get("username") as string, password: passwordHash, role: formData.get("role") as string };
  const facultyId = formData.get("facultyId") as string; if (facultyId) data.facultyId = facultyId;
  const prodiId = formData.get("prodiId") as string; if (prodiId) data.prodiId = prodiId;
  await prisma.user.create({ data });
  redirect("/master/users");
}
export async function updateUser(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") return;
  const data: UserCreateData = { name: formData.get("name") as string, username: formData.get("username") as string, role: formData.get("role") as string };
  const pass = formData.get("password") as string; if (pass) data.password = await bcrypt.hash(pass, 10);
  const facultyId = formData.get("facultyId") as string; if (facultyId) data.facultyId = facultyId; else data.facultyId = null;
  const prodiId = formData.get("prodiId") as string; if (prodiId) data.prodiId = prodiId; else data.prodiId = null;
  await prisma.user.update({ where: { id }, data });
  redirect("/master/users");
}
export async function deleteUser(id: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "KPMA") return { error: "Akses Ditolak" };
    await prisma.user.delete({ where: { id } });
    revalidatePath("/master/users");
  } catch {
    return { error: "Gagal menghapus Pengguna." };
  }
}

