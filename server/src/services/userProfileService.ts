import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { IUserProfileService, UserProfile, UserProfileResponse } from "./interfaces/IUserProfileService";
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import bcrypt from "bcryptjs";
import { MESSAGES } from "../utils/constants";

@injectable()
export class UserProfileService implements IUserProfileService {

  constructor(
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository
  ){}
  async updateProfile(userId: string, profileData: any): Promise<UserProfileResponse> {
    let updateData: Record<string, any> = {};
    if (profileData instanceof FormData && typeof profileData.forEach === "function") {
      profileData.forEach((value, key) => {
        updateData[key] = value;
      });
    } else {
      updateData = profileData;
    }

    const updatedUser = await this.userRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new Error(MESSAGES.COMMON.ERROR.PROFILE_UPDATE_FAILED);
    }
    const userProfile: UserProfile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    };
    return {
      user: userProfile,
      message:MESSAGES.COMMON.SUCCESS.PROFILE_UPDATED ,
    };
  }

  async changePassword(userId: string, { currentPassword, newPassword, confirmPassword }: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.NO_ACCOUNT);
    }
  
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log(isMatch)
    if (!isMatch) {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_CURRENT_PASSWORD);
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new Error(MESSAGES.COMMON.ERROR.NEW_CANNOT_CURRENT_PASSWORD);
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

//export default new UserProfileService();
