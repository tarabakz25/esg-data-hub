"use client"

import Link from "next/link";
import { LogOut, Settings, User, Bell, Github } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui"

export function UserNav() {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <Link href="/signin">
        <Button variant="outline" size="sm">
          ログイン
        </Button>
      </Link>
    )
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "管理者",
      ir_manager: "IR担当",
      auditor: "監査担当",
      viewer: "閲覧者",
    }
    return roleMap[role] || role
  }

  const handleSignOut = () => {
    signOut({ 
      callbackUrl: "/signin",
      redirect: true 
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-transparent hover:border-primary/20 transition-all">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={session.user.image || undefined} 
              alt={session.user.name || "ユーザー"}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(session.user.name || session.user.email || "User")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={session.user.image || undefined} 
                  alt={session.user.name || "ユーザー"}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(session.user.name || session.user.email || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session.user.name || "名前未設定"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                {getRoleBadge((session.user as any)?.role || "viewer")}
              </span>
              {session.user.image?.includes('github') && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Github className="h-3 w-3" />
                  <span>GitHub</span>
                </div>
              )}
            </div>
            {(session.user as any)?.department && (
              <p className="text-xs leading-none text-muted-foreground">
                部署: {(session.user as any)?.department}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>プロフィール</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>設定</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>ログアウト</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 