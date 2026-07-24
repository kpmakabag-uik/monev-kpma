import prisma from "@/lib/prisma";
import DocumentForm from "./DocumentForm";
import DeleteButton from "@/components/DeleteButton";
import { deleteDocument } from "@/app/actions/master";

export default async function DocumentList({ type, title }: { type: "PERATURAN" | "INSTRUMEN", title: string }) {
  const documents = await prisma.document.findMany({ 
    where: { type },
    orderBy: { createdAt: "desc" } 
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dokumen {title}</h1>
        <p className="text-gray-500 text-sm mt-1">Mengelola dokumen {title.toLowerCase()} untuk MONEV</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <span>{type === "PERATURAN" ? "⚖️" : "📄"}</span> Daftar Dokumen {title}
          </h2>
          <DocumentForm type={type} title={title} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-1/3">Judul Dokumen</th>
                <th className="px-6 py-4 w-1/3">Keterangan</th>
                <th className="px-6 py-4 text-center">File</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada dokumen {title.toLowerCase()} yang ditambahkan.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{doc.title}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.description || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      {doc.fileUrl ? (
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-200 hover:bg-green-100 transition-colors"
                        >
                          📥 Unduh / Buka
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Tidak ada file</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <DocumentForm type={type} title={title} initialData={doc} />
                      <DeleteButton id={doc.id} deleteAction={deleteDocument} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
