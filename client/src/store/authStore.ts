import { create } from 'zustand';
import { authRepository } from '../repositories/authRepository';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'host' | 'admin';
}

interface SignupResponse {
  user: User;
  otpExpiry: string; // OTP expiration as ISO string
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signup: (name: string, email: string, phone: string, password: string, confirmPassword: string) => Promise<SignupResponse>;
  googleSignup: (token: string) => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
  /* logout: () => void;
  fetchProfile: () => Promise<void>; */
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  signup: async (name, email, phone, password, confirmPassword) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authRepository.signup({ name, email, phone, password, confirmPassword });

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });

      return response;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Signup failed. Please try again.'
      });
      throw error;
    }
  },

  googleSignup: async (token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authRepository.googleSignup(token);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Google signup failed. Please try again.'
      });
      throw error;
    }
  },
  login: (user: User) => set({ user, isAuthenticated: true }),

  logout: () => {
    // Optionally, you can call your backend logout endpoint here.
    // e.g., await authRepository.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
