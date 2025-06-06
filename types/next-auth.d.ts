import { DefaultSession } from "next-auth"
import { UserRole } from "./auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      department: string
      permissions: any
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    department: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    department: string
    permissions: any
  }
} 