import { z } from "zod"

export const UserRoleSchema = z.enum(["admin", "ir_manager", "auditor", "viewer"])
export type UserRole = z.infer<typeof UserRoleSchema>

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  department: z.string().optional(),
  image: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type User = z.infer<typeof UserSchema>

export const SessionSchema = z.object({
  user: UserSchema,
  expires: z.string(),
})
export type Session = z.infer<typeof SessionSchema>

export const PermissionSchema = z.object({
  resource: z.string(),
  action: z.enum(["read", "write", "delete", "approve"]),
})
export type Permission = z.infer<typeof PermissionSchema>

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: "*", action: "read" },
    { resource: "*", action: "write" },
    { resource: "*", action: "delete" },
    { resource: "*", action: "approve" },
  ],
  ir_manager: [
    { resource: "data", action: "read" },
    { resource: "data", action: "write" },
    { resource: "reports", action: "read" },
    { resource: "reports", action: "write" },
    { resource: "workflow", action: "approve" },
  ],
  auditor: [
    { resource: "data", action: "read" },
    { resource: "reports", action: "read" },
    { resource: "audit", action: "read" },
    { resource: "audit", action: "write" },
  ],
  viewer: [
    { resource: "data", action: "read" },
    { resource: "reports", action: "read" },
  ],
} 