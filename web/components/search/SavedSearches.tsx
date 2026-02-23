"use client";

import { useState, useEffect } from "react";
import { Bookmark, Trash2, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyFilters as Filters } from "@/lib/types";

interface SavedSearch {
  id: string;
  name: string;
  filters: Filters;
  notifications: boolean;
  createdAt: string;
}

interface SavedSearchesProps {
  onApplySearch: (filters: Filters) => void;
}

export default function SavedSearches({ onApplySearch }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedSearches");
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever searches change
  useEffect(() => {
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
  }, [savedSearches]);

  const deleteSearch = (id: string) => {
    setSavedSearches(savedSearches.filter((search) => search.id !== id));
  };

  const toggleNotifications = (id: string) => {
    setSavedSearches(
      savedSearches.map((search) =>
        search.id === id ? { ...search, notifications: !search.notifications } : search
      )
    );
  };

  const getSearchDescription = (filters: Filters): string => {
    const parts: string[] = [];
    
    if (filters.propertyType) parts.push(filters.propertyType);
    if (filters.transactionType) parts.push(`for ${filters.transactionType}`);
    if (filters.location) parts.push(`in ${filters.location}`);
    if (filters.bedrooms) parts.push(`${filters.bedrooms}+ beds`);
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = `$${filters.minPrice?.toLocaleString() || "0"} - $${filters.maxPrice?.toLocaleString() || "∞"}`;
      parts.push(priceRange);
    }
    
    return parts.length > 0 ? parts.join(", ") : "All properties";
  };

  if (savedSearches.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSaved(!showSaved)}
        className="text-xs"
      >
        <Bookmark className="h-4 w-4 mr-2" />
        Saved Searches ({savedSearches.length})
      </Button>

      {showSaved && (
        <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{search.name}</h4>
                  <p className="text-xs text-gray-600 truncate">{getSearchDescription(search.filters)}</p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNotifications(search.id)}
                    className="text-xs h-8 w-8 p-0"
                    title={search.notifications ? "Disable notifications" : "Enable notifications"}
                  >
                    {search.notifications ? (
                      <Bell className="h-4 w-4 text-[#949DDB]" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplySearch(search.filters)}
                    className="text-xs"
                  >
                    Apply
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSearch(search.id)}
                    className="text-xs h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook to save a new search
export function useSaveSearch() {
  const saveSearch = (name: string, filters: Filters) => {
    const saved = localStorage.getItem("savedSearches");
    const searches: SavedSearch[] = saved ? JSON.parse(saved) : [];

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      notifications: false,
      createdAt: new Date().toISOString(),
    };

    searches.push(newSearch);
    localStorage.setItem("savedSearches", JSON.stringify(searches));

    return newSearch;
  };

  return { saveSearch };
}
