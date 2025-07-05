import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MESSAGES } from "../utils/constants";
import { IAdminService } from "./interfaces/IAdminService";
import { IAdminRepository } from '../repositories/interfaces/IAdminRepository';
import { IHostRepository } from '../repositories/interfaces/IHostRepository';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IHost } from "../models/host";
import { sendDocumentVerificationEmail } from "../utils/mailer";
import { IUser } from "../models/user";
import { IHostSubscriptionRepository } from '../repositories/interfaces/IHostSubscriptionRepository';
import { AdminLoginDTO, AdminAuthResponseDTO, VerifyDocumentResponseDTO } from '../dtos/admin/AdminDTO';
import { AdminMapper } from '../mappers/AdminMapper';

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.AdminRepository)
      private adminRepository: IAdminRepository,
    @inject(TYPES.HostRepository)
      private hostRepository: IHostRepository,
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository,
    @inject(TYPES.HostSubscriptionRepository)
    private hostSubscriptionRepo: IHostSubscriptionRepository,
    
  ){}
 
 
   async getHosts(page: number = 1, limit: number = 10): Promise<{ hosts: IHost[], total: number }> {

    return await this.hostRepository.getAllHosts(page, limit);
  }

  async verifyDocument(
    hostId: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ): Promise<VerifyDocumentResponseDTO> {
    const updateData: Partial<IHost> = {
      documentStatus: action === "approve" ? "approved" : "rejected",
      ...(action === "approve"
        ? { rejectionReason: "" } 
        : { rejectionReason: rejectionReason || "" } 
      ),
    };

    const updatedHost = await this.hostRepository.updateHost(hostId, updateData);
    if (!updatedHost) {
      return {
        success: false,
        message: MESSAGES.ADMIN.ERROR.FAILED_DOC_VERIFY,
      };
    }
    
    await sendDocumentVerificationEmail(
      updatedHost.email,
      action,
      action === "reject" ? rejectionReason : undefined
    );
    
    return {
      success: true,
      message:
        action === "approve"
          ? MESSAGES.ADMIN.SUCCESS.DOCUMENT_VERIFIED
          : MESSAGES.ADMIN.SUCCESS.DOCUMENT_REJECTED,
    };
  }


  // block or unblock hosts
  async hostToggleStatus(
    hostId: string,
    newStatus: boolean
  ): Promise<{ success: boolean; message: string }> {
    const updatedHost = await this.hostRepository.updateHost(hostId, {
      isBlocked: newStatus,
    });
    
    if (!updatedHost) {
      return { 
        success: false, 
        message: MESSAGES.ADMIN.ERROR.STATUS_TOGGLE_FAILED 
      };
    }
    
    return {
      success: true,
      message: MESSAGES.ADMIN.SUCCESS.STATUS_UPDATED,
    };
  }


   async getUsers(page: number = 1, limit: number = 10): Promise<{ users: IUser[], total: number }> {
    return await this.userRepository.getAllUsers(page, limit);
  }

  // block or unblock users
   async userToggleStatus(
    userId: string,
    newStatus: boolean
  ): Promise<{ success: boolean; message: string }> {
    const updatedUser = await this.userRepository.updateUser(userId, {
      isBlocked: newStatus,
    });
    
    if (!updatedUser) {
      return { 
        success: false, 
        message: MESSAGES.ADMIN.ERROR.STATUS_TOGGLE_FAILED 
      };
    }
    
    return {
      success: true,
      message: MESSAGES.ADMIN.SUCCESS.STATUS_UPDATED,
    };
  }
}

