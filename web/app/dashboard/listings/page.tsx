"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  MapPin,
  ExternalLink,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { PropertyStatus } from "@/lib/types";

export default function MyListingsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  
  // Confirmation dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    propertyId: string;
    propertyTitle: string;
  }>({ open: false, propertyId: "", propertyTitle: "" });
  
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    propertyId: string;
    propertyTitle: string;
    newStatus: PropertyStatus | null;
  }>({ open: false, propertyId: "", propertyTitle: "", newStatus: null });

  useEffect(() => {
    if (user && user.role !== "lister" && user.role !== "admin") {
      toast({
        title: "Access restricted",
        description: "Only listers can manage property listings.",
        variant: "destructive",
      });
      router.replace("/dashboard");
    }
  }, [user, router]);

  const canManageListings = user?.role === "lister" || user?.role === "admin";

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-properties"],
    queryFn: () => propertyApi.getMyProperties({ limit: 100 }),
    enabled: canManageListings,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      toast({
        title: "Property deleted",
        description: "Your property has been removed successfully.",
      });
      setDeletingId(null);
      setDeleteDialog({ open: false, propertyId: "", propertyTitle: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
      setDeletingId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PropertyStatus }) =>
      propertyApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      toast({
        title: "Status updated",
        description: "Property status has been changed successfully.",
      });
      setStatusDialog({ open: false, propertyId: "", propertyTitle: "", newStatus: null });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDialog({ open: true, propertyId: id, propertyTitle: title });
  };

  const handleDeleteConfirm = () => {
    setDeletingId(deleteDialog.propertyId);
    deleteMutation.mutate(deleteDialog.propertyId);
  };

  const handleStatusChange = (id: string, title: string, newStatus: PropertyStatus) => {
    setStatusDialog({ open: true, propertyId: id, propertyTitle: title, newStatus });
  };

  const handleStatusConfirm = () => {
    if (statusDialog.newStatus) {
      statusMutation.mutate({
        id: statusDialog.propertyId,
        status: statusDialog.newStatus,
      });
    }
  };

  const properties = data?.properties || [];
  
  // Filter properties by status
  const filteredProperties = statusFilter === "all" 
    ? properties 
    : properties.filter(p => p.status === statusFilter);

  // Status counts for filter buttons
  const statusCounts = properties.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return "bg-green-100 text-green-800";
      case PropertyStatus.PENDING:
        return "bg-orange-100 text-orange-800";
      case PropertyStatus.SOLD:
      case PropertyStatus.RENTED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusActions = (property: any) => {
    const actions: JSX.Element[] = [];
    
    // Can mark as sold if it's for sale and available
    if (property.transactionType === "sale" && property.status === PropertyStatus.AVAILABLE) {
      actions.push(
        <Button
          key="sold"
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange(property.id, property.title, PropertyStatus.SOLD)}
          className="text-xs"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Mark as Sold
        </Button>
      );
    }
    
    // Can mark as rented if it's for rent and available
    if (property.transactionType === "rent" && property.status === PropertyStatus.AVAILABLE) {
      actions.push(
        <Button
          key="rented"
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange(property.id, property.title, PropertyStatus.RENTED)}
          className="text-xs"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Mark as Rented
        </Button>
      );
    }
    
    // Can mark as available if it's sold or rented
    if (property.status === PropertyStatus.SOLD || property.status === PropertyStatus.RENTED) {
      actions.push(
        <Button
          key="available"
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange(property.id, property.title, PropertyStatus.AVAILABLE)}
          className="text-xs"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Mark as Available
        </Button>
      );
    }
    
    return actions;
  };

  if (user && !canManageListings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        <p className="mt-4 text-muted-foreground">Loading your properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load properties</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["my-properties"] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your property listings ({properties.length} total)
          </p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Status Filter */}
      {properties.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium mr-2">Filter by status:</span>
              
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All ({properties.length})
              </Button>
              
              {Object.values(PropertyStatus).map((status) => {
                const count = statusCounts[status] || 0;
                if (count === 0) return null;
                
                return (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    <span className="capitalize">{status}</span> ({count})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {statusFilter === "all" ? "No properties yet" : `No ${statusFilter} properties`}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {statusFilter === "all" 
                ? "You haven't listed any properties yet. Start by adding your first property listing."
                : `You don't have any properties with status "${statusFilter}".`}
            </p>
            {statusFilter === "all" ? (
              <Link href="/dashboard/listings/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={() => setStatusFilter("all")}>
                Show All Properties
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full md:w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {property.media && property.media.length > 0 ? (
                      <img
                        src={property.media[0].url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-1 truncate">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {property.location
                              ? [property.location.sector, property.location.district].filter(Boolean).join(", ")
                              : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${getStatusColor(property.status)}
                          `}
                        >
                          {property.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {property.currency} {property.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {property.viewsCount || 0} views
                          </span>
                          <span className="capitalize">{property.propertyType}</span>
                          <span className="capitalize">{property.transactionType}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {getStatusActions(property).map(action => action)}
                        
                        <Link href={`/properties/${property.id}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/listings/${property.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(property.id, property.title)}
                          disabled={deletingId === property.id}
                        >
                          {deletingId === property.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Property"
        description={`Are you sure you want to delete "${deleteDialog.propertyTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog({ ...statusDialog, open })}
        title="Change Property Status"
        description={`Are you sure you want to mark "${statusDialog.propertyTitle}" as ${statusDialog.newStatus}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="default"
        onConfirm={handleStatusConfirm}
        loading={statusMutation.isPending}
      />
    </div>
  );
}
