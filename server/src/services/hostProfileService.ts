import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { IHostProfileService, HostProfile, HostProfileResponse } from "./interfaces/IHostProfileService";
import { IHostRepository } from '../repositories/interfaces/IHostRepository';
import { IHost } from "../models/host";
import bcrypt from "bcryptjs";
import { MESSAGES } from "../utils/constants";

@injectable()
export class HostProfileService implements IHostProfileService {
  
  constructor(
    @inject(TYPES.HostRepository)
    private hostRepository:IHostRepository
  ){}
  async getHostProfile(hostId: string): Promise<HostProfile | null> {
    const host: IHost | null = await this.hostRepository.getHostProfile(hostId);
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
      //subscriptionPlan: host.subStatus === "Active" ? "Subscribed" : host.subStatus,
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
  
    const updatedHost = await this.hostRepository.updateHostProfile(hostId, updateData);
    if (!updatedHost) {
      throw new Error(MESSAGES.COMMON.ERROR.PROFILE_UPDATE_FAILED);
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
      //subscriptionPlan: updatedHost.subStatus === "Active" ? "Subscribed" : updatedHost.subStatus,
    };
  
    return {
      hostProfile,
      message: MESSAGES.COMMON.SUCCESS.PROFILE_UPDATED,
    };
  }
  
  
}

//export default new HostProfileService();
