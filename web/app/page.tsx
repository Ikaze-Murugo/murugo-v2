"use client";

import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { propertyApi } from "@/lib/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { landingImages } from "@/lib/data/landing-images";

const FAQ_ITEMS = [
  {
    q: "How do I search for a property?",
    a: "Use the search bar on the home page or go to All properties. You can filter by type (house, apartment, etc.), transaction (rent/sale/lease), location, price, and number of bedrooms or bathrooms.",
  },
  {
    q: "Can I list my property without an account?",
    a: "You need to sign up as a lister to create listings. Register with \"I want to list properties\" and then add your property from the dashboard.",
  },
  {
    q: "How do I contact a property owner or lister?",
    a: "Sign in or create an account. On any property page you can see contact options and message or call the lister directly.",
  },
  {
    q: "What areas do you cover?",
    a: "We list properties across Rwanda, including Kigali and other districts. Use the location filter or search by district or sector to find properties in your preferred area.",
  },
  {
    q: "Is the mobile app available?",
    a: "Yes. The Android app (APK) is available from our Download page—use the \"Download app\" link in the menu or go to the homepage and tap the Android download button. iOS is coming soon. The website works on all devices too.",
  },
];

const SERVICES = [
  { id: "renting", ...landingImages.services.renting },
  { id: "buying", ...landingImages.services.buying },
  { id: "selling", ...landingImages.services.selling },
] as const;

export default function HomePage() {
  const [serviceIndex, setServiceIndex] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

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
    <div className="min-h-screen bg-[#f8f8f5] dark:bg-[#1a1a2e]">
      {/* Hero: left = words + app badges, right = phone; responsive stack */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-10 md:py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5 tracking-tight">
              Find Your Perfect Home in Rwanda
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-5 max-w-xl mx-auto lg:mx-0">
              Discover houses, apartments, and commercial properties across Kigali and beyond.
            </p>
            <div className="max-w-xl mx-auto lg:mx-0 mb-5">
              <div className="flex gap-2 bg-background/80 dark:bg-background/90 rounded-xl shadow-lg border p-2">
                <input
                  type="text"
                  placeholder="Search by location, property type..."
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm rounded-lg bg-muted/50 border-0 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Link href="/properties">
                  <Button size="sm" className="shrink-0 text-sm">
                    <Search className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Search</span>
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors font-medium"
              >
                <Image
                  src={landingImages.appStores.google}
                  alt="Download Android app"
                  width={120}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
                <span className="text-xs font-semibold">APK</span>
              </Link>
              <span className="relative inline-block">
                <span className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border bg-muted/50 cursor-not-allowed opacity-90">
                  <Image
                    src={landingImages.appStores.apple}
                    alt="Download on the App Store"
                    width={120}
                    height={36}
                    className="h-8 w-auto object-contain"
                  />
                </span>
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded shadow">
                  Coming soon
                </span>
              </span>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md lg:max-w-lg order-1 lg:order-2 flex justify-center">
            <div className="relative w-full aspect-[9/16] max-h-[420px] lg:max-h-[480px]">
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
      <section className="py-6 md:py-10 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 mb-5">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Our partners
          </h2>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee gap-10 md:gap-14 py-3">
            {[...landingImages.partners, ...landingImages.partners].map((src, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-20 h-10 md:w-28 md:h-12 relative grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300 hover:scale-105"
              >
                <Image src={src} alt={`Partner ${(i % 6) + 1}`} fill className="object-contain object-center" sizes="112px" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties – limit 3 */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1.5">Featured Properties</h2>
              <p className="text-muted-foreground text-sm">Hand-picked properties for you</p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="w-full sm:w-auto text-xs" size="sm">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </div>

          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed text-muted-foreground text-sm">
              No featured properties at the moment. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* Services carousel – centered, 3 slides */}
      <section className="py-12 md:py-16 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Our services</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto text-sm">
            Whether you're renting, buying, or selling, we're here to help.
          </p>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
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
              <div className="p-5 md:p-6 text-center">
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  {SERVICES[serviceIndex].title}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  {SERVICES[serviceIndex].description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setServiceIndex((i) => (i - 1 + SERVICES.length) % SERVICES.length)}
                aria-label="Previous service"
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1.5">
                {SERVICES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setServiceIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === serviceIndex ? "w-7 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Listings – limit 6 */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1.5">Latest Listings</h2>
              <p className="text-muted-foreground text-sm">Recently added properties</p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="w-full sm:w-auto text-xs" size="sm">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </Link>
          </div>

          {latestProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed text-muted-foreground text-sm">
              No listings yet. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 px-4 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-1.5 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Quick answers to common questions about Murugo Homes.
          </p>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left font-medium hover:bg-muted/50 transition-colors text-sm"
                >
                  <span className="text-foreground">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      faqOpen === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ${
                    faqOpen === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden border-t">
                    <p className="px-4 pb-3.5 pt-3.5 text-muted-foreground text-xs leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Have a Property to List?</h2>
          <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of property owners and reach potential buyers and renters across Rwanda.
          </p>
          <Link href="/register">
            <Button size="sm" className="bg-[#949DDB] hover:bg-[#949DDB]/90 text-sm">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
