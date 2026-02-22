"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoriteApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Square, X } from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data: rawFavorites, isLoading, error } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoriteApi.getAll(),
    enabled: isAuthenticated,
  });
  const favorites = Array.isArray(rawFavorites) ? rawFavorites : [];

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

  const isRemoving = (propertyId: string) =>
    removeMutation.isPending && removeMutation.variables === propertyId;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-300 border-r-transparent" />
          <p className="mt-4 text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-300 border-r-transparent" />
            <p className="mt-4 text-sm text-neutral-500">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="mb-4 text-red-600 text-sm font-medium">Failed to load favorites</div>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["favorites"] })}
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-2">
            Saved Properties
          </h1>
          <p className="text-neutral-600 text-sm">
            {favorites.length > 0 
              ? `${favorites.length} ${favorites.length === 1 ? "property" : "properties"} saved`
              : "Properties you save will appear here"}
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-6">
                <Heart className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                No saved properties yet
              </h3>
              <p className="text-neutral-600 text-sm mb-8 leading-relaxed">
                Start exploring properties and save your favorites by clicking the heart icon. 
                They'll appear here for easy access later.
              </p>
              <Link href="/properties">
                <Button className="bg-gradient-to-br from-primary-500 to-primary-600 hover:brightness-110 text-white shadow-sm">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map((favorite) => {
              const property = favorite.property;
              if (!property) return null;

              const primaryImage = property.media?.[0]?.url;
              const locationString = property.location?.sector && property.location?.district
                ? `${property.location.sector}, ${property.location.district}`
                : "Location not specified";

              return (
                <div
                  key={favorite.id}
                  className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <Link href={`/properties/${property.id}`}>
                    <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                          No image
                        </div>
                      )}
                      
                      {/* Transaction Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/95 backdrop-blur-sm text-neutral-700 border border-neutral-200 shadow-sm">
                          For {property.transactionType}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeMutation.mutate(property.id);
                        }}
                        disabled={isRemoving(property.id)}
                        className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full border border-neutral-200 shadow-sm transition-all hover:shadow-md"
                        aria-label="Remove from favorites"
                      >
                        {isRemoving(property.id) ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-neutral-400 border-r-transparent" />
                        ) : (
                          <X className="h-4 w-4 text-neutral-600" />
                        )}
                      </button>
                    </div>
                  </Link>

                  {/* Content */}
                  <Link href={`/properties/${property.id}`}>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-sm text-neutral-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-neutral-400" />
                        <span className="truncate">{locationString}</span>
                      </div>

                      <div className="text-2xl font-bold text-neutral-900 mb-4">
                        {property.currency} {property.price.toLocaleString()}
                        {property.transactionType === "rent" && (
                          <span className="text-sm font-normal text-neutral-500">/mo</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-neutral-600 pt-4 border-t border-neutral-100">
                        {property.bedrooms !== undefined && property.bedrooms > 0 && (
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1.5 text-neutral-400" />
                            <span className="font-medium">{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms !== undefined && property.bathrooms > 0 && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1.5 text-neutral-400" />
                            <span className="font-medium">{property.bathrooms}</span>
                          </div>
                        )}
                        {property.sizeSqm !== undefined && property.sizeSqm > 0 && (
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1.5 text-neutral-400" />
                            <span className="font-medium">{property.sizeSqm} m²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
