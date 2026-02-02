import apiClient from './client';
import type { Property, PropertyFilters, PaginationMeta } from '../types/property.types';

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
};
