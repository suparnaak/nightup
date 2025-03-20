import { create } from 'zustand';
import { authRepository } from '../repositories/authRepository';

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
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string
  ) => Promise<any>;

  hostSignup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
    hostType: string
  ) => Promise<any>;

  googleSignup: (token: string) => Promise<void>;

  login: (user: User) => void;
  hostLogin: (email: string, password: string) => Promise<any>;
  logout: () => void;

  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (email:string, password: string, confirmPassword:string) => Promise<any>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

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
        isAuthenticated: true,
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
        isAuthenticated: true,
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

  googleSignup: async (token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authRepository.googleSignup(token);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Google signup failed. Please try again.',
      });
      throw error;
    }
  },

  login: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
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
  resetPassword: async ( email, password, confirmPassword ) => {
    set({ isLoading: true });

    try {
      const res = await authRepository.resetPassword({
        email,
        password,
        confirmPassword
        
      });

      return res;
    } catch (error: any) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
