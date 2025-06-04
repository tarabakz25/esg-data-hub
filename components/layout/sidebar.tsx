import Link from "next/link";
import { cn } from "@/app/lib/utils";
import { 
  BarChart3, 
  Settings,
  ClipboardCheck,
  Activity,
  LogOut
} from "lucide-react";
import { navigation } from "@/app/lib/navigation";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("flex h-full w-64 flex-col bg-slate-900 text-white", className)}>
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ESG Data Hub</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 ease-in-out hover:scale-105"
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-400" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-slate-700 px-4 py-4">
        <Link
          href="/settings"
          className="group flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
        >
          <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400" />
          Settings
        </Link>
      </div>

      {/* User Section */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              John Doe
            </p>
            <p className="text-xs text-slate-400 truncate">
              ESG Data Manager
            </p>
          </div>
        </div>
        <button className="flex items-center w-full text-left px-2 py-1 text-xs text-slate-400 hover:text-slate-300 transition-colors">
          <LogOut className="mr-2 h-3 w-3" />
          Sign out
        </button>
      </div>
    </div>
  );
} 