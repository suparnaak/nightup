// repositories/userRepository.ts
import axiosClient from "../api/axiosUserClient";
export const userRepository = {
/*     // Get the current user profile
    getUserProfile: async () => {
      const response = await axiosClient.get("/me", {
        withCredentials: true,
      });
      return response.data; // Expected to return { user: UserProfile, message: string }
    },
   */
    // Update the user profile (name and phone)
    updateProfile: async (profileData: { name: string; phone: string }) => {
      const response = await axiosClient.patch("/profile/update", profileData, {
        withCredentials: true,
      });
      return response.data; // Expected to return { user: UserProfile, message: string }
    },
  
    // Change the user's password
    changePassword: async (passwordData: { currentPassword: string; newPassword: string;confirmPassword: string }) => {
      const response = await axiosClient.post("/change-password", passwordData, {
        withCredentials: true,
      });
      return response.data; // Expected to return { message: string }
    },
  };