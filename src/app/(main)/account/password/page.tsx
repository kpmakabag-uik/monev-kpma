"use client";

import { useState } from "react";
import { changePassword } from "@/app/actions/auth";

export default function ChangePasswordPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.success });
      (e.target as HTMLFormElement).reset();
    } else if (result.error) {
      setMessage({ type: "error", text: result.error });
    }
    setIsSaving(false);
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#1f5791] px-6 py-4 text-white">
          <h2 className="text-xl font-bold">Ganti Password</h2>
          <p className="text-xs text-blue-100 mt-1">Gunakan password yang kuat untuk keamanan akun Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Password Lama</label>
            <input
              type="password"
              name="oldPassword"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Password Baru</label>
            <input
              type="password"
              name="newPassword"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="••••••••"
            />
            <p className="text-[10px] text-gray-400">Minimal 6 karakter.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Konfirmasi Password Baru</label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[#1f5791] hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {isSaving ? "Memproses..." : "Perbarui Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
