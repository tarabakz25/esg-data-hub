import jwt from "jsonwebtoken"
import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
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

// JWT拡張型
interface ExtendedJWT extends JWT {
  role: UserRole
  department: string
  permissions: any
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    GitHub({
      clientId: process.env["GITHUB_CLIENT_ID"] ?? "",
      clientSecret: process.env["GITHUB_CLIENT_SECRET"] ?? "",
      authorization: {
        params: {
          scope: "read:user user:email"
        }
      }
    }),
    Credentials({
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
            where: { email: credentials.email as string }
          })

          if (!user) {
            return null
          }

          // パスワードの検証
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string, 
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
    async jwt({ token, user, account }) {
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
      
      if (user && 'role' in user && 'department' in user) {
        token.role = user['role'] as UserRole
        token.department = user['department'] as string
        
        // JWTトークンに権限情報を埋め込み
        const permissions = ROLE_PERMISSIONS[user['role'] as UserRole] || []
        token.permissions = permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        const extendedSession = session as ExtendedSession
        extendedSession.user.id = token.sub!
        extendedSession.user.role = (token['role'] as UserRole) || "viewer"
        extendedSession.user.department = (token['department'] as string) || ""
        extendedSession.user.permissions = token['permissions']
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
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-please-change-in-production",
}

// NextAuth v5用のハンドラー
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// JWT utility functions
export function signJWT(payload: string | object | Buffer, expiresIn: string = "1h"): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-please-change-in-production"
  return jwt.sign(payload, secret, { expiresIn })
}

export function verifyJWT(token: string) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-please-change-in-production"
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
  return permissions.some((permission: any) => 
    permission.resource === resource && permission.actions.includes(action)
  )
}

// ユーザー作成関数
export async function createUser(userData: {
  email: string
  name: string
  password: string
  role: UserRole
  department?: string
}) {
  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        department: userData.department || "",
      }
    })
    
    return { success: true, user: { id: user.id, email: user.email, name: user.name } }
  } catch (error) {
    console.error("User creation error:", error)
    return { success: false, error: "ユーザー作成に失敗しました" }
  }
} 