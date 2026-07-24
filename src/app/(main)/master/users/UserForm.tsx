"use client";

import { useState } from "react";

type Faculty = { id: string; name: string };
type Prodi = { id: string; name: string; facultyId: string };

interface UserData {
  id: string;
  name: string | null;
  username: string | null;
  role: string | null;
  facultyId: string | null;
  prodiId: string | null;
}

export default function UserForm({
  action,
  user,
  faculties,
  prodis,
  submitLabel = "Simpan",
}: {
  action: (formData: FormData) => Promise<void | { error?: string }>;
  user?: UserData | null;
  faculties: Faculty[];
  prodis: Prodi[];
  submitLabel?: string;
}) {
  const [selectedFaculty, setSelectedFaculty] = useState(user?.facultyId || "");
  const [selectedProdi, setSelectedProdi] = useState(user?.prodiId || "");

  // Filter prodis based on selected faculty
  const filteredProdis = selectedFaculty 
    ? prodis.filter(p => p.facultyId === selectedFaculty)
    : [];

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFaculty(e.target.value);
    setSelectedProdi(""); // Reset prodi when faculty changes
  };
  const handleAction = async (formData: FormData) => {
    const result = await action(formData);
    if (result && 'error' in result) {
      alert(result.error);
    }
  };

  return (
    <form action={handleAction} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
        <input 
          required 
          name="name" 
          defaultValue={user?.name || ""} 
          type="text" 
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi" 
          placeholder="Nama Lengkap" 
        />
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Username Login</label>
        <input 
          required 
          name="username" 
          defaultValue={user?.username || ""} 
          type="text" 
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi" 
          placeholder="Username unik" 
        />
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {user ? "Password (Kosongkan bila tidak diubah)" : "Password"}
        </label>
        <input 
          required={!user} 
          name="password" 
          type="password" 
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi" 
          placeholder={user ? "Ketik kata sandi baru..." : "Minimal 6 karakter"} 
        />
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Hak Akses Role</label>
        <select 
          required 
          name="role" 
          defaultValue={user?.role || "GKM"} 
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi"
        >
          <option value="KPMA">Admin (KPMA)</option>
          <option value="GPM">Auditor (GPM)</option>
          <option value="GKM">Prodi (GKM)</option>
          <option value="PIMPINAN_FAKULTAS">Pimpinan Fakultas</option>
          <option value="PIMPINAN_UNIVERSITAS">Pimpinan Universitas</option>
        </select>
      </div>
      
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas Akses</label>
        <select 
          name="facultyId" 
          value={selectedFaculty} 
          onChange={handleFacultyChange}
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi"
        >
          <option value="">-- Semua / Tidak Ada --</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Prodi Akses</label>
        <select 
          name="prodiId" 
          value={selectedProdi}
          onChange={(e) => setSelectedProdi(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-institusi focus:ring-1 focus:ring-institusi"
        >
          <option value="">-- Semua / Tidak Ada --</option>
          {filteredProdis.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="pt-4 col-span-2 flex justify-end">
        <button type="submit" className="bg-institusi text-white px-6 py-2.5 rounded-lg shadow-sm font-medium hover:bg-blue-800 transition-all">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
