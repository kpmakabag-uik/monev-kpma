"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import ImpersonateSelector from "@/components/ImpersonateSelector";

interface UserData {
  name?: string | null;
  role?: string | null;
  realRole?: string | null;
  id?: string;
}

interface NavSubLink {
  name: string;
  href: string;
}

interface NavLink {
  name: string;
  href?: string;
  icon: React.ReactNode;
  subLinks?: NavSubLink[];
}

interface NavGroup {
  title: string;
  links: NavLink[];
}

export default function Sidebar({ user }: { user: UserData | null }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const getNavGroups = () => {
    const role = user?.role;
    
    const mainLinks: NavLink[] = [
      { 
        name: "Dashboard", 
        href: "/dashboard", 
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> 
      }
    ];

    if (role !== "PIMPINAN_UNIVERSITAS" && role !== "PIMPINAN_FAKULTAS") {
      mainLinks.push({ 
        name: "Pengisian MONEV", 
        href: "/monev", 
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> 
      });
    }

    if (role === "KPMA") {
      mainLinks.push({
        name: "Laporan & Analisis",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
        subLinks: [
          { name: "Laporan MONEV", href: "/laporan" },
          { name: "Analisis MONEV", href: "/master/analisis" },
        ]
      });
    } else {
      mainLinks.push({ 
        name: "Laporan MONEV", 
        href: "/laporan", 
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> 
      });
    }

    const groups: NavGroup[] = [
      {
        title: "MAIN",
        links: mainLinks
      },
      {
        title: "REGULASI",
        links: [
          { 
            name: "Peraturan", 
            href: "/regulasi/peraturan", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg> 
          },
          { 
            name: "Panduan Instrumen", 
            href: "/regulasi/instrumen", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> 
          },
        ]
      }
    ];

    if (role === "KPMA") {
      groups.push({
        title: "MASTER DATA",
        links: [
          { 
            name: "Siklus Akademik", 
            href: "/master/cycles", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 
          },
          { 
            name: "Data Organisasi", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
            subLinks: [
              { name: "Fakultas", href: "/master/faculty" },
              { name: "Program Studi", href: "/master/prodi" },
              { name: "Jenjang", href: "/master/jenjang" },
            ]
          },
          { 
            name: "Data Instrumen", 
            href: "/master/instruments", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> 
          },
          { 
            name: "Data Pengguna", 
            href: "/master/users", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> 
          },
        ]
      });

      groups.push({
        title: "KONFIGURASI",
        links: [
          { 
            name: "Pengaturan Umum", 
            href: "/master/pengaturan", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> 
          },
          { 
            name: "Penyimpanan", 
            href: "/master/settings", 
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg> 
          },
        ]
      });
    }

    return groups;
  };

  const navGroups = getNavGroups();

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden flex items-center justify-between bg-institusi p-4 text-white">
        <div className="font-bold text-lg flex items-center gap-2">
          <Image src="/logo-kpma.png" alt="Logo" width={32} height={32} className="bg-white rounded-full p-0.5" />
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

      {/* Sidebar Container */}
      <div className={`${isOpen ? 'fixed inset-0 z-50 overflow-auto' : 'hidden'} md:flex md:relative md:w-64 bg-institusi text-white h-screen flex-col shadow-xl transition-all duration-300`}>
        
        {/* Header Section */}
        <div className="flex items-center gap-4 px-6 py-8">
          <div className="bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
             <Image src="/logo-kpma.png" alt="Logo" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white uppercase">MONEV PT</h1>
            <p className="text-[10px] text-blue-200 font-medium tracking-widest uppercase opacity-80">IAPS 5.1 Standard</p>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <nav className="space-y-8 py-2">
            {navGroups.map((group) => (
              <div key={group.title}>
                {group.title !== "MAIN" && (
                  <h3 className="px-4 text-[11px] font-black text-blue-300/60 mb-4 tracking-[0.2em] uppercase">{group.title}</h3>
                )}
                <div className="space-y-1.5">
                  {group.links.map((link) => {
                    const isSubNav = !!link.subLinks;
                    const isActive = link.href ? pathname.startsWith(link.href) && (link.href !== "/dashboard" || pathname === "/dashboard") : false;
                    const isMenuOpen = openMenu === link.name;
                    // Check if any sublink is active to highlight parent
                    const hasActiveSublink = isSubNav && link.subLinks!.some(sub => pathname.startsWith(sub.href));

                    return (
                      <div key={link.name}>
                        {isSubNav ? (
                          <button
                            onClick={() => toggleMenu(link.name)}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group border-2 ${
                              hasActiveSublink 
                                ? "bg-blue-600 text-white border-white/40 shadow-lg" 
                                : "text-blue-100/70 hover:bg-white/10 hover:text-white border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <span className={`${hasActiveSublink ? 'text-white' : 'text-blue-300/50 group-hover:text-blue-200'}`}>
                                {link.icon}
                              </span>
                              <span className={`text-sm tracking-wide ${hasActiveSublink ? 'font-bold' : 'font-medium'}`}>{link.name}</span>
                            </div>
                            <svg className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </button>
                        ) : (
                          <Link
                            href={link.href!}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group border-2 ${
                              isActive 
                                ? "bg-blue-600 text-white border-white/40 shadow-lg" 
                                : "text-blue-100/70 hover:bg-white/10 hover:text-white border-transparent"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span className={`${isActive ? 'text-white' : 'text-blue-300/50 group-hover:text-blue-200'}`}>
                              {link.icon}
                            </span>
                            <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{link.name}</span>
                          </Link>
                        )}
                        
                        {/* Sub Menu Items */}
                        {isSubNav && isMenuOpen && (
                          <div className="mt-1 ml-11 space-y-1">
                            {link.subLinks!.map((sub) => {
                              const isSubActive = pathname.startsWith(sub.href);
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    isSubActive 
                                      ? "text-white bg-blue-500/50 font-bold" 
                                      : "text-blue-200/70 hover:bg-white/10 hover:text-white"
                                  }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  {sub.name}
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

        {/* Sticky Bottom Account Section */}
        <div className="mt-auto border-t border-blue-400/20 bg-institusi/50 backdrop-blur-sm p-6 space-y-4">
          
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
