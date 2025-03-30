import { IUserProfileService, UserProfile, UserProfileResponse } from "./interfaces/IUserProfileService";
import UserRepository from "../repositories/userRepository";
import bcrypt from "bcryptjs";

class UserProfileService implements IUserProfileService {

  async updateProfile(userId: string, profileData: any): Promise<UserProfileResponse> {
    let updateData: Record<string, any> = {};
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

  async changePassword(userId: string, { currentPassword, newPassword, confirmPassword }: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }
  
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new Error("New password cannot be the same as the current password.");
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    user.password = hashedPassword;
    await user.save();
  
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
  }
  
}

export default new UserProfileService();
