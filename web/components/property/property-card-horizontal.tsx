"use client";

import { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { favoriteApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "@/lib/hooks/use-toast";

interface PropertyCardHorizontalProps {
  property: Property;
  onFavoriteChange?: () => void;
}

export function PropertyCardHorizontal({ property, onFavoriteChange }: PropertyCardHorizontalProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to save favorites",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoriteApi.remove(property.id);
        setIsFavorite(false);
        toast({ title: "Removed from favorites" });
      } else {
        await favoriteApi.add(property.id);
        setIsFavorite(true);
        toast({ title: "Added to favorites" });
      }
      onFavoriteChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const primaryImage = property.media?.[0]?.url;
  const locationString = property.location
    ? [property.location.sector, property.location.district].filter(Boolean).join(", ") || "Location TBD"
    : "Location TBD";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/properties/${property.id}`} className="block">
      <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
        <div className="flex flex-col sm:flex-row">
          {/* Image Section - Left Side */}
          <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden bg-gray-100 dark:bg-gray-700">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={property.title}
                fill
                sizes="(max-width: 640px) 100vw, 40vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No image
              </div>
            )}
            
            {/* Favorite Button - Overlay on Image */}
            <button
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all z-10"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-300"
                }`}
              />
            </button>

            {/* Featured Badge */}
            {property.isFeatured && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold flex items-center gap-1 shadow-lg">
                <Star className="h-3 w-3 fill-white" />
                Featured
              </div>
            )}
          </div>

          {/* Details Section - Right Side */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            {/* Top Section: Title and Badges */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {property.title}
              </h3>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {property.isFeatured && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-medium border border-amber-200 dark:border-amber-800">
                    Featured
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                  property.transactionType === "rent"
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                }`}>
                  For {property.transactionType === "rent" ? "Rent" : "Sale"}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                  property.status === "available"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : property.status === "pending"
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
                }`}>
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-3">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-xs line-clamp-1">{locationString}</span>
              </div>

              {/* Property Features */}
              <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 mb-2">
                {property.bedrooms && (
                  <div className="flex items-center gap-1.5">
                    <Bed className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1.5">
                    <Bath className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium">{property.bathrooms}</span>
                  </div>
                )}
                {property.sizeSqm && (
                  <div className="flex items-center gap-1.5">
                    <Square className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium">{property.sizeSqm} m²</span>
                  </div>
                )}
              </div>

              {/* Property Type */}
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {property.propertyType.replace(/_/g, " ")}
              </div>
            </div>

            {/* Bottom Section: Price */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-end justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {formatPrice(property.price)}
                  {property.transactionType === "rent" && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mo</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
