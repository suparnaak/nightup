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

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IUserProfileService {
  updateProfile(userId: string, profileData: any): Promise<UserProfileResponse>;
  changePassword(userId: string, passwordData: PasswordChangeData): Promise<UserProfile>;
}
