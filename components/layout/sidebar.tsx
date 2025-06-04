"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Settings,
  LogOut
} from "lucide-react";
import { navigation } from "@/lib/navigation";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/" && pathname !== path) {
      return false;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className={cn("flex h-full w-64 flex-col bg-slate-900 text-white", className)}>
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg esg-gradient flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ESG Data Hub</h1>
            <p className="text-xs text-slate-400">持続可能性分析</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out relative",
                active
                  ? "bg-primary/20 text-white shadow-md border border-primary/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-105"
              )}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}
              <item.icon className={cn(
                "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                active ? "text-primary" : "text-slate-400 group-hover:text-primary"
              )} />
              <div>
                <div>{item.name}</div>
                {item.description && (
                  <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="border-t border-slate-700 px-4 py-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          クイックアクション
        </h3>
        <div className="space-y-1">
          <Link
            href="/settings"
            className="group flex items-center rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <Settings className="mr-3 h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-primary" />
            設定
          </Link>
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-10 w-10 rounded-full esg-gradient flex items-center justify-center shadow-md">
            <span className="text-sm font-semibold text-white">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              田中 太郎
            </p>
            <p className="text-xs text-slate-400 truncate">
              ESGデータマネージャー
            </p>
          </div>
        </div>
        <button className="flex items-center w-full text-left px-2 py-2 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all duration-200">
          <LogOut className="mr-2 h-3 w-3" />
          サインアウト
        </button>
      </div>
    </div>
  );
} 