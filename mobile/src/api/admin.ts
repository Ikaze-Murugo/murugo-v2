import apiClient from './client';
import type { Property, PaginationMeta, PropertyStatus } from '../types/property.types';

interface ApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
}

export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  availableProperties: number;
  pendingApprovals: number;
  totalViews: number;
}

export interface AdminUser {
  id: string;
  email: string;
  phone: string;
  role: string;
  profileType?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
  profile: {
    id?: string;
    name?: string;
    companyName?: string;
  } | null;
  propertiesCount?: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: PaginationMeta;
}

export interface PendingPropertiesResponse {
  properties: Property[];
  pagination: PaginationMeta;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
    return res.data;
  },

  getUsers: async (params?: {
    role?: 'seeker' | 'lister' | 'admin';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminUsersResponse> => {
    const res = await apiClient.get<ApiResponse<AdminUsersResponse>>('/admin/users', {
      params: {
        role: params?.role,
        search: params?.search,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    });
    return res.data;
  },

  getPendingProperties: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PendingPropertiesResponse> => {
    const res = await apiClient.get<ApiResponse<PendingPropertiesResponse>>(
      '/admin/properties/pending',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      }
    );
    return res.data;
  },

  updatePropertyStatus: async (id: string, status: PropertyStatus): Promise<Property> => {
    const res = await apiClient.patch<ApiResponse<Property>>(`/admin/properties/${id}/status`, {
      status,
    });
    return res.data;
  },
};

