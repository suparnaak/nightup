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

export interface SavedEvent {
  id: string;       
  eventId: string;  
  title: string;
  eventImage?: string;
  date?: Date;
}

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
      const savedEvent = await userRepository.saveEvent(eventId);
      set(state => ({ 
        savedEvents: [...state.savedEvents, savedEvent],
        isLoading: false 
      }));
      return savedEvent;
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
     /*  const response =  */await userRepository.removeSavedEvent(eventId);
      await get().fetchSavedEvents();
      //console.log("Response from remove saved event:", response);
      console.log("Current saved events:", get().savedEvents);
      console.log("Trying to remove event with ID:", eventId);
      
      set(state => {
        const filtered = state.savedEvents.filter(event => {
          console.log("Comparing:", event, "with eventId:", eventId);
          return event.eventId !== eventId;
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