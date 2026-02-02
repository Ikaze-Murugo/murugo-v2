"use client";

import { listersApi } from "@/lib/api/endpoints";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2, User, Briefcase } from "lucide-react";
import { ProfileType } from "@/lib/types";

const BADGE_LABELS: Record<string, string> = {
  [ProfileType.INDIVIDUAL]: "Individual",
  [ProfileType.COMMISSIONER]: "Commissioner",
  [ProfileType.COMPANY]: "Company",
};

function Badge({ profileType }: { profileType?: string }) {
  if (!profileType) return null;
  const label = BADGE_LABELS[profileType] ?? profileType;
  const isCompany = profileType === ProfileType.COMPANY;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        isCompany
          ? "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isCompany ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
      {label}
    </span>
  );
}

export default function ListerPublicPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["lister", id],
    queryFn: () => listersApi.getById(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Lister not found</p>
          <Button onClick={() => router.push("/properties")}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const { lister, properties } = data;
  const name =
    lister.profile?.name ||
    lister.profile?.companyName ||
    "Property lister";
  const bio = lister.profile?.bio;
  const companyName = lister.profile?.companyName;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/properties")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Button>

        {/* Profile card */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-10">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="flex-shrink-0">
              {lister.profile?.avatarUrl ? (
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={lister.profile.avatarUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 md:h-14 md:w-14 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {name}
                </h1>
                <Badge profileType={lister.profileType} />
              </div>
              {companyName && name !== companyName && (
                <p className="text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
                  <Building2 className="h-4 w-4" />
                  {companyName}
                </p>
              )}
              {bio && (
                <p className="text-muted-foreground leading-relaxed mt-2">
                  {bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Properties */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Listings ({properties.length})
          </h2>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              No listings yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
