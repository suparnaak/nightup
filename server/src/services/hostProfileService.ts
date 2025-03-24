import { IHostProfileService, HostProfile, HostProfileResponse } from "./interfaces/IHostProfileService";
import HostRepository from "../repositories/hostRepository";
import { IHost } from "../models/host";
import bcrypt from "bcryptjs";

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
      subscriptionPlan: host.subStatus ? "Subscribed" : "Not subscribed",
      adminVerified: host.adminVerified,
    };
    return hostProfile;
  }

  async updateHostProfile(hostId: string, profileData: any): Promise<HostProfileResponse> {
    let updateData: Record<string, any> = {};
  console.log("service")
  
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
  console.log(updateData)

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
      subscriptionPlan: updatedHost.subStatus ? "Subscribed" : "Not subscribed",
      adminVerified: updatedHost.adminVerified,
    };
    return {
      hostProfile,
      message: "Host profile updated successfully",
    };
  }
  
}

export default new HostProfileService();
