import { useAuthStore } from "../stores/auth-store";
import { authApi } from "../api/endpoints";
import { useRouter } from "next/navigation";
import { toast } from "./use-toast";
import type { LoginRequest, RegisterRequest } from "../types";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, setUser, logout: logoutStore } = useAuthStore();

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      // Backend sends 'token', not 'accessToken'
      const accessToken = response.token || response.accessToken || "";
      setAuth(response.user, accessToken, response.refreshToken);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      router.push("/");
      return response;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to login",
      });
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      // Backend sends 'token', not 'accessToken'
      const accessToken = response.token || response.accessToken || "";
      setAuth(response.user, accessToken, response.refreshToken);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      router.push("/");
      return response;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to register",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logoutStore();
      router.push("/login");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    }
  };

  const updateUser = (updatedUser: typeof user) => {
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };
}
