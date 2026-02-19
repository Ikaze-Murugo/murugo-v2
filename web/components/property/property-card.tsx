"use client";

import { Property } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { favoriteApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "@/lib/hooks/use-toast";

interface PropertyCardProps {
  property: Property;
  onFavoriteChange?: () => void;
}

// Status color mapping
const getStatusBadge = (status: string) => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "available") {
    return { text: "Available", className: "bg-emerald-500 text-white" };
  }
  if (lowerStatus === "pending") {
    return { text: "Pending", className: "bg-amber-500 text-white" };
  }
  if (lowerStatus === "sold" || lowerStatus === "rented") {
    return { text: status, className: "bg-slate-500 text-white" };
  }
  return null;
};

export function PropertyCard({ property, onFavoriteChange }: PropertyCardProps) {
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
        toast({
          title: "Removed from favorites",
        });
      } else {
        await favoriteApi.add(property.id);
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
        });
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

  const statusBadge = getStatusBadge(property.status);

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>

          {/* Status/Featured Badge */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {property.isFeatured && (
              <div className="px-2 py-0.5 bg-primary text-white text-[10px] font-semibold rounded shadow-sm">
                Featured
              </div>
            )}
            {statusBadge && (
              <div className={`px-2 py-0.5 text-[10px] font-semibold rounded shadow-sm ${statusBadge.className}`}>
                {statusBadge.text}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-3.5">
          {/* Price */}
          <div className="mb-2">
            <span className="text-xl font-bold text-primary">
              {property.currency} {property.price.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              /{property.transactionType}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base mb-1.5 line-clamp-1">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-xs text-muted-foreground mb-2.5">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="line-clamp-1">{locationString}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {property.bedrooms != null && (
              <div className="flex items-center">
                <Bed className="h-3.5 w-3.5 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center">
                <Bath className="h-3.5 w-3.5 mr-1" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.sizeSqm && (
              <div className="flex items-center">
                <Square className="h-3.5 w-3.5 mr-1" />
                <span>{property.sizeSqm}m²</span>
              </div>
            )}
          </div>

          {/* Lister name – clickable to public profile */}
          {property.listerId && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground">Listed by </span>
              <Link
                href={`/listers/${property.listerId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] font-medium text-primary hover:underline"
              >
                {property.lister?.profile?.name || property.lister?.profile?.companyName || "Lister"}
              </Link>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3.5 pt-0">
          <Button variant="outline" className="w-full text-xs h-8">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
