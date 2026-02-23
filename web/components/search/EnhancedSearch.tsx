"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, MapPin, DollarSign, Home, Bed, Bath, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyFilters as Filters } from "@/lib/types";

interface EnhancedSearchProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSaveSearch?: () => void;
}

export default function EnhancedSearch({ filters, onFiltersChange, onSaveSearch }: EnhancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: Filters = { page: 1, limit: filters.limit || 12 };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.search ||
      localFilters.propertyType ||
      localFilters.transactionType ||
      localFilters.minPrice ||
      localFilters.maxPrice ||
      localFilters.bedrooms ||
      localFilters.bathrooms ||

      localFilters.location
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Main Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, location, or description..."
            value={localFilters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Button
          variant={showAdvanced ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Property Type & Transaction Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                <Home className="h-3.5 w-3.5" />
                Property Type
              </label>
              <select
                value={localFilters.propertyType || ""}
                onChange={(e) => handleFilterChange("propertyType", e.target.value || undefined)}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#949DDB]"
              >
                <option value="">All Types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                <DollarSign className="h-3.5 w-3.5" />
                Transaction Type
              </label>
              <select
                value={localFilters.transactionType || ""}
                onChange={(e) => handleFilterChange("transactionType", e.target.value || undefined)}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#949DDB]"
              >
                <option value="">All Transactions</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
              <MapPin className="h-3.5 w-3.5" />
              Location
            </label>
            <Input
              type="text"
              placeholder="Enter city, neighborhood, or address..."
              value={localFilters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value || undefined)}
              className="text-sm"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
              <DollarSign className="h-3.5 w-3.5" />
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={localFilters.minPrice || ""}
                onChange={(e) => handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={localFilters.maxPrice || ""}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                <Bed className="h-3.5 w-3.5" />
                Bedrooms
              </label>
              <select
                value={localFilters.bedrooms || ""}
                onChange={(e) => handleFilterChange("bedrooms", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#949DDB]"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                <Bath className="h-3.5 w-3.5" />
                Bathrooms
              </label>
              <select
                value={localFilters.bathrooms || ""}
                onChange={(e) => handleFilterChange("bathrooms", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#949DDB]"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>



          {/* Save Search Button */}
          {onSaveSearch && hasActiveFilters() && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveSearch}
                className="w-full text-xs"
              >
                Save This Search
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters() && !showAdvanced && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
          {localFilters.propertyType && (
            <span className="inline-flex items-center gap-1 bg-[#949DDB]/10 text-[#949DDB] text-xs px-2 py-1 rounded-full">
              {localFilters.propertyType}
              <button onClick={() => handleFilterChange("propertyType", undefined)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {localFilters.transactionType && (
            <span className="inline-flex items-center gap-1 bg-[#949DDB]/10 text-[#949DDB] text-xs px-2 py-1 rounded-full">
              {localFilters.transactionType}
              <button onClick={() => handleFilterChange("transactionType", undefined)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {localFilters.location && (
            <span className="inline-flex items-center gap-1 bg-[#949DDB]/10 text-[#949DDB] text-xs px-2 py-1 rounded-full">
              📍 {localFilters.location}
              <button onClick={() => handleFilterChange("location", undefined)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
