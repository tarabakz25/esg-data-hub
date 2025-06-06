"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserNav } from "../dashboard/user-nav";

export function TopBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/" && pathname !== path) {
      return false;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-md border-b border-gray-200">
      <div className="flex-1 px-6 flex justify-between items-center">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg esg-gradient flex items-center justify-center lg:hidden shadow-sm">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <div className="lg:hidden">
              <h1 className="text-lg font-bold text-gray-900">ESG Hub</h1>
              <p className="text-xs text-gray-500">Sustainability Analytics</p>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-theme"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
        </div>



        {/* Search Section */}
        <div className="flex-1 flex max-w-lg mx-4">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full text-gray-400 focus-within:text-primary">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <Input
                id="search-field"
                className="block w-full h-10 pl-10 pr-3 py-2 border-border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary bg-muted transition-theme"
                placeholder="Search ESG data, reports, KPIs..."
                type="search"
                name="search"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="ml-4 flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2 hover:bg-primary/10 rounded-lg transition-theme">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6 text-gray-600" aria-hidden="true" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-error ring-2 ring-white animate-pulse"></span>
          </Button>

          {/* User Navigation */}
          <UserNav />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl lg:hidden z-50">
          <nav className="px-6 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-theme relative
                      ${active 
                        ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                        : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
} 