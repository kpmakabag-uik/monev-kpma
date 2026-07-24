"use client";

import { useTransition } from "react";

export default function DeleteButton({ id, deleteAction }: { id: string, deleteAction: (id: string) => Promise<{ error?: string } | void> }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.")) {
      startTransition(async () => {
        const res = await deleteAction(id);
        if (res?.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className={`text-red-500 font-medium hover:text-red-700 transition-colors ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isPending ? "Hapus..." : "Hapus"}
    </button>
  );
}
