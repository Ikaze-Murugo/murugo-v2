import apiClient from './client';
import type { Favorite } from '../types/property.types';

interface ApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
}

interface FavoritesListResponse {
  favorites: Favorite[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const favoriteApi = {
  getAll: async (): Promise<Favorite[]> => {
    const res = await apiClient.get<ApiResponse<FavoritesListResponse>>('/favorites');
    const payload = res.data;
    return payload?.favorites ?? [];
  },

  add: async (propertyId: string): Promise<Favorite> => {
    const res = await apiClient.post<ApiResponse<{ favorite: Favorite }>>(`/favorites/${propertyId}`);
    return res.data.favorite;
  },

  remove: async (propertyId: string): Promise<void> => {
    await apiClient.delete(`/favorites/${propertyId}`);
  },

  check: async (propertyId: string): Promise<boolean> => {
    const res = await apiClient.get<ApiResponse<{ isFavorite: boolean }>>(
      `/favorites/check/${propertyId}`
    );
    return res.data?.isFavorite ?? false;
  },
};
