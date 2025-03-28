export interface HostProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostType: string;
  documentUrl: string; // URL for the license document
  // Replacing adminVerified with a more descriptive status
  documentStatus: "pending" | "approved" | "rejected";
  // Optional field to store a rejection reason if the document is rejected
  rejectionReason?: string;
  subscriptionPlan: string;
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
