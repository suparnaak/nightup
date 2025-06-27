export interface HostProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostType: string;
  documentUrl: string; 
  documentStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export interface HostProfileResponse {
  hostProfile: HostProfile;
  message: string;
}

export interface IHostProfileService {
  getHostProfile(hostId: string): Promise<HostProfile | null>;
  updateHostProfile(hostId: string, profileData: FormData): Promise<HostProfileResponse>;
}
