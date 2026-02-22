"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, Heart, User } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const { isAuthenticated } = useAuth();

  // Don't show on auth pages or desktop
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/properties", icon: Search, label: "Search" },
    ...(isAuthenticated
      ? [
          { href: "/messages", icon: MessageCircle, label: "Messages" },
          { href: "/favorites", icon: Heart, label: "Favorites" },
          { href: "/dashboard/profile", icon: User, label: "Profile" },
        ]
      : [
          { href: "/properties", icon: Search, label: "Browse" },
          { href: "/about", icon: User, label: "About" },
        ]),
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${active ? "stroke-[3]" : "stroke-[1.5]"}`} />
                  {active && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${active ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
