"use client";

import { PropertyGallery } from "@/components/property/property-gallery";
import { ContactButton } from "@/components/property/contact-button";
import { Button } from "@/components/ui/button";
import { propertyApi } from "@/lib/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Eye,
  Share2,
  ArrowLeft,
  Check,
} from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertyApi.getById(propertyId),
  });

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Check out this property: ${property?.title}`,
          url: url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Property link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load property</p>
          <Button onClick={() => router.push("/properties")}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const images = property.media?.map((m) => m.url) || [];
  const locationString = property.location
    ? [property.location.sector, property.location.district].filter(Boolean).join(", ") || "Location TBD"
    : "Location TBD";

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/properties")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <PropertyGallery images={images} title={property.title} />

            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{locationString}</span>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {property.currency} {property.price.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground">
                  / {property.transactionType}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-muted/50 rounded-lg">
              {property.bedrooms && (
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              {property.sizeSqm && (
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-semibold">{property.sizeSqm}m²</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="font-semibold">{property.viewsCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Property Type</span>
                  <span className="font-semibold capitalize">{property.propertyType}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Transaction Type</span>
                  <span className="font-semibold capitalize">{property.transactionType}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold capitalize">{property.status}</span>
                </div>
                {property.yearBuilt && (
                  <div className="flex justify-between p-3 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Year Built</span>
                    <span className="font-semibold">{property.yearBuilt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Card */}
              <div className="p-6 border rounded-lg bg-background shadow-lg">
                <h3 className="text-xl font-bold mb-4">Contact Property Owner</h3>
                <ContactButton
                  property={property}
                  landlord={{
                    name: property.lister?.profile?.name || property.lister?.email || "Property Owner",
                    phone: property.lister?.phone,
                    email: property.lister?.email,
                  }}
                />
              </div>

              {/* Map Placeholder */}
              {property.location.latitude && property.location.longitude && (
                <div className="p-6 border rounded-lg bg-background">
                  <h3 className="text-xl font-bold mb-4">Location</h3>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Map integration coming soon</p>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {locationString}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
