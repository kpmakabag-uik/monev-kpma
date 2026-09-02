"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ALL_MENUS } from "@/config/menus";
import { RolePermissions } from "@/lib/permissions";

export default function RouteGuard({ children, userRole }: { children: React.ReactNode, userRole?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    if (!userRole) {
      setIsAuthorized(false);
      return;
    }

    // Always allow dashboard as a safe fallback for all authenticated users to prevent infinite loops
    if (pathname === "/dashboard") {
      setIsAuthorized(true);
      return;
    }

    fetch('/api/permissions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.permissions) {
          const permissions = data.permissions as RolePermissions;
          const allowedKeys = permissions[userRole] || [];

          // Find which menu this pathname belongs to
          let matchedKey: string | null = null;
          
          for (const menu of ALL_MENUS) {
            if (menu.href && pathname.startsWith(menu.href) && menu.href !== "/dashboard") {
              matchedKey = menu.key;
            }
            if (menu.subMenus) {
              for (const sub of menu.subMenus) {
                if (sub.href && pathname.startsWith(sub.href)) {
                  matchedKey = sub.key;
                }
              }
            }
          }

          // If the route is not part of any defined menu, we allow it (e.g. profile page, etc.)
          // Alternatively, if we strict-match, we block. We will strict match if matchedKey is found.
          if (matchedKey) {
            if (allowedKeys.includes(matchedKey)) {
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
              router.push("/dashboard");
            }
          } else {
            // Not a mapped menu route, allow by default
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(true); // Fail open if API fails, sidebar will still hide it
        }
      })
      .catch((e) => {
        console.error("Failed to check permissions", e);
        setIsAuthorized(true);
      });
  }, [pathname, userRole, router]);

  if (isAuthorized === null) {
    return <div className="p-10 flex justify-center text-gray-500">Memeriksa Hak Akses...</div>;
  }

  if (isAuthorized === false) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
