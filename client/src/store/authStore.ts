import { create } from 'zustand';
import { authRepository } from '../repositories/authRepository';
import { setToken, removeToken } from '../utils/localStorage';

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
  signup: (name: string, email: string, phone: string, password: string,confirmPassword: string) => Promise<void>;
  googleSignup: (token: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  signup: async (name, email, phone, password,confirmPassword) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authRepository.signup({ name, email, phone, password,confirmPassword });
      
      setToken(response.token);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
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
      
      setToken(response.token);
      
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

  logout: () => {
    removeToken();
    set({
      user: null,
      isAuthenticated: false
    });
  }
}));