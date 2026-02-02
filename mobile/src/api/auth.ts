import apiClient from './client';

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  role: string;
  profile?: { name?: string; companyName?: string; bio?: string; avatarUrl?: string };
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
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
  role: 'seeker' | 'lister';
  profileType?: 'individual' | 'commissioner' | 'company';
}

// Backend wraps responses as { status, message, data }
interface ApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await apiClient.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
    return res.data.user;
  },
};
