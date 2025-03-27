// services/UserProfileService.ts
import { IUserProfileService, UserProfile, UserProfileResponse } from "./interfaces/IUserProfileService";
import UserRepository from "../repositories/userRepository";

class UserProfileService implements IUserProfileService {

  async updateProfile(userId: string, profileData: any): Promise<UserProfileResponse> {
    let updateData: Record<string, any> = {};
    // If profileData is FormData, convert it to a plain object.
    if (profileData instanceof FormData && typeof profileData.forEach === "function") {
      profileData.forEach((value, key) => {
        updateData[key] = value;
      });
    } else {
      updateData = profileData;
    }

    const updatedUser = await UserRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new Error("Failed to update user profile");
    }
    const userProfile: UserProfile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    };
    return {
      user: userProfile,
      message: "User profile updated successfully",
    };
  }

  async changePassword(userId: string, passwordData: { newPassword: string }): Promise<UserProfile> {
    // If your User model supports password updates,
    // cast the update object to any to bypass type mismatch
    const updatedUser = await UserRepository.updateUser(userId, { password: passwordData.newPassword } as any);
    if (!updatedUser) {
      throw new Error("Failed to update password");
    }
    const userProfile: UserProfile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    };
    return userProfile;
  }
}

export default new UserProfileService();
