"use client";

import { Property } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { favoriteApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "@/lib/hooks/use-toast";

interface PropertyCardProps {
  property: Property;
  onFavoriteChange?: () => void;
}

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

  const primaryImage = property.media?.[0]?.url || "/placeholder-property.jpg";
  const locationString = property.location
    ? [property.location.sector, property.location.district].filter(Boolean).join(", ") || "Location TBD"
    : "Location TBD";

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>

          {/* Status Badge */}
          {property.isFeatured && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs font-semibold rounded">
              Featured
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Price */}
          <div className="mb-2">
            <span className="text-2xl font-bold text-primary">
              {property.currency} {property.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              /{property.transactionType}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{locationString}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.sizeSqm && (
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                <span>{property.sizeSqm}m²</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
