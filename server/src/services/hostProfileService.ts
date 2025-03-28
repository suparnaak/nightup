import { IHostProfileService, HostProfile, HostProfileResponse } from "./interfaces/IHostProfileService";
import HostRepository from "../repositories/hostRepository";
import { IHost } from "../models/host";
import bcrypt from "bcryptjs";
import { MESSAGES } from "../utils/constants";

class HostProfileService implements IHostProfileService {
  
  async getHostProfile(hostId: string): Promise<HostProfile | null> {
    const host: IHost | null = await HostRepository.getHostProfile(hostId);
    if (!host) return null;
    
    const hostProfile: HostProfile = {
      id: host._id.toString(),
      name: host.name,
      email: host.email,
      phone: host.phone,
      hostType: host.hostType,
      documentUrl: host.documentUrl,
      documentStatus: host.documentStatus,
      rejectionReason: host.rejectionReason || "",
      subscriptionPlan: host.subStatus === "Active" ? "Subscribed" : host.subStatus,
    };
    return hostProfile;
  }

  async updateHostProfile(hostId: string, profileData: any): Promise<HostProfileResponse> {
    let updateData: Record<string, any> = {};
    console.log("service");
  
    if (profileData instanceof FormData && typeof profileData.forEach === "function") {
      profileData.forEach((value, key) => {
        updateData[key] = value;
      });
    } else {
      updateData = profileData;
    }
  
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    if (updateData.documentUrl) {
      updateData.documentStatus = "pending";
      updateData.rejectionReason = "";
    }
  
    console.log(updateData);
  
    const updatedHost = await HostRepository.updateHostProfile(hostId, updateData);
    if (!updatedHost) {
      throw new Error("Failed to update host profile");
    }
  
    const hostProfile: HostProfile = {
      id: updatedHost._id.toString(),
      name: updatedHost.name,
      email: updatedHost.email,
      phone: updatedHost.phone,
      hostType: updatedHost.hostType,
      documentUrl: updatedHost.documentUrl,
      documentStatus: updatedHost.documentStatus,
      rejectionReason: updatedHost.rejectionReason || "",
      subscriptionPlan: updatedHost.subStatus === "Active" ? "Subscribed" : updatedHost.subStatus,
    };
  
    return {
      hostProfile,
      message: MESSAGES.COMMON.SUCCESS.PROFILE_UPDATED,
    };
  }
  
  
}

export default new HostProfileService();
