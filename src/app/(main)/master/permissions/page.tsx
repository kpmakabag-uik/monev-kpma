"use client";

import React, { useState, useEffect } from "react";
import { RolePermissions } from "@/lib/permissions";
import { MenuDefinition } from "@/config/menus";

const ROLES = ["KPMA", "GPM", "GKM", "PIMPINAN_FAKULTAS", "PIMPINAN_UNIVERSITAS"];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<RolePermissions>({});
  const [menus, setMenus] = useState<MenuDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/permissions");
      const data = await res.json();
      if (data.success) {
        setPermissions(data.permissions);
        setMenus(data.menus);
      }
    } catch (error) {
      alert("Gagal memuat data hak akses.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (role: string, menuKey: string) => {
    setPermissions(prev => {
      const currentRolePerms = prev[role] || [];
      const newRolePerms = currentRolePerms.includes(menuKey)
        ? currentRolePerms.filter(k => k !== menuKey)
        : [...currentRolePerms, menuKey];
      
      return {
        ...prev,
        [role]: newRolePerms
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.error || "Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Memuat konfigurasi hak akses...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pengaturan Hak Akses (RBAC)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur visibilitas menu dan hak akses untuk setiap peran pengguna di dalam sistem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 shadow-sm transition-colors"
          >
            Batal / Muat Ulang
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
          </button>
        </div>
      </div>

      {/* Main Content - Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4 w-64 border-r border-gray-200 sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                  Modul / Menu
                </th>
                {ROLES.map(role => (
                  <th key={role} className="p-4 text-center min-w-[140px]">
                    {role.replace("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from(new Set(menus.map(m => m.group))).map((groupName) => {
                const groupMenus = menus.filter(m => m.group === groupName);
                return (
                  <React.Fragment key={groupName}>
                    {/* Category Divider */}
                    <tr className="bg-slate-100 border-y border-slate-200">
                      <td colSpan={1 + ROLES.length} className="py-2 px-4 font-bold text-xs text-slate-700 tracking-wider uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-institusi"></span>
                        KATEGORI: {groupName}
                      </td>
                    </tr>

                    {groupMenus.map((menu) => (
                      <React.Fragment key={menu.key}>
                        {/* Parent Menu Row */}
                        <tr className="hover:bg-gray-50/50 transition-colors bg-white">
                          <td className="p-3.5 border-r border-gray-200 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e7eb]">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 text-sm">{menu.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono mt-0.5">{menu.key}</span>
                            </div>
                          </td>
                          {ROLES.map(role => {
                            const isChecked = permissions[role]?.includes(menu.key) || false;
                            const disabled = role === "KPMA"; // Prevent removing admin access to prevent lockout
                            return (
                              <td key={role} className="p-3 text-center align-middle">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={disabled}
                                  onChange={() => handleToggle(role, menu.key)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-40 cursor-pointer"
                                />
                              </td>
                            );
                          })}
                        </tr>
                        
                        {/* Submenus Rows */}
                        {menu.subMenus && menu.subMenus.map((sub) => (
                          <tr key={sub.key} className="hover:bg-gray-50/50 transition-colors bg-gray-50/30">
                            <td className="p-3 border-r border-gray-200 sticky left-0 bg-gray-50/30 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                              <div className="flex flex-col pl-6">
                                <div className="flex items-center gap-2">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                  <span className="font-medium text-gray-700 text-sm">{sub.name}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono mt-0.5 pl-5">{sub.key}</span>
                              </div>
                            </td>
                            {ROLES.map(role => {
                              const isChecked = permissions[role]?.includes(sub.key) || false;
                              const disabled = role === "KPMA";
                              return (
                                <td key={role} className="p-3 text-center align-middle">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={disabled}
                                    onChange={() => handleToggle(role, sub.key)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-40 cursor-pointer"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
        <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p>
          <strong>Informasi:</strong> Hak akses untuk role <strong>KPMA</strong> sengaja dikunci agar tidak secara tidak sengaja terhapus, yang dapat menyebabkan Anda kehilangan akses ke menu pengaturan ini.
        </p>
      </div>
    </div>
  );
}
