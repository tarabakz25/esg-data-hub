import jwt from "jsonwebtoken"
import NextAuth, { type AuthOptions } from "next-auth"  
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/utils/db"
import { UserRole, ROLE_PERMISSIONS } from "@/types/auth"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"
import bcrypt from "bcryptjs"

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

export const authConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
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

        try {
          // データベースからユーザーを検索
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          // パスワードの検証
          // 注意: この実装では、Userテーブルにpasswordとrole、departmentフィールドが必要です
          // 本番環境ではパスワードはbcryptでハッシュ化して保存する必要があります
          const isPasswordValid = await bcrypt.compare(
            credentials.password, 
            user.password || ""
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role as UserRole || "viewer",
            department: user.department || "",
          }
        } catch (error) {
          console.error("認証エラー:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // GitHubログインの場合、ユーザーが存在しない場合は作成
      if (account?.provider === "github") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // 新規GitHubユーザーを作成（デフォルトはviewer権限）
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                image: user.image,
                role: "viewer",
                department: "",
                // GitHubユーザーはパスワードなし
              }
            })
          }
        } catch (error) {
          console.error("GitHub ユーザー作成エラー:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }: { token: JWT; user?: User & { role?: UserRole; department?: string }; account?: any }) {
      // GitHubログインの場合、DBからユーザー情報を取得
      if (account?.provider === "github" || !token.role) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! }
          })
          
          if (dbUser) {
            token.role = dbUser.role as UserRole
            token.department = dbUser.department || ""
            
            // JWTトークンに権限情報を埋め込み
            const permissions = ROLE_PERMISSIONS[dbUser.role as UserRole] || []
            token.permissions = permissions
          }
        } catch (error) {
          console.error("JWT callback error:", error)
        }
      }
      
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
        extendedSession.user.role = token.role as UserRole || "viewer"
        extendedSession.user.department = token.department as string || ""
        extendedSession.user.permissions = token.permissions as any
        return extendedSession
      }
      return session as ExtendedSession
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// NextAuth v4用
const nextAuthHandler = NextAuth(authConfig)

// ハンドラーを手動で作成
export const handlers = {
  GET: nextAuthHandler,
  POST: nextAuthHandler,
}

// NextAuth v4用のメソッド
export const auth = () => nextAuthHandler
export const signIn = () => nextAuthHandler  
export const signOut = () => nextAuthHandler

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

// ユーザー作成用ヘルパー関数（管理者用）
export async function createUser(userData: {
  email: string
  name: string
  password: string
  role: UserRole
  department?: string
}) {
  const hashedPassword = await bcrypt.hash(userData.password, 12)
  
  return await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      role: userData.role,
      department: userData.department || "",
    }
  })
} 