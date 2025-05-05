import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAdmin } from "../models/admin";
import { MESSAGES } from "../utils/constants";
import { IAdminService } from "./interfaces/IAdminService";
import { IAdminRepository } from '../repositories/interfaces/IAdminRepository';
import { IHostRepository } from '../repositories/interfaces/IHostRepository';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
//import AdminRepository from "../repositories/adminRepository";
//import HostRepository from "../repositories/hostRepository";
import { IHost } from "../models/host";
import { sendDocumentVerificationEmail } from "../utils/mailer";
//import UserRepository from "../repositories/userRepository";
import { IUser } from "../models/user";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject(TYPES.AdminRepository)
      private adminRepository: IAdminRepository,
    @inject(TYPES.HostRepository)
      private hostRepository: IHostRepository,
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository
    
  ){}
  async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    token: string;
    refreshToken: string;
    admin: Partial<IAdmin>;
  }> {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      return {
        success: false,
        message:
          MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS ||
          "Invalid email or password",
        token: "",
        refreshToken: "",
        admin: {},
      };
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return {
        success: false,
        message:
          MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS ||
          "Invalid email or password",
        token: "",
        refreshToken: "",
        admin: {},
      };
    }

    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || !jwtRefreshSecret) {
      return {
        success: false,
        message:
          MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING || "JWT secret missing",
        token: "",
        refreshToken: "",
        admin: {},
      };
    }

    const token = jwt.sign({ adminId: admin._id, type: "admin" }, jwtSecret, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { adminId: admin._id, type: "admin" },
      jwtRefreshSecret,
      { expiresIn: "7d" }
    );
    await this.adminRepository.updateRefreshToken(admin._id, refreshToken);
    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
      token,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    };
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ success: boolean; token: string; message: string }> {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error(MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING);
    }
    try {
      const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as {
        adminId: string;
        type: string;
      };
      const newAccessToken = jwt.sign(
        { adminId: decoded.adminId, type: "admin" },
        jwtSecret,
        { expiresIn: "1h" }
      );

      return {
        success: true,
        token: newAccessToken,
        message: MESSAGES.COMMON.SUCCESS.TOKEN_REFRESH,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  /* async getHosts(): Promise<IHost[]> {
    return await this.hostRepository.getAllHosts();
  } */
    async getHosts(page: number = 1, limit: number = 10): Promise<{ hosts: IHost[], total: number }> {
      return await this.hostRepository.getAllHosts(page, limit);
    }

  // verify document
async verifyDocument(
  hostId: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
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
    console.log(newStatus);
    const updatedHost = await this.hostRepository.updateHost(hostId, {
      isBlocked: newStatus,
    });
    if (!updatedHost) {
      return { success: false, message: MESSAGES.ADMIN.ERROR.STATUS_TOGGLE_FAILED };
    }
    return {
      success: true,
      message: MESSAGES.ADMIN.SUCCESS.STATUS_UPDATED,
    };
  }

  /* async getUsers(): Promise<IUser[]> {
    return await this.userRepository.getAllUsers();
  } */
    async getUsers(page: number = 1, limit: number = 10): Promise<{ users: IUser[], total: number }> {
      return await this.userRepository.getAllUsers(page, limit);
    }

  // block or unblock users
  async userToggleStatus(
    userId: string,
    newStatus: boolean
  ): Promise<{ success: boolean; message: string }> {
    console.log(newStatus);
    const updatedUser = await this.userRepository.updateUser(userId, {
      isBlocked: newStatus,
    });
    if (!updatedUser) {
      return { success: false, message: MESSAGES.ADMIN.ERROR.STATUS_TOGGLE_FAILED };
    }
    return {
      success: true,
      message: MESSAGES.ADMIN.SUCCESS.STATUS_UPDATED,
    };
  }
}

//export default new AdminService();
