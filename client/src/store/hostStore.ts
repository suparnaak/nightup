import { create } from "zustand";
import { hostRepository } from "../services/hostService";
import { HostProfile, HostProfileResponse } from "../types/hostTypes";

interface HostProfileState {
  host: HostProfile | null;
  isLoading: boolean;
  error: string | null;

  getHostProfile: () => Promise<HostProfile>;
  updateHostProfile: (profileData: FormData) => Promise<HostProfileResponse>;
  clearProfile: () => void;
}

export const useHostStore = create<HostProfileState>((set) => ({
  host: null,
  isLoading: false,
  error: null,

  getHostProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await hostRepository.getHostProfile();
      set({ host: response.hostProfile, isLoading: false });
      return response.hostProfile;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load host profile",
        isLoading: false,
      });
      throw error;
    }
  },

  updateHostProfile: async (profileData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await hostRepository.updateHostProfile(profileData);
      set({ host: response.hostProfile, isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  clearProfile: () => set({ host: null, error: null }),
}));
