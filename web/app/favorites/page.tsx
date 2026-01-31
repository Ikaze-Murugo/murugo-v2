"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoriteApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Maximize, Trash2 } from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoriteApi.getAll(),
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (propertyId: string) => favoriteApi.remove(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Property has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove property. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load favorites</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["favorites"] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
        <p className="text-muted-foreground">
          Properties you've saved for later
        </p>
      </div>

      {/* Favorites Grid */}
      {!favorites || favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No saved properties</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You haven't saved any properties yet. Browse properties and click the heart icon to save them here.
            </p>
            <Link href="/properties">
              <Button>
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const property = favorite.property;
            if (!property) return null;

            return (
              <Card key={favorite.id} className="overflow-hidden group">
                <div className="relative">
                  {/* Image */}
                  <Link href={`/properties/${property.id}`}>
                    <div className="aspect-[4/3] bg-muted overflow-hidden">
                      {property.media && property.media.length > 0 ? (
                        <img
                          src={property.media[0].url}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeMutation.mutate(property.id)}
                    disabled={removeMutation.isPending}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                  >
                    {removeMutation.isPending ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    ) : (
                      <Trash2 className="h-5 w-5 text-red-600" />
                    )}
                  </button>

                  {/* Transaction Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                      For {property.transactionType}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <Link href={`/properties/${property.id}`}>
                    <div className="space-y-2">
                      {/* Title */}
                      <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
                        {property.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {property.location?.sector && property.location?.district
                            ? `${property.location.sector}, ${property.location.district}`
                            : "Location not specified"}
                        </span>
                      </div>

                      {/* Price */}
                      <p className="text-xl font-bold text-primary">
                        {property.currency} {property.price.toLocaleString()}
                      </p>

                      {/* Property Details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                        {property.bedrooms !== undefined && property.bedrooms > 0 && (
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms !== undefined && property.bathrooms > 0 && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.sizeSqm !== undefined && property.sizeSqm > 0 && (
                          <div className="flex items-center">
                            <Maximize className="h-4 w-4 mr-1" />
                            <span>{property.sizeSqm} m²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {favorites && favorites.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          You have {favorites.length} {favorites.length === 1 ? "property" : "properties"} saved
        </div>
      )}
    </div>
  );
}
