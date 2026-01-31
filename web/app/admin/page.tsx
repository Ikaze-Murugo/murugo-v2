"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { propertyApi } from "@/lib/api/endpoints";
import { Shield, Building2, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data: propertiesData } = useQuery({
    queryKey: ["admin-stats-properties"],
    queryFn: () => propertyApi.getAll({ limit: 1, page: 1 }),
    enabled: isAuthenticated && user?.role === "admin",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, user?.role, router]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  const totalProperties = propertiesData?.pagination?.total ?? 0;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform stats and overview
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total properties</p>
                <p className="text-2xl font-bold mt-1">{totalProperties}</p>
              </div>
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <Link
              href="/properties"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              View listings
            </Link>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-2xl font-bold mt-1">—</p>
              </div>
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              User stats coming later
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Views / engagement</p>
                <p className="text-2xl font-bold mt-1">—</p>
              </div>
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Analytics coming later
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending approvals</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              No approval workflow yet
            </p>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-2">Quick actions</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Listers can add properties from the dashboard. Everyone can view and contact. This admin view shows platform stats only.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4"
            >
              Browse properties
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-9 px-4"
            >
              My dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
