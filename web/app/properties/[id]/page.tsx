"use client";

import { useState } from "react";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ContactButton } from "@/components/property/contact-button";
import { Button } from "@/components/ui/button";
import { propertyApi, reviewApi, favoriteApi } from "@/lib/api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Heart,
  Send,
} from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Review } from "@/lib/types";
import { ProfileType } from "@/lib/types";

const PROFILE_TYPE_LABELS: Record<string, string> = {
  [ProfileType.INDIVIDUAL]: "Individual",
  [ProfileType.COMMISSIONER]: "Commissioner",
  [ProfileType.COMPANY]: "Company",
};

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

const DESCRIPTION_TRUNCATE_LENGTH = 120;

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const queryClient = useQueryClient();
  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertyApi.getById(propertyId),
  });

  const { data: isFavorite = false } = useQuery({
    queryKey: ["favorite-check", propertyId],
    queryFn: () => favoriteApi.check(propertyId),
    enabled: isAuthenticated && !!propertyId,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: () => favoriteApi.add(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-check", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({ title: "Added to favorites" });
    },
    onError: () => {
      toast({ title: "Failed to add to favorites", variant: "destructive" });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: () => favoriteApi.remove(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-check", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({ title: "Removed from favorites" });
    },
    onError: () => {
      toast({ title: "Failed to remove from favorites", variant: "destructive" });
    },
  });

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in to save favorites", variant: "destructive" });
      return;
    }
    if (isFavorite) removeFavoriteMutation.mutate();
    else addFavoriteMutation.mutate();
  };

  const handleSendClick = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in to contact the owner", variant: "destructive" });
      return;
    }
    const phone = property?.lister?.phone || property?.lister?.whatsappNumber;
    if (!phone) {
      toast({ title: "Contact number not available", variant: "destructive" });
      return;
    }
    const clean = String(phone).replace(/\D/g, "");
    const wa = clean.startsWith("250") ? clean : `250${clean}`;
    const message = encodeURIComponent(
      `Hi, I'm interested in your property: ${property?.title}\n` +
      `Location: ${property?.location?.sector}, ${property?.location?.district}\n` +
      `Price: ${property?.currency} ${property?.price?.toLocaleString()}\n` +
      `Property ID: ${property?.id}`
    );
    window.open(`https://wa.me/${wa}?text=${message}`, "_blank");
  };

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

  const listerName = property.lister?.profile?.companyName || property.lister?.profile?.name || property.lister?.email || "Property Owner";
  const profileTypeLabel = property.lister?.profileType ? PROFILE_TYPE_LABELS[property.lister.profileType] ?? property.lister.profileType : null;
  const listerAvatarUrl = property.lister?.profile?.avatarUrl;
  const listerInitials = listerName.split(/\s+/).map((s) => s[0]).join("").toUpperCase().slice(0, 2);
  const description = property.description || "";
  const needsTruncate = description.length > DESCRIPTION_TRUNCATE_LENGTH;
  const showDescription = descriptionExpanded || !needsTruncate ? description : description.slice(0, DESCRIPTION_TRUNCATE_LENGTH) + "...";

  return (
    <div className="min-h-screen py-6 px-4 bg-[#f8f8f5] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/properties")}
          className="mb-4 text-sm hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        {/* 1. Profile header – lister avatar, name, title */}
        {property.listerId && (
          <div className="flex items-center gap-3 px-1 mb-4">
            <Link href={`/listers/${property.listerId}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {listerAvatarUrl ? (
                  <Image src={listerAvatarUrl} alt={listerName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-lg">
                    {listerInitials}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{listerName}</p>
                {profileTypeLabel && (
                  <p className="text-sm text-muted-foreground">{profileTypeLabel}</p>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* 2. Image carousel */}
        <PropertyGallery images={images} title={property.title} />

        {/* 3. Expandable description */}
        {description && (
          <div className="mt-4 bg-card rounded-xl border shadow-sm p-4">
            <button
              type="button"
              onClick={() => setDescriptionExpanded((e) => !e)}
              className="text-left w-full"
            >
              <p className="text-[#1a1a2e]/80 leading-relaxed whitespace-pre-line text-sm">
                {showDescription}
              </p>
              {needsTruncate && (
                <span className="text-sm text-primary font-medium mt-1 inline-block">
                  {descriptionExpanded ? "Show less" : "more..."}
                </span>
              )}
            </button>
          </div>
        )}

        {/* 4. Details – price, quick stats, amenities, etc. */}
        <div className="mt-4 space-y-5">
            {/* Price and Location */}
            <div className="bg-card rounded-xl border shadow-sm p-5">
              <div className="flex items-center text-muted-foreground text-sm mb-3">
                <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                <span>{locationString}</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${getStatusColor(property.status)}`}>
                {property.status}
              </span>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 -mt-2">
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

            {/* Contact Card - full options for authenticated users */}
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

        {/* 5. Bottom action bar – Like, Share, Send */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-40 py-3 px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <Heart
                className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-xs">{isFavorite ? "Liked" : "Like"}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="h-6 w-6" />
              <span className="text-xs">Share</span>
            </button>
            <button
              type="button"
              onClick={handleSendClick}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors"
            >
              <Send className="h-6 w-6" />
              <span className="text-xs">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
