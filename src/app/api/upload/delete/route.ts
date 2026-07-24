import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { urls } = await request.json();
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada URL untuk dihapus." });
    }

    const setting = await prisma.setting.findFirst();
    if (!setting?.appscript_url) {
      return NextResponse.json({ success: false, error: "URL Apps Script belum dikonfigurasi." }, { status: 500 });
    }

    const appscriptUrl = setting.appscript_url;

    // Menghapus file satu per satu melalui Apps Script
    for (const url of urls) {
      const payload = {
        action: "delete",
        fileUrl: url
      };

      await fetch(appscriptUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        }
      }).catch(_err => console.error(`Gagal menghapus ${url}:`, _err));
    }

    return NextResponse.json({ success: true, message: "File berhasil dibuang ke sampah." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    console.error("Delete Upload Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
