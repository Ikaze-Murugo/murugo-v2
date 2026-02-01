"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyApi, favoriteApi, adminApi } from "@/lib/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Eye, Heart, TrendingUp, Shield, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: myPropertiesData } = useQuery({
    queryKey: ["my-properties"],
    queryFn: () => propertyApi.getMyProperties({ limit: 100 }),
    enabled: user?.role === "lister",
  });

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoriteApi.getAll(),
  });

  const { data: adminStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
    enabled: user?.role === "admin",
  });

  const properties = myPropertiesData?.properties || [];
  const totalViews = properties.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const availableProperties = properties.filter((p) => p.status === "available").length;
  const favoriteList = favorites ?? [];

  // Admin: platform overview (accurate data)
  if (user?.role === "admin") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview. Use the sidebar for approvals, featured properties, and user management.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.totalProperties ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">On platform</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.totalUsers ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.totalViews ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Property views</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending approvals</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats?.pendingApprovals ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/admin">
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Open Admin panel
              </Button>
            </Link>
            <Link href="/admin?tab=approvals">
              <Button variant="outline">Approve properties</Button>
            </Link>
            <Link href="/admin?tab=featured">
              <Button variant="outline">Feature properties</Button>
            </Link>
            <Link href="/admin?tab=users">
              <Button variant="outline">Manage users</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Seeker (renter): favorites-focused dashboard
  if (user?.role === "seeker") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your saved properties, profile, and preferences.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saved properties</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favoriteList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Favorites</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/dashboard/favorites">
              <Button>
                <Heart className="h-4 w-4 mr-2" />
                View my favorites
              </Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse properties
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline">Edit profile</Button>
            </Link>
          </CardContent>
        </Card>
        {favoriteList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {favoriteList.slice(0, 5).map((fav: { id: string; property?: { id: string; title?: string; location?: { sector?: string; district?: string }; price?: number; currency?: string } }) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{fav.property?.title ?? "Property"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {fav.property?.location
                          ? [fav.property.location.sector, fav.property.location.district].filter(Boolean).join(", ")
                          : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {fav.property?.price != null && (
                        <p className="text-sm font-medium">
                          {fav.property.currency} {fav.property.price.toLocaleString()}
                        </p>
                      )}
                      <Link href={`/properties/${fav.property?.id ?? fav.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Lister: existing listings-focused dashboard
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your properties.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{availableProperties} available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteList.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Saved properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.length > 0 ? Math.round(totalViews / properties.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per property</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/dashboard/listings/new">
            <Button>
              <Building2 className="h-4 w-4 mr-2" />
              Add New Property
            </Button>
          </Link>
          <Link href="/dashboard/listings">
            <Button variant="outline">View My Listings</Button>
          </Link>
          <Link href="/properties">
            <Button variant="outline">Browse All Properties</Button>
          </Link>
        </CardContent>
      </Card>

      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.slice(0, 5).map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {property.location
                        ? [property.location.sector, property.location.district].filter(Boolean).join(", ")
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {property.currency} {property.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{property.viewsCount || 0} views</p>
                    </div>
                    <Link href={`/dashboard/listings/${property.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
