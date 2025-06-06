"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { 
  BarChart3, 
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Bell,
  Zap
} from "lucide-react";
import { navigation } from "@/lib/navigation";

interface SidebarProps {
  className?: string;
}

// ダミーのユーザー情報とプログレス
const mockUser = {
  name: "田中 太郎",
  role: "IR Manager",
  department: "IR部",
  avatar: "TT"
};

const mockProgress = {
  current: 3,
  total: 5,
  steps: [
    { name: "データ登録", completed: true },
    { name: "マッピング", completed: true },
    { name: "チェック", completed: true },
    { name: "レポート", completed: false },
    { name: "承認", completed: false }
  ]
};

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/" && pathname !== path) {
      return false;
    }
    return pathname.startsWith(path);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const hasActiveSubItem = (item: any) => {
    return item.subItems?.some((subItem: any) => isActive(subItem.href));
  };

  return (
    <div className={cn("flex h-full w-72 flex-col bg-slate-900 text-white", className)}>
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ESG Data Hub</h1>
            <p className="text-xs text-slate-400">持続可能性分析プラットフォーム</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="border-b border-slate-700 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-semibold">
            {mockUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{mockUser.name}</p>
            <p className="text-xs text-slate-400 truncate">{mockUser.role}</p>
          </div>
          <Bell className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="border-b border-slate-700 px-6 py-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          ワークフロー進捗
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">進捗状況</span>
            <span className="text-blue-400">{mockProgress.current}/{mockProgress.total}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(mockProgress.current / mockProgress.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            {mockProgress.steps.map((step, index) => (
              <div key={step.name} className="flex flex-col items-center">
                <div className={cn(
                  "w-2 h-2 rounded-full mb-1",
                  step.completed ? "bg-green-500" : index === mockProgress.current ? "bg-blue-500" : "bg-slate-600"
                )} />
                <span className="text-xs">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const expanded = expandedItems.includes(item.name);
          const hasActiveChild = hasActiveSubItem(item);

          return (
            <div key={item.name}>
              <div
                className={cn(
                  "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out relative cursor-pointer",
                  active || hasActiveChild
                    ? "bg-primary/20 text-white shadow-md border border-primary/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
                onClick={() => hasSubItems ? toggleExpanded(item.name) : null}
              >
                {(active || hasActiveChild) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  active || hasActiveChild ? "text-primary" : "text-slate-400 group-hover:text-primary"
                )} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full flex items-center">
                          <Zap className="h-3 w-3 mr-1" />
                          {item.badge}
                        </span>
                      )}
                      {hasSubItems && (
                        expanded ? 
                          <ChevronDown className="h-4 w-4 text-slate-400" /> : 
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                  )}
                </div>
              </div>

              {/* Sub Items */}
              {hasSubItems && expanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const subActive = isActive(subItem.href);
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "block rounded-lg px-4 py-2 text-sm transition-all duration-200",
                          subActive
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-300"
                        )}
                      >
                        <div>{subItem.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{subItem.description}</div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
          <button
            className="group flex items-center rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 w-full"
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-red-400" />
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
} 