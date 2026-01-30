// User types
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: "user" | "lister" | "admin";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  avatarUrl?: string;
  bio?: string;
  whatsappNumber?: string;
  isCommissioner: boolean;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  user: User;
  accessToken: string;
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
  name: string;
}

// Property types
export type PropertyType = "house" | "apartment" | "office" | "land" | "commercial";
export type PropertyStatus = "available" | "rented" | "sold" | "pending";

export interface Property {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  location: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities?: string[];
  status: PropertyStatus;
  viewCount: number;
  contactCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  media?: PropertyMedia[];
}

export interface PropertyMedia {
  id: string;
  propertyId: string;
  url: string;
  type: "image" | "video";
  createdAt: string;
}

// User preferences
export interface UserPreference {
  id: string;
  userId: string;
  propertyTypes?: PropertyType[];
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations?: string[];
  bedrooms?: number;
  bathrooms?: number;
  requiredAmenities?: string[];
  createdAt: string;
  updatedAt: string;
}

// Favorite
export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property?: Property;
}

// Review
export interface Review {
  id: string;
  userId: string;
  propertyId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// API response wrapper
export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Property filters
export interface PropertyFilters extends PaginationParams {
  search?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  status?: PropertyStatus;
  sortBy?: "price" | "createdAt" | "viewCount";
  sortOrder?: "asc" | "desc";
}
