import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"
import "./globals.css"

export const metadata = {
  title: 'MONEV Mutu Perguruan Tinggi',
  description: 'Aplikasi Monitoring dan Evaluasi Mutu PT mengacu IAPS 5.1',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
