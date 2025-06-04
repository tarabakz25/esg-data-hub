"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { navigation } from "../../lib/navigation";

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
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-lg border-b border-gray-100">
      <div className="flex-1 px-6 flex justify-between items-center">
        {/* Logo and Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center lg:hidden">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 lg:hidden">ESG Hub</h1>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${active 
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }
                `}
                title={item.description}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Search Section */}
        <div className="flex-1 flex max-w-lg mx-4">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full text-gray-400 focus-within:text-emerald-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <Input
                id="search-field"
                className="block w-full h-10 pl-10 pr-3 py-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
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
          <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100 rounded-lg">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6 text-gray-600" aria-hidden="true" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </Button>

          {/* Profile Section */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">ESG Data Manager</p>
            </div>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">JD</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg lg:hidden z-50">
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
                      flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${active 
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
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