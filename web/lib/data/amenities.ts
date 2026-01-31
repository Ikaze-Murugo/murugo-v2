/**
 * Categorized amenities for property listing (multi-select).
 * Backend expects array of strings; we send selected + custom.
 */

export interface AmenityOption {
  id: string;
  label: string;
  category: string;
}

export const AMENITY_CATEGORIES: { id: string; label: string }[] = [
  { id: "utilities", label: "Utilities & Services" },
  { id: "security", label: "Security & Access" },
  { id: "parking", label: "Parking & Transport" },
  { id: "kitchen", label: "Kitchen & Appliances" },
  { id: "furnishing", label: "Furnishing" },
  { id: "outdoor", label: "Outdoor & Extras" },
  { id: "building", label: "Building Amenities" },
  { id: "lifestyle", label: "Accessibility & Lifestyle" },
];

export const AMENITIES_BY_CATEGORY: Record<string, AmenityOption[]> = {
  utilities: [
    { id: "24_7_water", label: "24/7 Water Supply", category: "utilities" },
    { id: "electricity", label: "EUCL Electricity", category: "utilities" },
    { id: "solar_backup", label: "Solar Backup", category: "utilities" },
    { id: "generator", label: "Generator", category: "utilities" },
    { id: "backup_water_tank", label: "Backup Water Tank", category: "utilities" },
    { id: "wifi_ready", label: "WiFi/Internet Ready", category: "utilities" },
    { id: "cable_tv", label: "Cable TV Ready", category: "utilities" },
  ],
  security: [
    { id: "gated", label: "Gated Community", category: "security" },
    { id: "security_24_7", label: "Security Guard (24/7)", category: "security" },
    { id: "cctv", label: "CCTV Cameras", category: "security" },
    { id: "alarm", label: "Alarm System", category: "security" },
    { id: "electric_gate", label: "Electric Gate", category: "security" },
    { id: "intercom", label: "Intercom System", category: "security" },
  ],
  parking: [
    { id: "parking_1", label: "Parking (1 space)", category: "parking" },
    { id: "parking_2_plus", label: "Parking (2+ spaces)", category: "parking" },
    { id: "garage", label: "Garage", category: "parking" },
    { id: "covered_parking", label: "Covered Parking", category: "parking" },
    { id: "near_public_transport", label: "Near Public Transport", category: "parking" },
  ],
  kitchen: [
    { id: "modern_kitchen", label: "Modern Kitchen", category: "kitchen" },
    { id: "kitchen_cabinets", label: "Kitchen Cabinets", category: "kitchen" },
    { id: "gas_cooker", label: "Gas Cooker Installed", category: "kitchen" },
    { id: "refrigerator", label: "Refrigerator Included", category: "kitchen" },
    { id: "washing_machine", label: "Washing Machine", category: "kitchen" },
  ],
  furnishing: [
    { id: "fully_furnished", label: "Fully Furnished", category: "furnishing" },
    { id: "semi_furnished", label: "Semi-Furnished", category: "furnishing" },
    { id: "unfurnished", label: "Unfurnished", category: "furnishing" },
    { id: "air_conditioning", label: "Air Conditioning", category: "furnishing" },
    { id: "ceiling_fans", label: "Ceiling Fans", category: "furnishing" },
  ],
  outdoor: [
    { id: "garden", label: "Garden/Yard", category: "outdoor" },
    { id: "balcony", label: "Balcony", category: "outdoor" },
    { id: "terrace", label: "Terrace/Rooftop", category: "outdoor" },
    { id: "swimming_pool_private", label: "Swimming Pool (Private)", category: "outdoor" },
    { id: "swimming_pool_shared", label: "Swimming Pool (Shared)", category: "outdoor" },
    { id: "parking_outdoor", label: "Parking Area", category: "outdoor" },
  ],
  building: [
    { id: "elevator", label: "Elevator/Lift", category: "building" },
    { id: "gym", label: "Gym/Fitness Center", category: "building" },
    { id: "laundry_room", label: "Laundry Room", category: "building" },
    { id: "storage_room", label: "Storage Room", category: "building" },
    { id: "servant_quarter", label: "Servant's Quarter", category: "building" },
  ],
  lifestyle: [
    { id: "wheelchair_accessible", label: "Wheelchair Accessible", category: "lifestyle" },
    { id: "pet_friendly", label: "Pet Friendly", category: "lifestyle" },
    { id: "near_schools", label: "Near Schools", category: "lifestyle" },
    { id: "near_hospitals", label: "Near Hospitals", category: "lifestyle" },
    { id: "near_shopping", label: "Near Shopping Centers", category: "lifestyle" },
    { id: "quiet_neighborhood", label: "Quiet Neighborhood", category: "lifestyle" },
  ],
};

/** Flat list of all predefined amenity IDs for quick lookup */
export const ALL_AMENITY_IDS = Object.values(AMENITIES_BY_CATEGORY).flatMap((arr) =>
  arr.map((a) => a.id)
);
