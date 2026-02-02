"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname() ?? "";
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Murugo Homes
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/properties">
              <Button variant="ghost" size="sm" className={pathname === "/properties" ? "bg-primary/10 text-primary" : ""}>
                All properties
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className={pathname === "/about" ? "bg-primary/10 text-primary" : ""}>
                About us
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm" className={pathname === "/contact" ? "bg-primary/10 text-primary" : ""}>
                Contact us
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {!isDashboard && !isAdmin && (
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {user?.role === "admin" && !isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                    <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[120px]">
                      {user?.profile?.name || user?.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => logout()}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </>
              )}
            </nav>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t bg-background px-4 py-3 flex flex-col gap-2">
            <Link href="/properties" onClick={() => setMobileNavOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                All properties
              </Button>
            </Link>
            <Link href="/about" onClick={() => setMobileNavOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                About us
              </Button>
            </Link>
            <Link href="/contact" onClick={() => setMobileNavOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Contact us
              </Button>
            </Link>
            {isAuthenticated ? (
              <>
                {!isDashboard && !isAdmin && (
                  <Link href="/dashboard" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2" size="sm">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {user?.role === "admin" && !isAdmin && (
                  <Link href="/admin" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  size="sm"
                  onClick={() => { logout(); setMobileNavOpen(false); }}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileNavOpen(false)}>
                  <Button className="w-full justify-start" size="sm">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Guest CTA bar: toggle for renters vs listers */}
      {!isAuthenticated && (
        <div className="border-b bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">I&apos;m</span>
            <Link href="/properties">
              <Button variant="outline" size="sm" className="rounded-full bg-background hover:bg-primary/10 hover:border-primary/30 hover:text-primary">
                Looking for a property
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">or</span>
            <Link href="/register?role=lister">
              <Button size="sm" className="rounded-full bg-[#949DDB] hover:bg-[#949DDB]/90 text-white">
                I want to list properties
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
