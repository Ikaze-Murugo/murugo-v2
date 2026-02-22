"use client";

import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyCardHorizontal } from "@/components/property/property-card-horizontal";
import { propertyApi } from "@/lib/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Home as HomeIcon,
  Building,
  Building2,
  Store,
  Warehouse,
  LandPlot,
  Hotel
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

const PROPERTY_TYPES = [
  { id: "rent", label: "For Rent", icon: HomeIcon, filter: { transaction: "rent" } },
  { id: "sale", label: "For Sale", icon: Building, filter: { transaction: "sale" } },
  { id: "commercial", label: "Commercial", icon: Store, filter: { propertyType: "commercial" } },
  { id: "condo", label: "Condo", icon: Building2, filter: { propertyType: "condo" } },
  { id: "apartment", label: "Apartment", icon: Hotel, filter: { propertyType: "apartment" } },
  { id: "house", label: "House", icon: HomeIcon, filter: { propertyType: "house" } },
  { id: "land", label: "Land", icon: LandPlot, filter: { propertyType: "land" } },
  { id: "warehouse", label: "Warehouse", icon: Warehouse, filter: { propertyType: "warehouse" } },
];

export default function HomePage() {
  const [serviceIndex, setServiceIndex] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleProperties, setVisibleProperties] = useState(6);
  const propertyTypeScrollRef = useRef<HTMLDivElement>(null);

  const { data: featuredData } = useQuery({
    queryKey: ["properties", "featured"],
    queryFn: () => propertyApi.getAll({ limit: 6, sortBy: "viewsCount" }),
  });

  const { data: allPropertiesData } = useQuery({
    queryKey: ["properties", "all"],
    queryFn: () => propertyApi.getAll({ limit: 20, sortBy: "createdAt" }),
  });

  const featuredProperties = featuredData?.properties || [];
  const allProperties = allPropertiesData?.properties || [];

  useEffect(() => {
    const t = setInterval(() => setServiceIndex((i) => (i + 1) % SERVICES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const scrollPropertyTypes = (direction: "left" | "right") => {
    if (propertyTypeScrollRef.current) {
      const scrollAmount = 200;
      propertyTypeScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleLoadMore = () => {
    setVisibleProperties((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafaf8] to-[#f5f5f3]">
      {/* Hero Section - Only on Web (Desktop) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-12 md:py-20 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Find Your Perfect Home in Rwanda
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Discover houses, apartments, and commercial properties across Kigali and beyond. Your dream property is just a search away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/properties">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Explore Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/download">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl border-2">
                  Download App
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-3xl"></div>
              <Image
                src={landingImages.hero.phone}
                alt="Murugo Homes App"
                width={400}
                height={800}
                className="relative z-10 mx-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-6 px-4 bg-white/50 backdrop-blur-sm sticky top-14 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 bg-white rounded-2xl shadow-lg border-0 p-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, property type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
            <Link href={`/properties${searchQuery ? `?search=${searchQuery}` : ""}`}>
              <Button size="lg" className="px-8 rounded-xl shadow-md">
                Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Property Types Carousel - "What are you looking for?" */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">What are you looking for?</h2>
          
          <div className="relative">
            <button
              onClick={() => scrollPropertyTypes("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hidden md:block"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={propertyTypeScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Link
                    key={type.id}
                    href={`/properties?${new URLSearchParams(type.filter as any).toString()}`}
                    className="flex-shrink-0"
                  >
                    <div className="flex flex-col items-center justify-center w-28 h-28 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 group">
                      <Icon className="h-8 w-8 mb-2 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700 text-center px-2">
                        {type.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => scrollPropertyTypes("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hidden md:block"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Properties</h2>
            <Link href="/properties?featured=true">
              <Button variant="ghost" className="gap-2 hover:gap-3 transition-all">
                See All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {featuredProperties.length > 0 ? (
            <>
              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              {/* Mobile: Horizontal Cards */}
              <div className="md:hidden space-y-4">
                {featuredProperties.map((property) => (
                  <PropertyCardHorizontal key={property.id} property={property} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No featured properties available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* All Properties */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">All Properties</h2>
            <Link href="/properties">
              <Button variant="ghost" className="gap-2 hover:gap-3 transition-all">
                See All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {allProperties.length > 0 ? (
            <>
              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {allProperties.slice(0, visibleProperties).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              {/* Mobile: Horizontal Cards */}
              <div className="md:hidden space-y-4">
                {allProperties.slice(0, visibleProperties).map((property) => (
                  <PropertyCardHorizontal key={property.id} property={property} />
                ))}
              </div>

              {visibleProperties < allProperties.length && (
                <div className="text-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 rounded-xl border-2"
                  >
                    Load More Properties
                    <ChevronDown className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No properties available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Services Section - Only on Web (Desktop) */}
      <section className="py-16 px-4 bg-white/50 hidden md:block">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Only on Web (Desktop) */}
      <section className="py-16 px-4 hidden md:block">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border-0 overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      faqOpen === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Only on Web (Desktop) */}
      <footer className="bg-gray-900 text-white py-12 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Murugo Homes</h3>
              <p className="text-gray-400 text-sm">
                Your trusted platform for finding properties in Rwanda.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/properties" className="text-gray-400 hover:text-white transition-colors">All Properties</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Listers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">List Your Property</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Download App</h4>
              <Link href="/download">
                <Button variant="outline" className="w-full">
                  Get the App
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Murugo Homes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
