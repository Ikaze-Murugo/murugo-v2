"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi, type AdminUser } from "@/lib/api/endpoints";
import { Shield, Building2, Users, BarChart3, CheckCircle, Star, Search, UserCog } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TABS = [
  { id: "overview", label: "Overview", href: "/admin" },
  { id: "approvals", label: "Approve properties", href: "/admin?tab=approvals" },
  { id: "featured", label: "Feature properties", href: "/admin?tab=featured" },
  { id: "users", label: "Manage users", href: "/admin?tab=users" },
] as const;

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "seeker", label: "Seeker" },
  { value: "lister", label: "Lister" },
  { value: "admin", label: "Admin" },
];

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [searchDebounce, setSearchDebounce] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", userRoleFilter, searchDebounce, userPage],
    queryFn: () =>
      adminApi.getUsers({
        role: userRoleFilter || undefined,
        search: searchDebounce || undefined,
        page: userPage,
        limit: 15,
      }),
    enabled: isAuthenticated && user?.role === "admin" && tab === "users",
  });

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(userSearch.trim()), 400);
    return () => clearTimeout(t);
  }, [userSearch]);

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

  const totalProperties = stats?.totalProperties ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;
  const totalViews = stats?.totalViews ?? 0;
  const pendingApprovals = stats?.pendingApprovals ?? 0;
  const users = usersData?.users ?? [];
  const usersPagination = usersData?.pagination;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform stats and user management</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
          {TABS.map((t) => (
            <Link key={t.id} href={t.href}>
              <Button
                variant={tab === t.id ? "default" : "ghost"}
                size="sm"
                className={tab === t.id ? "bg-[#949DDB] hover:bg-[#949DDB]/90" : ""}
              >
                {t.id === "overview" && <Shield className="h-4 w-4 mr-1" />}
                {t.id === "approvals" && <CheckCircle className="h-4 w-4 mr-1" />}
                {t.id === "featured" && <Star className="h-4 w-4 mr-1" />}
                {t.id === "users" && <UserCog className="h-4 w-4 mr-1" />}
                {t.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total properties</CardTitle>
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{statsLoading ? "—" : totalProperties}</p>
                  <Link href="/properties" className="text-sm text-primary hover:underline mt-2 inline-block">
                    View listings
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
                  <Users className="h-10 w-10 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{statsLoading ? "—" : totalUsers}</p>
                  <Link href="/admin?tab=users" className="text-sm text-primary hover:underline mt-2 inline-block">
                    Manage users
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Views / engagement</CardTitle>
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{statsLoading ? "—" : totalViews}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total property views</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{statsLoading ? "—" : pendingApprovals}</p>
                  <p className="text-xs text-muted-foreground mt-1">Properties with pending status</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link href="/properties">
                  <Button>Browse properties</Button>
                </Link>
                <Link href="/admin?tab=users">
                  <Button variant="outline">Manage users</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">My dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {/* Approvals tab - placeholder */}
        {tab === "approvals" && (
          <Card>
            <CardHeader>
              <CardTitle>Approve properties</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and approve pending property listings. This workflow will be available in a future update.
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No approval workflow configured yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Featured tab - placeholder */}
        {tab === "featured" && (
          <Card>
            <CardHeader>
              <CardTitle>Feature properties</CardTitle>
              <p className="text-sm text-muted-foreground">
                Mark properties as featured to highlight them on the homepage and search results.
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Featured properties management coming soon.</p>
            </CardContent>
          </Card>
        )}

        {/* Manage users tab */}
        {tab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>Manage users</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and filter all users. Lister property counts are shown. Block/suspend and other actions can be added later.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, name, phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="h-10 px-3 rounded-md border bg-background min-w-[140px]"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {usersLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent mb-4" />
                  <p>Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users match your filters.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setUserSearch("");
                      setUserRoleFilter("");
                      setUserPage(1);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium hidden md:table-cell">Phone</th>
                          <th className="text-left p-3 font-medium">Role</th>
                          <th className="text-left p-3 font-medium">Properties</th>
                          <th className="text-left p-3 font-medium">Joined</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u: AdminUser) => (
                          <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-3">
                              <span className="font-medium">
                                {u.profile?.name || u.profile?.companyName || "—"}
                              </span>
                            </td>
                            <td className="p-3">{u.email}</td>
                            <td className="p-3 hidden md:table-cell">{u.phone || "—"}</td>
                            <td className="p-3">
                              <span className="capitalize">{u.role}</span>
                            </td>
                            <td className="p-3">
                              {u.role === "lister" ? (
                                <span className="font-medium">{u.propertiesCount ?? 0}</span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {u.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  title="Coming soon"
                                  className="text-muted-foreground"
                                >
                                  Block
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  title="Coming soon"
                                  className="text-muted-foreground"
                                >
                                  Suspend
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {usersPagination && usersPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing page {usersPagination.page} of {usersPagination.totalPages} (
                        {usersPagination.total} total)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={usersPagination.page <= 1}
                          onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={usersPagination.page >= usersPagination.totalPages}
                          onClick={() => setUserPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
