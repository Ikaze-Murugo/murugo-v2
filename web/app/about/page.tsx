import Link from "next/link";
import { Target, Sparkles, Shield, Users, Home, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About us",
  description: "Learn about Murugo Homes and our mission to connect people with properties across Rwanda.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20 px-4 pb-24 md:pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-4 tracking-tight">
            About Murugo Homes
          </h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Rwanda&apos;s trusted platform for finding and listing properties. We connect
            renters, buyers, and sellers with quality homes, apartments, offices, and land across
            Kigali and beyond.
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-3">Our Mission</h2>
              <p className="text-neutral-600 leading-relaxed">
                To make property search and listing simple, transparent, and accessible for everyone—
                whether you&apos;re looking for a place to rent, a home to buy, or a way to list your
                property. We believe finding the perfect property should be straightforward and stress-free.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">What We Offer</h2>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="h-8 w-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Home className="h-4 w-4 text-neutral-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 text-sm mb-1">Browse Properties</h3>
                <p className="text-xs text-neutral-600">Search by type, location, and transaction (rent, sale, lease)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="h-8 w-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-neutral-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 text-sm mb-1">Direct Connection</h3>
                <p className="text-xs text-neutral-600">Connect with listers—individuals, commissioners, and companies</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="h-8 w-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-neutral-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 text-sm mb-1">Secure Listings</h3>
                <p className="text-xs text-neutral-600">Verified profiles and secure property listings</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="h-8 w-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-neutral-600" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 text-sm mb-1">Mobile App</h3>
                <p className="text-xs text-neutral-600">Coming soon for on-the-go property search</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-8 text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Have questions?</h2>
          <p className="text-neutral-600 mb-6">
            We&apos;re here to help. Get in touch with our team.
          </p>
          <Link href="/contact">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium rounded-lg transition-all shadow-sm hover:shadow">
              Contact us
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
