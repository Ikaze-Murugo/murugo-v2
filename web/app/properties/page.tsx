"use client";

import { PropertyCard } from "@/components/property/property-card";
import { PropertyFilters } from "@/components/property/property-filters";
import { Button } from "@/components/ui/button";
import { propertyApi } from "@/lib/api/endpoints";
import { PropertyFilters as Filters } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertiesPage() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 12,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["properties", filters],
    queryFn: () => propertyApi.getAll(filters),
  });

  const properties = data?.properties || [];
  const pagination = data?.pagination;

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen py-6 px-4 bg-[#f8f8f5] dark:bg-[#1a1a2e]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1.5">Browse Properties</h1>
          <p className="text-muted-foreground text-sm">
            {pagination?.total || 0} properties available
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <PropertyFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground text-sm">Loading properties...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm">Failed to load properties. Please try again.</p>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && !error && properties.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.page) <= 1;

                    if (!showPage) {
                      // Show ellipsis
                      if (
                        page === pagination.page - 2 ||
                        page === pagination.page + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-xs text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="text-xs min-w-[32px]"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm mb-4">
              No properties found matching your criteria.
            </p>
            <Button variant="outline" onClick={() => setFilters({ page: 1, limit: 12 })} size="sm" className="text-xs">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
