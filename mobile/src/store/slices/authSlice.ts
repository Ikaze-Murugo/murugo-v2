import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../api/auth';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  profile?: { name?: string; companyName?: string; bio?: string; avatarUrl?: string };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: async (token) => {
    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    set({ token, isAuthenticated: !!token });
  },

  setAuth: async (user, token) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // Ignore if already invalid
    }
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        set({ isLoading: false });
        return;
      }
      set({ token, isAuthenticated: true });
      const user = await authApi.getMe();
      set({ user, isLoading: false });
    } catch (error) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
