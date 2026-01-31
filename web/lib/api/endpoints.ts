import apiClient from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Property,
  PropertyFilters,
  PaginatedResponse,
  PaginationMeta,
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
    const response = await apiClient.post<{ data: { token: string } }>("/auth/refresh-token", {
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
    // Backend expects 'type' and 'search'; frontend uses propertyType
    const { propertyType, ...rest } = filters || {};
    const params = { ...rest, ...(propertyType != null && { type: propertyType }) };
    const response = await apiClient.get<{ data: { properties: Property[]; pagination: PaginationMeta } }>("/properties", {
      params,
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
    // Backend returns { properties, pagination } (same shape as getAll)
    const response = await apiClient.get<{
      data: { properties: Property[]; pagination: PaginationMeta };
    }>("/properties/my", { params: filters });
    return response.data.data;
  },
};

// ========================================
// USER ENDPOINTS
// ========================================

export const userApi = {
  getProfile: async () => {
    // Backend returns { user: User }; we return the user object for the page
    const response = await apiClient.get<{ data: { user: User } }>("/users/profile");
    return response.data.data.user;
  },

  updateProfile: async (data: { name?: string; bio?: string; company?: string; website?: string }) => {
    // Backend expects flat profile fields: name, bio, company, website (not nested)
    const response = await apiClient.put<{ data: { profile: unknown } }>("/users/profile", data);
    return response.data.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    // Backend route: add router.put('/password', userController.updatePassword) if missing
    await apiClient.put("/users/password", { currentPassword, newPassword });
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
    // Backend expects POST /favorites/:propertyId, not body
    const response = await apiClient.post<{ data: Favorite }>(`/favorites/${propertyId}`);
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
    // Backend uses /users/preferences, not /user/preferences
    const response = await apiClient.get<{ data: UserPreference }>("/users/preferences");
    return response.data.data;
  },

  update: async (data: Partial<UserPreference>) => {
    // Backend uses /users/preferences, not /user/preferences
    const response = await apiClient.put<{ data: UserPreference }>("/users/preferences", data);
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
