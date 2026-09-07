"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import ImpersonateSelector from "@/components/ImpersonateSelector";
import { ALL_MENUS, MenuDefinition } from "@/config/menus";
import { RolePermissions } from "@/lib/permissions";

interface UserData {
  name?: string | null;
  role?: string | null;
  realRole?: string | null;
  id?: string;
}

export default function Sidebar({ user }: { user: UserData | null }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions>({});

  useEffect(() => {
    fetch('/api/permissions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.permissions) {
          setPermissions(data.permissions);
        }
      })
      .catch(console.error);
  }, []);

  const isHrefActive = (href?: string) => {
    if (!href) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/laporan-eksekutif") {
      return pathname === "/laporan-eksekutif" || (pathname.startsWith("/laporan-eksekutif/") && !pathname.startsWith("/laporan-eksekutif/universitas"));
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    // Auto open parent menu if current route is inside it
    for (const menu of ALL_MENUS) {
      if (menu.subMenus?.some(sub => isHrefActive(sub.href))) {
        setOpenMenu(menu.name);
        break;
      }
    }
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const allowedKeys = useMemo(() => {
    if (!user?.role) return [];
    return permissions[user.role] || [];
  }, [user?.role, permissions]);

  // Transform ALL_MENUS to groups based on allowedKeys
  const groups = useMemo(() => {
    const grouped = new Map<string, MenuDefinition[]>();
    
    ALL_MENUS.forEach(menu => {
      // Check if parent or any sublink is allowed
      let hasAccess = allowedKeys.includes(menu.key);
      const allowedSubs = menu.subMenus?.filter(sub => allowedKeys.includes(sub.key));
      
      if (allowedSubs && allowedSubs.length > 0) hasAccess = true;

      if (hasAccess) {
        if (!grouped.has(menu.group)) {
          grouped.set(menu.group, []);
        }
        
        const menuToAdd = { ...menu };
        if (allowedSubs) {
          if (allowedSubs.length === 1) {
            // If only 1 sublink is allowed, render directly as a single menu item
            menuToAdd.name = allowedSubs[0].name;
            menuToAdd.href = allowedSubs[0].href;
            menuToAdd.subMenus = undefined;
          } else {
            menuToAdd.subMenus = allowedSubs;
          }
        }
        
        grouped.get(menu.group)?.push(menuToAdd);
      }
    });

    return Array.from(grouped.entries()).map(([title, links]) => ({
      title,
      links
    }));
  }, [allowedKeys]);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden print:hidden flex items-center justify-between bg-institusi p-3 text-white">
        <div className="font-bold text-base flex items-center gap-2">
          <Image src="/logo-kpma.png" alt="Logo" width={28} height={28} className="bg-white rounded-full p-0.5" />
          MONEV PT
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Content */}
      <div className={`${isOpen ? 'fixed inset-0 z-50 overflow-auto' : 'hidden'} md:flex md:relative md:w-64 bg-institusi text-white h-screen flex-col shadow-xl transition-all duration-300 print:hidden`}>
        
        {/* Header Section - Compact */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          <div className="bg-white p-1.5 rounded-lg shadow-inner flex items-center justify-center shrink-0">
             <Image src="/logo-kpma.png" alt="Logo" width={32} height={32} className="object-contain" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg tracking-tight text-white uppercase leading-tight">MONEV PT</h1>
            <p className="text-[9px] text-blue-200 font-medium tracking-widest uppercase opacity-80">IAPS 5.1 Standard</p>
          </div>
        </div>

        {/* Navigation - Ergonomic & Scroll-Free */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
          <nav className="space-y-4">
            {groups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="px-3 text-[10px] font-black text-blue-300/70 mb-1.5 mt-1 tracking-[0.15em] uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.links.map((link, linkIdx) => {
                    const isActive = isHrefActive(link.href);
                    const hasSubLinks = link.subMenus && link.subMenus.length > 0;
                    const isSubOpen = openMenu === link.name;
                    const hasActiveSublink = hasSubLinks && link.subMenus!.some(sub => isHrefActive(sub.href));
                    
                    return (
                      <div key={linkIdx}>
                        {hasSubLinks ? (
                          <button
                            onClick={() => toggleMenu(link.name)}
                            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-150 group border ${
                              hasActiveSublink 
                                ? "bg-blue-600 text-white border-white/30 shadow-md font-semibold" 
                                : "text-blue-100/80 hover:bg-white/10 hover:text-white border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {link.iconSvg && (
                                <svg className={`w-4 h-4 shrink-0 ${hasActiveSublink ? 'text-white' : 'text-blue-300/60 group-hover:text-blue-200'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: link.iconSvg }}></svg>
                              )}
                              <span className="text-xs tracking-wide truncate">{link.name}</span>
                            </div>
                            <svg 
                              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isSubOpen ? 'rotate-180' : ''}`} 
                              fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        ) : (
                          <Link
                            href={link.href || "#"}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group border ${
                              isActive 
                                ? "bg-blue-600 text-white border-white/30 shadow-md font-semibold" 
                                : "text-blue-100/80 hover:bg-white/10 hover:text-white border-transparent"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {link.iconSvg && (
                              <svg className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-300/60 group-hover:text-blue-200'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: link.iconSvg }}></svg>
                            )}
                            <span className="text-xs tracking-wide truncate">{link.name}</span>
                          </Link>
                        )}

                        {/* Sub Links */}
                        {hasSubLinks && isSubOpen && (
                          <div className="mt-1 ml-6 pl-2 border-l border-white/20 space-y-0.5">
                            {link.subMenus!.map((subLink, subIdx) => {
                              const isSubActive = isHrefActive(subLink.href);
                              return (
                                <Link
                                  key={subIdx}
                                  href={subLink.href || "#"}
                                  className={`block px-2.5 py-1.5 rounded-md text-xs transition-all duration-150 ${
                                    isSubActive 
                                      ? "text-white bg-blue-500/60 font-bold shadow-sm" 
                                      : "text-blue-200/70 hover:bg-white/10 hover:text-white"
                                  }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subLink.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sticky Bottom Account Section - Compact */}
        <div className="mt-auto border-t border-blue-400/20 bg-institusi/60 backdrop-blur-sm p-4 space-y-3 shrink-0">
          
          {user?.realRole === "KPMA" && (
            <ImpersonateSelector 
              currentUserId={user?.id}
              isImpersonating={user?.role !== "KPMA"} 
            />
          )}

          <div className="space-y-0.5">
            <p className="text-sm font-bold text-white tracking-wide truncate">{user?.name}</p>
            <p className="text-xs text-blue-300/70 font-medium truncate uppercase tracking-tighter">Role: {user?.role}</p>
          </div>
          
          <div className="space-y-1 pt-2">
            <Link 
              href="/account/password" 
              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-blue-100/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 11-7.743-5.743L11 3l-2 2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 012-2z"></path></svg>
              Ubah Password
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-red-300 hover:text-red-100 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
