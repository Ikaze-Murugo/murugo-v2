// ========================================
// USER TYPES
// ========================================

export enum UserRole {
  SEEKER = "seeker",
  LISTER = "lister",
  ADMIN = "admin",
}

export enum ProfileType {
  INDIVIDUAL = "individual",
  COMMISSIONER = "commissioner",
  COMPANY = "company",
}

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  profileType?: ProfileType;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isVerified: boolean;
  whatsappNumber?: string;
  profile?: Profile;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  companyName?: string;
  licenseNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// AUTH TYPES
// ========================================

export interface AuthResponse {
  user: User;
  token: string; // Backend sends 'token', not 'accessToken'
  accessToken?: string; // Keep for backwards compatibility
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  name?: string;
  role: UserRole;
  profileType?: ProfileType;
}

// ========================================
// PROPERTY TYPES
// ========================================

export enum PropertyType {
  HOUSE = "house",
  APARTMENT = "apartment",
  OFFICE = "office",
  LAND = "land",
  STUDIO = "studio",
  VILLA = "villa",
  COMMERCIAL = "commercial",
}

export enum TransactionType {
  RENT = "rent",
  SALE = "sale",
  LEASE = "lease",
}

export enum PropertyStatus {
  AVAILABLE = "available",
  RENTED = "rented",
  SOLD = "sold",
  PENDING = "pending",
}

export interface Location {
  district: string;
  sector: string;
  cell: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  currency: string;
  location: Location;
  amenities: string[];
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  yearBuilt?: number;
  availabilityDate?: string;
  status: PropertyStatus;
  viewsCount: number;
  contactCount: number;
  shareCount: number;
  isFeatured: boolean;
  featuredUntil?: string;
  listerId: string;
  lister?: User;
  media?: PropertyMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyMedia {
  id: string;
  propertyId: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  order: number;
  createdAt: string;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  currency?: string;
  location: Location;
  amenities: string[];
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  yearBuilt?: number;
  availabilityDate?: string;
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  status?: PropertyStatus;
}

// ========================================
// FAVORITE TYPES
// ========================================

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  createdAt: string;
}

// ========================================
// REVIEW TYPES
// ========================================

export interface Review {
  id: string;
  userId: string;
  propertyId: string;
  rating: number;
  comment: string;
  user?: User;
  property?: Property;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  propertyId: string;
  rating: number;
  comment: string;
}

// ========================================
// USER PREFERENCE TYPES
// ========================================

export interface UserPreference {
  id: string;
  userId: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredPropertyTypes: PropertyType[];
  preferredLocations: string[];
  requiredAmenities: string[];
  minBedrooms?: number;
  minBathrooms?: number;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// PAGINATION TYPES
// ========================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ========================================
// FILTER TYPES
// ========================================

export interface PropertyFilters {
  search?: string;
  propertyType?: PropertyType;
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  sortBy?: "price" | "createdAt" | "viewsCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
  error?: string;
}
