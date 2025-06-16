import { create } from "zustand";
import { userRepository } from "../services/userService";
import { UserProfile } from "../types/userTypes";
import { SavedEvent } from "../types/eventTypes";

interface UserProfileState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  savedEvents: SavedEvent[];
  updateProfile: (profileData: { name: string; phone: string }) => Promise<UserProfile>;
  changePassword: (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<string>;
  clearProfile: () => void;
  fetchSavedEvents: () => Promise<SavedEvent[]>;
  saveEvent: (eventId: string) => Promise<SavedEvent>;
  removeSavedEvent: (eventId: string) => Promise<void>;
}

export const useUserStore = create<UserProfileState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  savedEvents: [],

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
  
  fetchSavedEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const savedEvents = await userRepository.getSavedEvents();
      console.log("saved events:-",savedEvents)
      set({ savedEvents, isLoading: false });
      return savedEvents;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch saved events",
        isLoading: false,
      });
      throw error;
    }
  },
  
  saveEvent: async (eventId: string) => {
    set({ isLoading: true, error: null });
    try {
      await userRepository.saveEvent(eventId);
      
      const freshList = await get().fetchSavedEvents();
      set({ isLoading: false });
      
      return freshList.find(e => e.event._id === eventId)!;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to save event",
        isLoading: false,
      });
      throw error;
    }
  },
  
  removeSavedEvent: async (eventId: string) => {
    console.log(eventId)
    console.log(typeof(eventId))
    set({ isLoading: true, error: null });
    try {
     await userRepository.removeSavedEvent(eventId);
      await get().fetchSavedEvents();
      //console.log("Response from remove saved event:", response);
      console.log("Current saved events:", get().savedEvents);
      console.log("Trying to remove event with ID:", eventId);
      
      set(state => {
        const filtered = state.savedEvents.filter(event => {
          console.log("Comparing:", event, "with eventId:", eventId);
          return event._id !== eventId;
        });
        console.log("Filtered events:", filtered);
        return { 
          savedEvents: filtered,
          isLoading: false 
        };
      });
    } catch (error: any) {
      console.error("Error removing saved event:", error);
      set({
        error: error.response?.data?.message || "Failed to remove saved event",
        isLoading: false,
      });
      throw error;
    }
  },
  
  clearProfile: () => set({ user: null, savedEvents: [], error: null }),
}));