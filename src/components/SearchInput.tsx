"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export default function SearchInput({ placeholder = "Cari..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(searchParams.get("query") || "");

  // Debounce the search input to avoid making too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (term) {
          params.set("query", term);
        } else {
          params.delete("query");
        }
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [term, pathname, router, searchParams]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="block w-full sm:w-64 p-2 pl-9 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        placeholder={placeholder}
      />
      {isPending && (
         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
         </div>
      )}
    </div>
  );
}
