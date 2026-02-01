"use client";

import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { propertyApi } from "@/lib/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { landingImages } from "@/lib/data/landing-images";

const SERVICES = [
  { id: "renting", ...landingImages.services.renting },
  { id: "buying", ...landingImages.services.buying },
  { id: "selling", ...landingImages.services.selling },
] as const;

export default function HomePage() {
  const [serviceIndex, setServiceIndex] = useState(0);

  const { data: featuredData } = useQuery({
    queryKey: ["properties", "featured"],
    queryFn: () => propertyApi.getAll({ limit: 3, sortBy: "viewsCount" }),
  });

  const { data: latestData } = useQuery({
    queryKey: ["properties", "latest"],
    queryFn: () => propertyApi.getAll({ limit: 6, sortBy: "createdAt" }),
  });

  const featuredProperties = featuredData?.properties || [];
  const latestProperties = latestData?.properties || [];

  useEffect(() => {
    const t = setInterval(() => setServiceIndex((i) => (i + 1) % SERVICES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero: left = words + app badges, right = phone; responsive stack */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
              Find Your Perfect Home in Rwanda
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0">
              Discover houses, apartments, and commercial properties across Kigali and beyond.
            </p>
            <div className="max-w-xl mx-auto lg:mx-0 mb-6">
              <div className="flex gap-2 bg-background/80 dark:bg-background/90 rounded-xl shadow-lg border p-2">
                <input
                  type="text"
                  placeholder="Search by location, property type..."
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-muted/50 border-0 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Link href="/properties">
                  <Button size="lg" className="shrink-0">
                    <Search className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Search</span>
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                aria-label="Get it on Google Play"
              >
                <Image
                  src={landingImages.appStores.google}
                  alt="Get it on Google Play"
                  width={140}
                  height={42}
                  className="h-9 w-auto object-contain"
                />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                aria-label="Download on the App Store"
              >
                <Image
                  src={landingImages.appStores.apple}
                  alt="Download on the App Store"
                  width={140}
                  height={42}
                  className="h-9 w-auto object-contain"
                />
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md lg:max-w-lg order-1 lg:order-2 flex justify-center">
            <div className="relative w-full aspect-[9/16] max-h-[480px] lg:max-h-[520px]">
              <Image
                src={landingImages.hero.phone}
                alt="Murugo Homes app on phone"
                fill
                className="object-contain object-center drop-shadow-2xl"
                sizes="(max-width: 1024px) 280px, 400px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partner logos – sliding strip with title */}
      <section className="py-8 md:py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Our partners
          </h2>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee gap-12 md:gap-16 py-4">
            {[...landingImages.partners, ...landingImages.partners].map((src, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-12 md:w-32 md:h-14 relative grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
                <Image src={src} alt={`Partner ${(i % 6) + 1}`} fill className="object-contain object-center" sizes="128px" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties – limit 3 */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Hand-picked properties for you</p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="w-full sm:w-auto">
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
            <div className="text-center py-16 rounded-2xl border border-dashed text-muted-foreground">
              No featured properties at the moment. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* Services carousel – centered, 3 slides */}
      <section className="py-16 md:py-20 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our services</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Whether you’re renting, buying, or selling, we’re here to help.
          </p>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              <div className="relative aspect-[16/10] md:aspect-[2/1] bg-muted">
                {SERVICES.map((s, i) => (
                  <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      i === serviceIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 900px"
                    />
                  </div>
                ))}
              </div>
              <div className="p-6 md:p-8 text-center">
                <h3 className="text-xl md:text-2xl font-semibold mb-2">
                  {SERVICES[serviceIndex].title}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {SERVICES[serviceIndex].description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setServiceIndex((i) => (i - 1 + SERVICES.length) % SERVICES.length)}
                aria-label="Previous service"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex gap-2">
                {SERVICES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setServiceIndex(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === serviceIndex ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setServiceIndex((i) => (i + 1) % SERVICES.length)}
                aria-label="Next service"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Listings – limit 6 */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Listings</h2>
              <p className="text-muted-foreground">Recently added properties</p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="w-full sm:w-auto">
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
            <div className="text-center py-16 rounded-2xl border border-dashed text-muted-foreground">
              No listings yet. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Have a Property to List?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of property owners and reach potential buyers and renters across Rwanda.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-[#949DDB] hover:bg-[#949DDB]/90">
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
