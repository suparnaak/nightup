import { create } from "zustand";
import { userRepository } from "../repositories/userRepository";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface UserProfileResponse {
  user: UserProfile;
  message: string;
}

interface UserProfileState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (profileData: { name: string; phone: string }) => Promise<UserProfile>;
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<string>;
  clearProfile: () => void;
}

export const useUserStore = create<UserProfileState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  async updateProfile(profileData: { name: string; phone: string }): Promise<UserProfile> {
    set({ isLoading: true, error: null });
    try {
      const response = await userRepository.updateProfile(profileData);
      const updatedUser = response.user.user || response.user; 
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    set({ isLoading: true, error: null });
    try {
      await userRepository.changePassword(passwordData);
      set({ isLoading: false });
      return "Password changed successfully.";
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to change password",
        isLoading: false,
      });
      throw error;
    }
  },

  clearProfile: () => set({ user: null, error: null }),
}));
