import axiosClient from "../api/axiosUserClient";
import { SavedEvent } from "../store/userStore";

export const userRepository = {
    // Update the user profile 
    updateProfile: async (profileData: { name: string; phone: string }) => {
      const response = await axiosClient.patch("/profile/update", profileData, {
        withCredentials: true,
      });
      return response.data; 
    },
  
    // Change the user's password
    changePassword: async (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const response = await axiosClient.post("/change-password", passwordData, {
        withCredentials: true,
      });
      return response.data; 
    },
    
    // User's saved events
    getSavedEvents: async (): Promise<SavedEvent[]> => {
      const response = await axiosClient.get("/saved-events", {
        withCredentials: true,
      });
      return response.data.savedEvents;
    },
    
    // Save an event for later
    saveEvent: async (eventId: string): Promise<SavedEvent> => {
      const response = await axiosClient.post("/saved-events", { eventId }, {
        withCredentials: true,
      });
      return response.data.savedEvent;
    },
    
    // Remove a saved event 
    removeSavedEvent: async (eventId: string): Promise<void> => {
      const response = await axiosClient.delete(`/saved-events/${eventId}`, {
        withCredentials: true,
      });
      console.log(response)
      return response.data;
    },
    
};