import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

// Helper to convert File to Base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!session?.user || (userRole !== "GKM" && userRole !== "KPMA")) {
      return NextResponse.json({ success: false, error: "Unauthorized. Only GKM or KPMA can upload." }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    // Use customName if provided (from Regulasi), otherwise fallback to the dynamic MONEV naming logic
    const customName = formData.get("customName") as string;
    
    const facultyName = formData.get("facultyName") as string || "Fakultas_Unknown";
    const prodiName = formData.get("prodiName") as string || "Prodi_Unknown";
    const jenjang = formData.get("jenjang") as string || "S1";
    const tahunAkademik = formData.get("tahunAkademik") as string || "Tahun";
    const semester = formData.get("semester") as string || "Semester";
    const instrumentId = formData.get("instrumentId") as string || "UnknownInstr";
    const kategori = formData.get("kategori") as string || "Kategori";
    const qId = formData.get("qId") as string || "Q";

    const fileOffset = parseInt(formData.get("fileOffset") as string) || 0;

    // Used if it's a Regulasi upload (it will go to a "Regulasi" folder instead)
    const type = formData.get("type") as string; 

    if (!files || files.length === 0) {
      if (formData.has("file")) {
        const singleFile = formData.get("file") as File;
        if (singleFile) files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
    }

    // Ambil kredensial dari Database
    const setting = await prisma.setting.findFirst();
    const storageType = setting?.storage_type || "GDRIVE";

    if (storageType === "GDRIVE" && !setting?.appscript_url) {
      return NextResponse.json({ 
        success: false, 
        error: "URL Google Apps Script belum dikonfigurasi oleh Admin. Hubungi KPMA." 
      }, { status: 500 });
    }

    const appscriptUrl = setting?.appscript_url;
    const uploadedLinks: string[] = [];

    // Tentukan folder parent berdasarkan konteks upload
    const parentFolder = type ? "Regulasi" : facultyName;
    const subFolder = type ? (type === "PERATURAN" ? "Peraturan" : "Instrumen") : prodiName;

    // Upload all files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const safeExt = file.name.split('.').pop() || "pdf";
      let fileName = file.name;

      if (customName) {
         fileName = `${customName}.${safeExt}`;
      } else {
        // Dynamic naming: namafakultas_jenjang_prodi_Tahun_Semester_kodeInstr_Kategori_Namatabel_NoInstrumen_Nourut
        const safeFac = facultyName.replace(/[^a-zA-Z0-9]/g, "");
        const safeProdi = prodiName.replace(/[^a-zA-Z0-9]/g, "");
        const safeKat = kategori.replace(/[^a-zA-Z0-9]/g, "");
        const safeJenjang = jenjang.replace(/[^a-zA-Z0-9]/g, "");
        const safeTahun = tahunAkademik.replace(/[^a-zA-Z0-9]/g, "");
        const safeSem = semester.replace(/[^a-zA-Z0-9]/g, "");
        fileName = `${safeFac}_${safeJenjang}_${safeProdi}_${safeTahun}-${safeSem}_${instrumentId}_${safeKat}_Tabel_${qId}_${fileOffset + i + 1}.${safeExt}`;
      }

      if (storageType === "LOCAL") {
        // === LOGIKA PENYIMPANAN LOKAL ===
        const uploadDir = path.join(process.cwd(), "public", "uploads", parentFolder, subFolder);
        
        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, fileName);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await fs.writeFile(filePath, buffer);
        
        // Construct the local URL (publicly accessible)
        // Format: /uploads/Parent/Sub/FileName
        const localUrl = `/uploads/${encodeURIComponent(parentFolder)}/${encodeURIComponent(subFolder)}/${encodeURIComponent(fileName)}`;
        uploadedLinks.push(localUrl);

      } else {
        // === LOGIKA GOOGLE DRIVE (APPS SCRIPT) ===
        const base64Data = await fileToBase64(file);
        const payload = {
          fileName: fileName,
          mimeType: file.type || "application/octet-stream",
          base64Data: base64Data,
          parentFolder: parentFolder,
          subFolder: subFolder
        };

        const response = await fetch(appscriptUrl!, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Apps Script responded with status ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.url) {
          uploadedLinks.push(result.url);
        } else {
          throw new Error(result.error || "Gagal mengunggah ke Apps Script");
        }
      }
    }

    // Jika dipanggil dari komponen Regulasi yang hanya menerima satu file, kembalikan 'url' tunggal
    if (customName && uploadedLinks.length > 0) {
      return NextResponse.json({ success: true, url: uploadedLinks[0] });
    }

    return NextResponse.json({ success: true, links: uploadedLinks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
