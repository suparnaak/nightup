import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authRepository } from '../repositories/authRepository';
import {jwtDecode} from 'jwt-decode';
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'host' | 'admin';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Auth actions
  signup: (name: string, email: string, phone: string, password: string, confirmPassword: string) => Promise<any>;
  hostSignup: (name: string, email: string, phone: string, password: string, confirmPassword: string, hostType: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  hostLogin: (email: string, password: string) => Promise<any>;
  adminLogin: (email: string, password: string) => Promise<any>;
  
  logout: () => void;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (email: string, password: string, confirmPassword: string) => Promise<any>;
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

      signup: async (name, email, phone, password, confirmPassword) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authRepository.signup({
            name,
            email,
            phone,
            password,
            confirmPassword,
          });
          set({
            user: response.user,
            isAuthenticated: false,
            isLoading: false,
          });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Signup failed. Please try again.',
          });
          throw error;
        }
      },

      hostSignup: async (name, email, phone, password, confirmPassword, hostType) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authRepository.hostSignup({
            name,
            email,
            phone,
            password,
            confirmPassword,
            hostType,
          });
          set({
            user: response.host,
            isAuthenticated: false,
            isLoading: false,
          });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Host signup failed. Please try again.',
          });
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authRepository.login({ email, password });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'User login failed. Please try again.',
          });
          throw error;
        }
      },

  

      hostLogin: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authRepository.hostLogin({ email, password });
          set({
            user: response.host,
            isAuthenticated: true,
            isLoading: false,
          });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Host login failed. Please try again.',
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
            error: error.response?.data?.message || 'Failed to send reset link. Please try again.',
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

      adminLogin: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authRepository.adminLogin({ email, password });
          set({
            user: response.admin,
            isAuthenticated: true,
            isLoading: false,
          });
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Admin login failed. Please try again.',
          });
          throw error;
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
            error: error.response?.data?.message || 'Logout failed. Please try again.',
          });
          throw error;
        }
      },
      googleLogin: (token: string) => {
        try {
          const decoded: any = jwtDecode(token);
          // Assuming your token payload includes these fields
          const user = {
            id: decoded.userId,
            name: decoded.name,      // Ensure your JWT includes the user's name
            email: decoded.email,    // And the user's email
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

      // Utility method to get the Google auth URL
      getGoogleAuthUrl: () => {
        return `${import.meta.env.VITE_API_URL}/api/users/auth/google`;
      },
      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: "auth-storage", 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
