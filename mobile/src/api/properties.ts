import apiClient from './client';
import type {
  Property,
  PropertyFilters,
  PaginationMeta,
  PropertyType,
  TransactionType,
  Location,
} from '../types/property.types';

interface ApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
}

interface PropertiesResponse {
  properties: Property[];
  pagination: PaginationMeta;
}

function buildParams(filters?: PropertyFilters): Record<string, unknown> {
  if (!filters) return {};
  const { propertyType, ...rest } = filters;
  return {
    ...rest,
    ...(propertyType != null && { type: propertyType }),
  };
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  currency?: string;
  location: Location & { latitude?: number | null; longitude?: number | null };
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  yearBuilt?: number;
}

export interface PropertyAnalytics {
  analytics: { views?: number; totalViews?: number };
}

export const propertyApi = {
  getAll: async (filters?: PropertyFilters): Promise<PropertiesResponse> => {
    const params = buildParams(filters);
    const res = await apiClient.get<ApiResponse<PropertiesResponse>>('/properties', { params });
    return res.data;
  },

  getById: async (id: string): Promise<Property> => {
    const res = await apiClient.get<ApiResponse<{ property: Property }>>(`/properties/${id}`);
    return res.data.property;
  },

  getMyListings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PropertiesResponse> => {
    const res = await apiClient.get<ApiResponse<PropertiesResponse>>('/properties/my/listings', {
      params: { page: params?.page ?? 1, limit: params?.limit ?? 20, status: params?.status },
    });
    return res.data;
  },

  create: async (payload: CreatePropertyPayload): Promise<Property> => {
    const body = {
      ...payload,
      location: {
        ...payload.location,
        latitude: payload.location.latitude ?? null,
        longitude: payload.location.longitude ?? null,
      },
    };
    const res = await apiClient.post<ApiResponse<{ property: Property }>>('/properties', body);
    return res.data.property;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.patch(`/properties/${id}/status`, { status });
  },

  getAnalytics: async (id: string): Promise<PropertyAnalytics> => {
    const res = await apiClient.get<ApiResponse<PropertyAnalytics>>(`/properties/${id}/analytics`);
    return res.data;
  },
};
