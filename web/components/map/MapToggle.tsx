"use client";

import { useState } from "react";
import { Map, List } from "lucide-react";
import PropertyMap from "./PropertyMap";
import { Property } from "@/lib/types";

interface MapToggleProps {
  properties: Property[];
  listView: React.ReactNode;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export default function MapToggle({ properties, listView, onBoundsChange }: MapToggleProps) {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <div className="relative">
      {/* Toggle Buttons - Mobile Only */}
      <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-full shadow-lg p-1 flex gap-1">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            view === "list"
              ? "bg-gradient-to-r from-[#949DDB] to-[#7B85CB] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <List className="h-4 w-4" />
          <span className="text-sm font-medium">List</span>
        </button>
        <button
          onClick={() => setView("map")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            view === "map"
              ? "bg-gradient-to-r from-[#949DDB] to-[#7B85CB] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Map className="h-4 w-4" />
          <span className="text-sm font-medium">Map</span>
        </button>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {view === "list" ? (
          listView
        ) : (
          <div className="fixed inset-0 top-14 bottom-16 z-40">
            <PropertyMap
              properties={properties}
              onBoundsChange={onBoundsChange}
              className="h-full w-full"
            />
          </div>
        )}
      </div>

      {/* Desktop View - Split Screen */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {/* List View */}
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {listView}
        </div>

        {/* Map View */}
        <div className="sticky top-20 h-[calc(100vh-200px)]">
          <PropertyMap
            properties={properties}
            onBoundsChange={onBoundsChange}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
