import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authRepository } from "../services/authService";
import { jwtDecode } from "jwt-decode";
import { User } from "../types/userTypes";
import { SignupData } from "../types/authTypes";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signup: (signupData: SignupData) => Promise<any>;
  login: (email: string, password: string, role: string) => Promise<any>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<any>;
  googleLogin: (token: string) => void;
  getGoogleAuthUrl: () => string;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signup: async (signupData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authRepository.signup(signupData);
          console.log("▷ signup response:", response);

          set({
            user: response.user,
            isAuthenticated: false,
            isLoading: false,
          });

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message ||
              `${signupData.role} signup failed. Please try again.`,
          });
          throw error;
        }
      },

      login: async (email, password, role) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authRepository.login({
            email,
            password,
            role,
          });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message ||
              `${role} login failed. Please try again.`,
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authRepository.forgotPassword({ email });
          set({ isLoading: false });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message ||
              "Failed to send reset link. Please try again.",
          });
          throw error;
        }
      },

      resetPassword: async (email, password, confirmPassword) => {
        set({ isLoading: true });
        try {
          const res = await authRepository.resetPassword({
            email,
            password,
            confirmPassword,
          });
          return res;
        } catch (error: any) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await authRepository.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message ||
              "Logout failed. Please try again.",
          });
          throw error;
        }
      },
      googleLogin: (token: string) => {
        try {
          const decoded: any = jwtDecode(token);
          const user = {
            id: decoded.userId,
            name: decoded.name,
            email: decoded.email,
            phone: decoded.phone || "",
            role: decoded.role || "user",
          };

          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Error processing Google login token", error);
        }
      },
      getGoogleAuthUrl: () => {
        return `${import.meta.env.VITE_API_URL}/api/users/auth/google`;
      },
      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
