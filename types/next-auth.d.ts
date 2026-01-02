// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      companyId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    // FIX: Make this optional to satisfy the PrismaAdapter type check
    role?: string 
    companyId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id: string
    companyId?: string | null
  }
}