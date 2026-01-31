"use client";

import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { propertyApi } from "@/lib/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Search, Home, Building2, MapPin } from "lucide-react";

export default function HomePage() {
  // Fetch featured properties
  const { data: featuredData } = useQuery({
    queryKey: ["properties", "featured"],
    queryFn: () => propertyApi.getAll({ limit: 6, sortBy: "viewsCount" }),
  });

  // Fetch latest properties
  const { data: latestData } = useQuery({
    queryKey: ["properties", "latest"],
    queryFn: () => propertyApi.getAll({ limit: 6, sortBy: "createdAt" }),
  });

  const featuredProperties = featuredData?.properties || [];
  const latestProperties = latestData?.properties || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect Home in Rwanda
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover houses, apartments, and commercial properties across Kigali and beyond.
          </p>
          
          {/* Quick Search */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-2 flex gap-2">
            <input
              type="text"
              placeholder="Search by location, property type..."
              className="flex-1 px-4 py-3 outline-none"
            />
            <Link href="/properties">
              <Button size="lg">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <Home className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold">{featuredData?.pagination.total || 0}</div>
              <div className="text-sm text-muted-foreground">Properties Available</div>
            </div>
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold">7</div>
              <div className="text-sm text-muted-foreground">Property Types</div>
            </div>
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold">30+</div>
              <div className="text-sm text-muted-foreground">Districts Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">
                Hand-picked properties for you
              </p>
            </div>
            <Link href="/properties">
              <Button variant="outline">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No featured properties available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* Latest Properties */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Listings</h2>
              <p className="text-muted-foreground">
                Recently added properties
              </p>
            </div>
            <Link href="/properties">
              <Button variant="outline">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {latestProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No properties available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center bg-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Have a Property to List?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of property owners and reach potential buyers and renters across Rwanda.
          </p>
          <Link href="/register">
            <Button size="lg">
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
