"use client";

import { useState } from "react";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ContactButton } from "@/components/property/contact-button";
import { Button } from "@/components/ui/button";
import { propertyApi, reviewApi } from "@/lib/api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  Share2,
  ArrowLeft,
  Check,
  Star,
  MessageSquare,
  Home,
  Calendar,
  Tag,
  TrendingUp,
  Wifi,
  Car,
  Dumbbell,
  Shield,
  Wind,
  Zap,
  Droplet,
  Trees,
  Building,
  Sofa,
} from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Review } from "@/lib/types";

// Amenity icon mapping for better visual representation
const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  gym: Dumbbell,
  security: Shield,
  "air conditioning": Wind,
  "air-conditioning": Wind,
  ac: Wind,
  electricity: Zap,
  water: Droplet,
  garden: Trees,
  balcony: Building,
  furnished: Sofa,
  pool: Droplet,
  swimming: Droplet,
};

// Get icon for amenity based on keyword matching
const getAmenityIcon = (amenity: string) => {
  const lowerAmenity = amenity.toLowerCase();
  for (const [key, Icon] of Object.entries(amenityIcons)) {
    if (lowerAmenity.includes(key)) {
      return Icon;
    }
  }
  return Check;
};

// Status color mapping
const getStatusColor = (status: string) => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "available") return "bg-emerald-100 text-emerald-700";
  if (lowerStatus === "pending") return "bg-amber-100 text-amber-700";
  if (lowerStatus === "sold" || lowerStatus === "rented") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const queryClient = useQueryClient();
  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertyApi.getById(propertyId),
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: () => reviewApi.getByProperty(propertyId),
    enabled: !!propertyId,
  });

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const createReviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment: string }) =>
      reviewApi.create({
        propertyId,
        revieweeId: property!.listerId ?? property!.lister?.id ?? "",
        rating: payload.rating,
        comment: payload.comment || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", propertyId] });
      setReviewComment("");
      setReviewRating(5);
      toast({ title: "Review submitted", description: "Thanks for your feedback." });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Failed to submit review",
        variant: "destructive",
      });
    },
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
          <p className="mt-4 text-sm text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4 text-sm">Failed to load property</p>
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
    <div className="min-h-screen py-6 px-4 bg-[#f8f8f5]">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/properties")}
          className="mb-4 text-sm hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Gallery */}
            <PropertyGallery images={images} title={property.title} />

            {/* Title and Price */}
            <div className="bg-card rounded-xl border shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#1a1a2e]">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                    <span>{locationString}</span>
                  </div>
                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleShare}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors h-9 w-9"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-baseline gap-2 p-4 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {property.currency} {property.price.toLocaleString()}
                </span>
                <span className="text-base text-muted-foreground font-medium">
                  / {property.transactionType}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {property.bedrooms != null && (
                <div className="group flex items-center gap-2.5 p-3.5 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                    <Bed className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bedrooms</p>
                    <p className="text-xl font-bold">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="group flex items-center gap-2.5 p-3.5 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-colors">
                    <Bath className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bathrooms</p>
                    <p className="text-xl font-bold">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              {property.sizeSqm != null && property.sizeSqm > 0 && (
                <div className="group flex items-center gap-2.5 p-3.5 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 group-hover:from-emerald-500/30 group-hover:to-emerald-500/20 transition-colors">
                    <Square className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Size</p>
                    <p className="text-xl font-bold">{property.sizeSqm} m²</p>
                  </div>
                </div>
              )}
              <div className="group flex items-center gap-2.5 p-3.5 rounded-lg border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 group-hover:from-amber-500/30 group-hover:to-amber-500/20 transition-colors">
                  <Eye className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Views</p>
                  <p className="text-xl font-bold">{property.viewsCount ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/20">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  About This Property
                </h2>
              </div>
              <div className="p-5">
                <p className="text-[#1a1a2e]/80 leading-relaxed whitespace-pre-line text-sm">
                  {property.description}
                </p>
              </div>
            </section>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 border-b">
                  <h2 className="text-lg font-bold flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                      <Star className="h-4 w-4 text-emerald-600" />
                    </div>
                    Amenities & Features
                  </h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {property.amenities.map((amenity, index) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={index}
                          className="group flex items-center gap-2.5 p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-muted hover:border-primary/50 hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:shadow-sm"
                        >
                          <div className="p-1.5 rounded-md bg-background/80 group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground capitalize flex-1 text-sm">
                            {amenity}
                          </span>
                          <Check className="h-3.5 w-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Property Details */}
            <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <Home className="h-4 w-4 text-blue-600" />
                  </div>
                  Property Details
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="group flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border hover:border-primary/50 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-background/80">
                        <Building className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Property Type</span>
                    </div>
                    <span className="font-semibold text-foreground capitalize text-sm">{property.propertyType}</span>
                  </div>
                  
                  <div className="group flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border hover:border-primary/50 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-background/80">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Transaction</span>
                    </div>
                    <span className="font-semibold text-foreground capitalize text-sm">{property.transactionType}</span>
                  </div>
                  
                  <div className="group flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border hover:border-primary/50 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-background/80">
                        <Tag className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Status</span>
                    </div>
                    <span className="font-semibold text-foreground capitalize text-sm">{property.status}</span>
                  </div>
                  
                  {property.yearBuilt != null && property.yearBuilt > 0 && (
                    <div className="group flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border hover:border-primary/50 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-background/80">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Year Built</span>
                      </div>
                      <span className="font-semibold text-foreground text-sm">{property.yearBuilt}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20">
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                  </div>
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h2>
              </div>
              <div className="p-5">
                {reviewsLoading ? (
                  <p className="text-muted-foreground text-sm">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
                      <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">No reviews yet. Be the first to leave a review.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {(reviews as Review[]).map((r) => {
                      const reviewer = (r as Review & { reviewer?: { profile?: { name?: string }; email?: string } }).reviewer ?? r.user;
                      const name = reviewer?.profile?.name ?? (reviewer as { email?: string })?.email ?? "Anonymous";
                      return (
                        <li key={r.id} className="p-4 border rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-semibold text-sm">{name}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                                />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-xs text-foreground/80 leading-relaxed mb-1.5">{r.comment}</p>}
                          <p className="text-[10px] text-muted-foreground">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {isAuthenticated && user?.id !== property.listerId && property.listerId && (
                  <div className="mt-5 p-4 border rounded-lg bg-gradient-to-br from-background to-muted/20">
                    <h3 className="font-semibold text-sm mb-3">Leave a Review</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5">Rating</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewRating(i)}
                              className="p-1 rounded-lg hover:bg-muted transition-colors"
                            >
                              <Star
                                className={`h-6 w-6 transition-colors ${i <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5">Comment (optional)</label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-lg min-h-[80px] bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                          placeholder="Share your experience..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                        />
                      </div>
                      <Button
                        disabled={createReviewMutation.isPending}
                        onClick={() =>
                          createReviewMutation.mutate({ rating: reviewRating, comment: reviewComment })
                        }
                        className="w-full sm:w-auto text-sm"
                        size="sm"
                      >
                        {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Lister link – visible for all; leads to modern lister page with public info & properties */}
              {property.listerId && (
                <div className="p-4 rounded-xl border bg-card shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Listed by
                  </p>
                  <Link
                    href={`/listers/${property.listerId}`}
                    className="text-base font-bold text-primary hover:underline block mb-1.5"
                  >
                    {property.lister?.profile?.name ||
                      property.lister?.profile?.companyName ||
                      "View lister profile"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    View their public profile, lister type, and all listings.
                  </p>
                </div>
              )}

              {/* Contact Card - only show contact info when authenticated */}
              <div className="p-5 border rounded-xl bg-card shadow-sm">
                <h3 className="text-base font-bold mb-3">Contact Property Owner</h3>
                {isAuthenticated ? (
                  <ContactButton
                    property={property}
                    landlord={{
                      name: property.lister?.profile?.name || property.lister?.email || "Property Owner",
                      phone: property.lister?.phone,
                      email: property.lister?.email,
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-xs">
                      Sign up or log in to view contact details and get in touch with the property owner.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link href="/register?role=seeker">
                        <Button className="w-full text-sm" size="sm">
                          Sign up to contact lister
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" className="w-full text-sm" size="sm">
                          Log in to contact
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              {property.location?.latitude != null && property.location?.longitude != null && (
                <div className="p-5 border rounded-xl bg-card shadow-sm">
                  <h3 className="text-base font-bold mb-3">Location</h3>
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground text-xs">Map integration coming soon</p>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
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
