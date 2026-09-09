import { auth } from "@/auth";
import InteractiveGuide from "./InteractiveGuide";

export const metadata = {
  title: "Panduan Interaktif Penggunaan Sistem | SiMONEV KPMA UIKA Bogor",
  description: "Pedoman interaktif penggunaan platform Monitoring dan Evaluasi Mutu Akademik Internal berbasis IAPS 5.1 Universitas Ibn Khaldun Bogor.",
};

export default async function PanduanPage() {
  const session = await auth();
  const currentUserRole = session?.user?.role || "GKM";
  const currentUserName = session?.user?.name || "Pengguna SiMONEV";

  return (
    <div className="w-full space-y-6">
      <InteractiveGuide
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
      />
    </div>
  );
}
