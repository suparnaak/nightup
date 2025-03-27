// interfaces/IUserProfileService.ts
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

export interface IUserProfileService {
  updateProfile(userId: string, profileData: any): Promise<UserProfileResponse>;
  changePassword(userId: string, passwordData: { newPassword: string }): Promise<UserProfile>;
}
