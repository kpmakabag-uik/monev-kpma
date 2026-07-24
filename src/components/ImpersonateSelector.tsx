"use client";

import { useState, useEffect, useTransition } from "react";
import { getImpersonableUsers, startImpersonating, stopImpersonating } from "@/app/actions/impersonate";

export default function ImpersonateSelector({ 
  currentUserId,
  isImpersonating
}: { 
  currentUserId?: string;
  isImpersonating: boolean;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Only load users if we are NOT impersonating right now (meaning we are KPMA looking to impersonate)
    if (!isImpersonating) {
      setLoading(true);
      getImpersonableUsers()
        .then(data => setUsers(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isImpersonating]);

  if (isImpersonating) {
    return (
      <div className="w-full bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl mb-4 text-center">
        <p className="text-[10px] text-yellow-200 font-bold uppercase tracking-wider mb-2">Simulasi Aktif</p>
        <button
          onClick={() => {
            startTransition(() => {
              stopImpersonating();
            });
          }}
          disabled={isPending}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? "Kembali..." : "Kembali ke Admin"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 p-3 rounded-xl mb-4">
      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
        Sign In As
      </p>
      {loading ? (
        <div className="text-xs text-blue-200/50">Memuat pengguna...</div>
      ) : (
        <select
          disabled={isPending}
          onChange={(e) => {
            if (e.target.value) {
              startTransition(() => {
                startImpersonating(e.target.value);
              });
            }
          }}
          className="w-full bg-blue-950/50 border border-blue-400/30 text-xs text-blue-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none custom-select"
        >
          <option value="">-- Pilih Pengguna --</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
