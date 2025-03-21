import { Types } from "mongoose";

export interface HostProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostType: string;
  documentUrl: string; // URL for the license document
  subscriptionPlan: string;
  adminVerified: boolean;
  // Add other fields as needed
}

export interface HostProfileResponse {
  hostProfile: HostProfile;
  message: string;
}

export interface IHostProfileService {
  getHostProfile(hostId: string): Promise<HostProfile | null>;
  updateHostProfile(hostId: string, profileData: FormData): Promise<HostProfileResponse>;
}
