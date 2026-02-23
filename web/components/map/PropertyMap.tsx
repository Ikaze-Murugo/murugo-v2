"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/lib/types";
import { MapPin, Bed, Bath, Maximize2, DollarSign } from "lucide-react";
import Link from "next/link";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon for properties
const createCustomIcon = (price: number, isFeatured: boolean) => {
  const color = isFeatured ? "#949DDB" : "#6B7280";
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        border: 2px solid white;
      ">
        $${price.toLocaleString()}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
};

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  className?: string;
}

// Component to handle map events
function MapEvents({ onBoundsChange }: { onBoundsChange?: PropertyMapProps["onBoundsChange"] }) {
  const map = useMap();

  useEffect(() => {
    if (!onBoundsChange) return;

    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };

    map.on("moveend", handleMoveEnd);
    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
}

export default function PropertyMap({
  properties,
  center = [-1.9536, 30.0606], // Kigali, Rwanda
  zoom = 13,
  onBoundsChange,
  className = "",
}: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Only render map on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onBoundsChange={onBoundsChange} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {properties.map((property) => {
            // Use property location or default to Kigali with slight offset
            // Use property location coordinates if available, otherwise use random position near center
            // Note: Backend doesn't have lat/lng yet, so we'll use random positions for now
            const position: [number, number] = [
              center[0] + (Math.random() - 0.5) * 0.1,
              center[1] + (Math.random() - 0.5) * 0.1,
            ];

            return (
              <Marker
                key={property.id}
                position={position}
                icon={createCustomIcon(property.price, property.isFeatured)}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <Link href={`/properties/${property.id}`} className="block">
                    <div className="p-2">
                      {/* Property Image */}
                      {property.media && property.media.length > 0 && (
                        <div className="relative h-32 mb-2 rounded-lg overflow-hidden">
                          <img
                            src={property.media[0].url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                          {property.isFeatured && (
                            <span className="absolute top-2 right-2 bg-gradient-to-r from-[#949DDB] to-[#7B85CB] text-white text-xs px-2 py-1 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      )}

                      {/* Property Title */}
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {property.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-xs text-gray-600 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">{typeof property.location === 'string' ? property.location : property.location.address}</span>
                      </div>

                      {/* Property Details */}
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.sizeSqm && (
                          <div className="flex items-center gap-1">
                            <Maximize2 className="h-3 w-3" />
                            <span>{property.sizeSqm} m²</span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-[#949DDB]" />
                          <span className="font-bold text-[#949DDB]">
                            ${property.price.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs text-white bg-gradient-to-r from-[#949DDB] to-[#7B85CB] px-2 py-1 rounded-full">
                          View Details
                        </span>
                      </div>
                    </div>
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-xs font-semibold mb-2">Legend</div>
        <div className="flex items-center gap-2 text-xs mb-1">
          <div className="w-4 h-4 rounded-full bg-[#949DDB]"></div>
          <span>Featured Properties</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 rounded-full bg-gray-500"></div>
          <span>Regular Properties</span>
        </div>
      </div>
    </div>
  );
}
