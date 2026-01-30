import apiClient from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Property,
  PropertyFilters,
  PaginatedResponse,
  Favorite,
  Review,
  UserPreference,
} from "../types";

// ========================================
// AUTH ENDPOINTS
// ========================================

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<{ data: AuthResponse }>("/auth/login", data);
    return response.data.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<{ data: AuthResponse }>("/auth/register", data);
    return response.data.data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  getMe: async () => {
    const response = await apiClient.get<{ data: User }>("/auth/me");
    return response.data.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<{ data: { accessToken: string } }>("/auth/refresh", {
      refreshToken,
    });
    return response.data.data;
  },
};

// ========================================
// PROPERTY ENDPOINTS
// ========================================

export const propertyApi = {
  getAll: async (filters?: PropertyFilters) => {
    const response = await apiClient.get<{ data: PaginatedResponse<Property> }>("/properties", {
      params: filters,
    });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: Property }>(`/properties/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Property>) => {
    const response = await apiClient.post<{ data: Property }>("/properties", data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Property>) => {
    const response = await apiClient.put<{ data: Property }>(`/properties/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/properties/${id}`);
  },

  getMyProperties: async (filters?: PropertyFilters) => {
    const response = await apiClient.get<{ data: PaginatedResponse<Property> }>("/properties/my", {
      params: filters,
    });
    return response.data.data;
  },
};

// ========================================
// USER ENDPOINTS
// ========================================

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get<{ data: User }>("/user/profile");
    return response.data.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await apiClient.put<{ data: User }>("/user/profile", data);
    return response.data.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    await apiClient.put("/user/password", { currentPassword, newPassword });
  },
};

// ========================================
// FAVORITE ENDPOINTS
// ========================================

export const favoriteApi = {
  getAll: async () => {
    const response = await apiClient.get<{ data: Favorite[] }>("/favorites");
    return response.data.data;
  },

  add: async (propertyId: string) => {
    const response = await apiClient.post<{ data: Favorite }>("/favorites", { propertyId });
    return response.data.data;
  },

  remove: async (propertyId: string) => {
    await apiClient.delete(`/favorites/${propertyId}`);
  },

  check: async (propertyId: string) => {
    const response = await apiClient.get<{ data: { isFavorite: boolean } }>(
      `/favorites/check/${propertyId}`
    );
    return response.data.data.isFavorite;
  },
};

// ========================================
// REVIEW ENDPOINTS
// ========================================

export const reviewApi = {
  getByProperty: async (propertyId: string) => {
    const response = await apiClient.get<{ data: Review[] }>(`/reviews/property/${propertyId}`);
    return response.data.data;
  },

  create: async (data: { propertyId: string; rating: number; comment?: string }) => {
    const response = await apiClient.post<{ data: Review }>("/reviews", data);
    return response.data.data;
  },

  update: async (id: string, data: { rating: number; comment?: string }) => {
    const response = await apiClient.put<{ data: Review }>(`/reviews/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/reviews/${id}`);
  },
};

// ========================================
// USER PREFERENCE ENDPOINTS
// ========================================

export const preferenceApi = {
  get: async () => {
    const response = await apiClient.get<{ data: UserPreference }>("/user/preferences");
    return response.data.data;
  },

  update: async (data: Partial<UserPreference>) => {
    const response = await apiClient.put<{ data: UserPreference }>("/user/preferences", data);
    return response.data.data;
  },
};

// ========================================
// UPLOAD ENDPOINTS
// ========================================

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ data: { url: string } }>("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data.url;
  },

  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await apiClient.post<{ data: { urls: string[] } }>(
      "/upload/multiple",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data.urls;
  },
};
