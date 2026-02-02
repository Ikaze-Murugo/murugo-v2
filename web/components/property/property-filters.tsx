"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyFilters as Filters, PropertyType, TransactionType } from "@/lib/types";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface PropertyFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function PropertyFilters({ filters, onFiltersChange }: PropertyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resetPage = (next: Filters) => ({ ...next, page: 1 });

  const handleSearchChange = (value: string) => {
    onFiltersChange(resetPage({ ...filters, search: value || undefined }));
  };

  const handlePropertyTypeChange = (type: PropertyType | "") => {
    onFiltersChange(resetPage({ ...filters, propertyType: type || undefined }));
  };

  const handleTransactionTypeChange = (type: TransactionType | "") => {
    onFiltersChange(resetPage({ ...filters, transactionType: type || undefined }));
  };

  const handlePriceChange = (min: string, max: string) => {
    onFiltersChange(
      resetPage({
        ...filters,
        minPrice: min ? parseFloat(min) : undefined,
        maxPrice: max ? parseFloat(max) : undefined,
      })
    );
  };

  const handleBedroomsChange = (value: string) => {
    onFiltersChange(
      resetPage({ ...filters, bedrooms: value ? parseInt(value) : undefined })
    );
  };

  const handleBathroomsChange = (value: string) => {
    onFiltersChange(
      resetPage({ ...filters, bathrooms: value ? parseInt(value) : undefined })
    );
  };

  const handleReset = () => {
    onFiltersChange({
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, location..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          {/* Property Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Property Type</label>
            <select
              value={filters.propertyType || ""}
              onChange={(e) => handlePropertyTypeChange(e.target.value as PropertyType | "")}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Types</option>
              <option value={PropertyType.HOUSE}>House</option>
              <option value={PropertyType.APARTMENT}>Apartment</option>
              <option value={PropertyType.OFFICE}>Office</option>
              <option value={PropertyType.LAND}>Land</option>
              <option value={PropertyType.STUDIO}>Studio</option>
              <option value={PropertyType.VILLA}>Villa</option>
              <option value={PropertyType.COMMERCIAL}>Commercial</option>
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Transaction Type</label>
            <select
              value={filters.transactionType || ""}
              onChange={(e) => handleTransactionTypeChange(e.target.value as TransactionType | "")}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All</option>
              <option value={TransactionType.RENT}>Rent</option>
              <option value={TransactionType.SALE}>Sale</option>
              <option value={TransactionType.LEASE}>Lease</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Min Price</label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) => handlePriceChange(e.target.value, String(filters.maxPrice || ""))}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max Price</label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={(e) => handlePriceChange(String(filters.minPrice || ""), e.target.value)}
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="text-sm font-medium mb-2 block">Bedrooms</label>
            <select
              value={filters.bedrooms || ""}
              onChange={(e) => handleBedroomsChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="text-sm font-medium mb-2 block">Bathrooms</label>
            <select
              value={filters.bathrooms || ""}
              onChange={(e) => handleBathroomsChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <select
              value={filters.sortBy || "createdAt"}
              onChange={(e) => onFiltersChange(resetPage({ ...filters, sortBy: e.target.value as any }))}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="createdAt">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="viewsCount">Most Viewed</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <Button variant="outline" onClick={handleReset} className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
