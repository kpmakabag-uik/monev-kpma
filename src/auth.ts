import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

declare module "next-auth" {
  interface User {
    role?: string | null
    username?: string | null
    facultyId?: string | null
    prodiId?: string | null
    realRole?: string | null
  }

  interface Session {
    user: {
      id: string
      role?: string | null
      username?: string | null
      facultyId?: string | null
      prodiId?: string | null
      realRole?: string | null
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        })

        if (!user || !user.password) return null

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            facultyId: user.facultyId,
            prodiId: user.prodiId,
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
        token.facultyId = user.facultyId
        token.prodiId = user.prodiId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string | null
        session.user.username = token.username as string | null
        session.user.facultyId = token.facultyId as string | null
        session.user.prodiId = token.prodiId as string | null
        session.user.realRole = token.role as string | null

        // Impersonation logic
        if (token.role === "KPMA") {
          try {
            const cookieStore = await cookies();
            const impersonatedId = cookieStore.get("impersonate_user_id")?.value;
            if (impersonatedId) {
              const impUser = await prisma.user.findUnique({ where: { id: impersonatedId } });
              if (impUser) {
                session.user.id = impUser.id;
                session.user.role = impUser.role;
                session.user.username = impUser.username;
                session.user.facultyId = impUser.facultyId;
                session.user.prodiId = impUser.prodiId;
                // realRole remains KPMA
              }
            }
          } catch (e) {
            console.error("Failed to impersonate:", e);
          }
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
})

