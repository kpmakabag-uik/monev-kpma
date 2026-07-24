"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface Prodi {
  id: string;
  name: string;
  jenjang: string;
}

export default function ProdiSelector({ 
  prodis, 
  selectedId 
}: { 
  prodis: Prodi[], 
  selectedId: string | null 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedProdi = prodis.find(p => p.id === selectedId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newProdiId: string) => {
    setIsOpen(false);
    setSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.set('prodiId', newProdiId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredProdis = prodis.filter(p => 
    `${p.name} ${p.jenjang}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col relative" ref={wrapperRef}>
      <label className="text-xs font-semibold text-gray-500 mb-1">
        Fokus Program Studi:
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 shadow-sm min-w-[250px] cursor-pointer flex justify-between items-center transition-colors hover:border-institusi"
      >
        <span className="truncate pr-4 font-medium">
          {selectedProdi ? `${selectedProdi.name} (${selectedProdi.jenjang})` : "Pilih Program Studi"}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 right-0 w-full min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <input 
              type="text" 
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-institusi focus:border-institusi"
              placeholder="Ketik nama prodi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredProdis.map(p => (
              <li 
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 hover:text-institusi transition-colors ${selectedId === p.id ? 'bg-blue-50 font-bold text-institusi border-l-4 border-institusi' : 'text-gray-700 border-l-4 border-transparent'}`}
              >
                {p.name} <span className="text-xs text-gray-500 ml-1 font-normal">({p.jenjang})</span>
              </li>
            ))}
            {filteredProdis.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500 text-center italic">
                Prodi tidak ditemukan.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
