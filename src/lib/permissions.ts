import fs from "fs";
import path from "path";
import { getAllMenuKeys } from "@/config/menus";

const PERMISSIONS_FILE = path.join(process.cwd(), "data", "permissions.json");

export interface RolePermissions {
  [role: string]: string[]; // role -> array of menu keys
}

// Default fallback permissions
const DEFAULT_PERMISSIONS: RolePermissions = {
  "KPMA": getAllMenuKeys(), // Admin gets everything
  "GPM": [
    "main.dashboard",
    "main.laporan_monev_only",
    "regulasi.peraturan",
    "regulasi.panduan"
  ],
  "GKM": [
    "main.dashboard",
    "main.pengisian_monev",
    "regulasi.peraturan",
    "regulasi.panduan"
  ],
  "PIMPINAN_FAKULTAS": [
    "main.dashboard",
    "main.laporan_monev_only",
    "regulasi.peraturan"
  ],
  "PIMPINAN_UNIVERSITAS": [
    "main.dashboard",
    "main.laporan_monev_only",
    "regulasi.peraturan"
  ]
};

/**
 * Initializes the permissions file if it doesn't exist
 */
const ensurePermissionsFile = () => {
  const dataDir = path.dirname(PERMISSIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(PERMISSIONS_FILE)) {
    fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(DEFAULT_PERMISSIONS, null, 2), "utf8");
  }
};

/**
 * Reads all role permissions from the JSON file
 */
export const getPermissions = (): RolePermissions => {
  ensurePermissionsFile();
  try {
    const data = fs.readFileSync(PERMISSIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading permissions.json:", error);
    return DEFAULT_PERMISSIONS;
  }
};

/**
 * Writes the permissions matrix to the JSON file
 */
export const savePermissions = (permissions: RolePermissions): boolean => {
  ensurePermissionsFile();
  try {
    fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(permissions, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing to permissions.json:", error);
    return false;
  }
};

/**
 * Check if a specific role has access to a specific menu key
 */
export const hasAccess = (role: string, menuKey: string): boolean => {
  const perms = getPermissions();
  const rolePerms = perms[role] || [];
  return rolePerms.includes(menuKey);
};
