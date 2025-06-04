import jwt from "jsonwebtoken"
import NextAuth, { type AuthOptions } from "next-auth"  
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/utils/db"
import { UserRole, ROLE_PERMISSIONS } from "@/types/auth"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

// 拡張したセッション型を定義
interface ExtendedSession extends Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
    department: string
    permissions: any
  }
}

const authConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [  
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 本来はbcryptでパスワードハッシュを検証
        // 今回は簡易実装として固定ユーザー
        const mockUsers = [
          {
            id: "1",
            email: "admin@example.com",
            name: "管理者",
            role: "admin" as UserRole,
            department: "IT",
          },
          {
            id: "2", 
            email: "ir@example.com",
            name: "IR担当者",
            role: "ir_manager" as UserRole,
            department: "IR",
          },
          {
            id: "3",
            email: "auditor@example.com", 
            name: "監査担当者",
            role: "auditor" as UserRole,
            department: "監査室",
          }
        ]

        const user = mockUsers.find(u => u.email === credentials.email)
        if (user && credentials.password === "password") {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User & { role?: UserRole; department?: string } }) {
      if (user) {
        token.role = user.role
        token.department = user.department
        
        // JWTトークンに権限情報を埋め込み
        const permissions = ROLE_PERMISSIONS[user.role as UserRole] || []
        token.permissions = permissions
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT & { role?: UserRole; department?: string; permissions?: any } }): Promise<ExtendedSession> {
      if (token && session.user) {
        const extendedSession = session as ExtendedSession
        extendedSession.user.id = token.sub!
        extendedSession.user.role = token.role as UserRole
        extendedSession.user.department = token.department as string
        extendedSession.user.permissions = token.permissions as any
        return extendedSession
      }
      return session as ExtendedSession
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// JWT utility functions
export function signJWT(payload: string | object | Buffer, expiresIn: string = "1h"): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret"
  return jwt.sign(payload, secret, { expiresIn } as any)
}

export function verifyJWT(token: string) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret"
    return jwt.verify(token, secret)
  } catch (error) {
    return null
  }
}

// Permission checking utility
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: "read" | "write" | "delete" | "approve"
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  
  return permissions.some(
    (permission) =>
      (permission.resource === "*" || permission.resource === resource) &&
      permission.action === action
  )
} 