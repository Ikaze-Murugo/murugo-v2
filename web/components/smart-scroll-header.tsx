"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function SmartScrollHeader() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname() ?? "";

  // Don't show on auth pages or desktop
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")) {
    return null;
  }

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < 5) {
        ticking = false;
        return;
      }

      setScrollDirection(scrollY > lastScrollY ? "down" : "up");
      setLastScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Logo Bar - Shows when scrolling up or at top */}
      <header
        className={`md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-transform duration-300 ${
          scrollDirection === "down" && lastScrollY > 50 ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="text-lg font-bold text-primary">
            Murugo Homes
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard/profile">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search Bar - Shows when scrolling down */}
      <div
        className={`md:hidden fixed left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-transform duration-300 ${
          scrollDirection === "down" && lastScrollY > 50 ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ top: 0 }}
      >
        <div className="px-4 py-2">
          <Link href="/properties" className="block">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Search properties...</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden */}
      <div className="h-14 md:hidden" />
    </>
  );
}
