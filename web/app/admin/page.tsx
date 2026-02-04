"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/endpoints";
import { PropertyStatus } from "@/lib/types";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Users, Home, Eye } from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (user && user.role !== "admin") {
    // Non-admins are redirected away from this page
    if (typeof window !== "undefined") {
      router.replace("/dashboard");
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Redirecting…</div>
      </div>
    );
  }

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
    enabled: !!user && user.role === "admin",
  });

  const {
    data: pendingData,
    isLoading: pendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ["admin-pending-properties"],
    queryFn: () => adminApi.getPendingProperties({ page: 1, limit: 50 }),
    enabled: !!user && user.role === "admin",
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers({ limit: 50 }),
    enabled: !!user && user.role === "admin",
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PropertyStatus }) =>
      adminApi.updatePropertyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "Status updated",
        description: "Property status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update property status.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: PropertyStatus.AVAILABLE });
  };

  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: PropertyStatus.PENDING });
  };

  const renderStats = () => {
    if (statsLoading || !stats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.availableProperties} available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingApprovals} pending approvals
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPending = () => {
    if (pendingLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    if (pendingError) {
      return (
        <div className="text-sm text-red-500">
          Failed to load pending properties. Please try again later.
        </div>
      );
    }

    const properties = pendingData?.properties ?? [];

    if (properties.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No properties are currently awaiting approval.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{property.title}</h3>
                  <Badge variant="outline" className="capitalize">
                    {property.propertyType}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {property.transactionType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {property.description}
                </p>
                {property.lister && (
                  <p className="text-xs text-muted-foreground">
                    Lister:{" "}
                    <span className="font-medium">
                      {property.lister.profile?.name ||
                        property.lister.profile?.companyName ||
                        property.lister.email}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() =>
                    window.open(`/properties/${property.id}`, "_blank")
                  }
                >
                  View
                </Button>
                <Button
                  size="sm"
                  className="gap-1 bg-emerald-600 hover:bg-emerald-600/90 text-white"
                  onClick={() => handleApprove(property.id)}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleReject(property.id)}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="h-3 w-3" />
                  Keep Pending
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderUsers = () => {
    if (usersLoading || !usersData) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    const { users } = usersData;

    if (users.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No users found yet.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {u.profile?.name || u.profile?.companyName || u.email}
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {u.role}
                  </Badge>
                  {u.profileType && (
                    <Badge variant="secondary" className="capitalize">
                      {u.profileType}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {u.email} · {u.phone}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{u.propertiesCount ?? 0} properties</span>
                <span>{u.isActive ? "Active" : "Inactive"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-6 md:py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Admin dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of users, listings, and pending approvals.
          </p>
        </div>

        {renderStats()}

        <Tabs defaultValue="pending" className="mt-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="pending" className="flex-1 md:flex-none">
              Pending approvals
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 md:flex-none">
              Manage users
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            {renderPending()}
          </TabsContent>
          <TabsContent value="users" className="mt-4">
            {renderUsers()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

