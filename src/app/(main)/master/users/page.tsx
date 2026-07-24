import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import { deleteUser } from "@/app/actions/master";
import SearchInput from "@/components/SearchInput";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "KPMA") {
    redirect("/dashboard");
  }

  const { query } = await searchParams;

  const users = await prisma.user.findMany({
    where: query ? {
      OR: [
        { name: { contains: query } },
        { username: { contains: query } },
        { role: { contains: query } }
      ]
    } : undefined,
    include: { faculty: true, prodi: true },
    orderBy: { role: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-500 mt-1">Daftar akun dan hak akses pada sistem MONEV.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Cari nama, username, role..." />
          <Link href="/master/users/new" className="bg-institusi hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow text-sm font-medium whitespace-nowrap transition-all">
            + Tambah Pengguna
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-semibold">Nama / Username</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Cakupan Wilayah</th>
              <th className="p-4 font-semibold text-right w-40">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm">
                  <div className="font-semibold text-gray-900">{user.name || "-"}</div>
                  <div className="text-gray-500">{user.username}</div>
                </td>
                <td className="p-4 text-sm">
                  <span className="bg-blue-50 text-institusi px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap border border-blue-100">
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {user.prodi?.name ? `Prodi: ${user.prodi.name}` : user.faculty?.name ? `Fakultas: ${user.faculty.name}` : `Universitas`}
                </td>
                <td className="p-4 text-sm text-right">
                  <Link href={`/master/users/${user.id}`} className="text-institusi hover:text-blue-800 font-medium mr-4">Edit</Link>
                  <DeleteButton id={user.id} deleteAction={deleteUser} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
