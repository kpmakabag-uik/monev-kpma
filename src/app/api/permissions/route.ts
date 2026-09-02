import { NextResponse } from "next/server";
import { getPermissions, savePermissions, RolePermissions } from "@/lib/permissions";
import { ALL_MENUS } from "@/config/menus";
// Asumsi getUserSession atau middleware sudah memproteksi route ini untuk role KPMA saja

export async function GET() {
  try {
    const permissions = getPermissions();
    return NextResponse.json({ 
      success: true, 
      permissions,
      menus: ALL_MENUS 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal mengambil data hak akses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { permissions } = body as { permissions: RolePermissions };
    
    if (!permissions) {
      return NextResponse.json({ success: false, error: "Data permissions tidak valid" }, { status: 400 });
    }

    const saved = savePermissions(permissions);
    
    if (saved) {
      return NextResponse.json({ success: true, message: "Hak akses berhasil disimpan" });
    } else {
      return NextResponse.json({ success: false, error: "Gagal menyimpan file hak akses" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
