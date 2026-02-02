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
} from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Review } from "@/lib/types";

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

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {property.bedrooms != null && (
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-card shadow-sm">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bed className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bedrooms</p>
                    <p className="text-lg font-bold">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-card shadow-sm">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bath className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bathrooms</p>
                    <p className="text-lg font-bold">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              {property.sizeSqm != null && property.sizeSqm > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-card shadow-sm">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Square className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Size</p>
                    <p className="text-lg font-bold">{property.sizeSqm} m²</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 rounded-xl border bg-card shadow-sm">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Views</p>
                  <p className="text-lg font-bold">{property.viewsCount ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground mb-3">Description</h2>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </section>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm capitalize"
                    >
                      <Check className="h-4 w-4 shrink-0" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Property meta */}
            <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground mb-4">Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Property type</span>
                  <span className="font-semibold capitalize">{property.propertyType}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Transaction</span>
                  <span className="font-semibold capitalize">{property.transactionType}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="font-semibold capitalize">{property.status}</span>
                </div>
                {property.yearBuilt != null && property.yearBuilt > 0 && (
                  <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Year built</span>
                    <span className="font-semibold">{property.yearBuilt}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {reviewsLoading ? (
                <p className="text-muted-foreground">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet. Be the first to leave a review.</p>
              ) : (
                <ul className="space-y-4">
                  {(reviews as Review[]).map((r) => {
                    const reviewer = (r as Review & { reviewer?: { profile?: { name?: string }; email?: string } }).reviewer ?? r.user;
                    const name = reviewer?.profile?.name ?? (reviewer as { email?: string })?.email ?? "Anonymous";
                    return (
                      <li key={r.id} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-medium">{name}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}

              {isAuthenticated && user?.id !== property.listerId && property.listerId && (
                <div className="mt-6 p-4 border rounded-lg bg-background">
                  <h3 className="font-semibold mb-3">Leave a review</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i)}
                            className="p-1 rounded hover:bg-muted"
                          >
                            <Star
                              className={`h-8 w-8 ${i <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                      <textarea
                        className="w-full px-3 py-2 border rounded-md min-h-[80px]"
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
                    >
                      {createReviewMutation.isPending ? "Submitting..." : "Submit review"}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Lister link */}
              {property.listerId && (
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Listed by </span>
                  <Link
                    href={`/listers/${property.listerId}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {property.lister?.profile?.name ||
                      property.lister?.profile?.companyName ||
                      "View lister"}
                  </Link>
                </div>
              )}

              {/* Contact Card - only show contact info when authenticated */}
              <div className="p-6 border rounded-lg bg-background shadow-lg">
                <h3 className="text-xl font-bold mb-4">Contact Property Owner</h3>
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
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Sign up or log in to view contact details and get in touch with the property owner.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link href="/register?role=seeker">
                        <Button className="w-full" size="lg">
                          Sign up to contact lister
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" className="w-full" size="lg">
                          Log in to contact
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              {property.location?.latitude && property.location?.longitude && (
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
