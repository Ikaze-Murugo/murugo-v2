export interface PropertyMedia {
  id: string;
  propertyId: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  order: number;
  createdAt?: string;
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
  media?: PropertyMedia[];
  status: PropertyStatus;
  listerId: string;
  lister?: User;
  viewsCount: number;
  contactCount: number;
  shareCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  OFFICE = 'office',
  LAND = 'land',
  STUDIO = 'studio',
  VILLA = 'villa',
  COMMERCIAL = 'commercial',
}

export enum TransactionType {
  RENT = 'rent',
  SALE = 'sale',
  LEASE = 'lease',
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  SOLD = 'sold',
  PENDING = 'pending',
}

export interface Location {
  district: string;
  sector: string;
  cell: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  profileType?: string;
  whatsappNumber?: string;
  profile: UserProfile;
}

export interface UserProfile {
  id?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  companyName?: string;
  licenseNumber?: string;
  rating?: number;
  totalReviews?: number;
}

export interface PropertyFilters {
  search?: string;
  propertyType?: PropertyType;
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: 'price' | 'createdAt' | 'viewsCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  createdAt: string;
}
