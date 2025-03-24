import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAdmin } from "../models/admin";
import { MESSAGES } from "../utils/constants";
import { IAdminService } from "./interfaces/IAdminService";
import AdminRepository from "../repositories/adminRepository";
import HostRepository from "../repositories/hostRepository";
import { IHost } from "../models/host";
import { sendDocumentVerificationEmail } from "../utils/mailer";

class AdminService implements IAdminService {
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
    const admin = await AdminRepository.findByEmail(email);

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
    await AdminRepository.updateRefreshToken(admin._id, refreshToken);
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
        message: "Access token refreshed successfully",
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
  async getHosts(): Promise<IHost[]> {
    return await HostRepository.getAllHosts();
  }

  //verify document
  async verifyDocument(hostId: string, action: "approve" | "reject"): Promise<{ success: boolean; message: string }> {
    const updateData = { adminVerified: action === "approve" };
    const updatedHost = await HostRepository.updateHost(hostId, updateData);
    if (!updatedHost) {
      return {
        success: false,
        message: MESSAGES.ADMIN.ERROR.FAILED_DOC_VERIFY,
      };
    }
    await sendDocumentVerificationEmail(updatedHost.email, action);
    return {
      success: true,
      message:
        action === "approve"
          ? MESSAGES.ADMIN.SUCCESS.DOCUMENT_VERIFIED
          : MESSAGES.ADMIN.SUCCESS.DOCUMENT_REJECTED,
    };
  }
  //block or unblock hosts
  async hostToggleStatus(hostId: string, newStatus: boolean): Promise<{ success: boolean; message: string }> {
    console.log(newStatus)
    const updatedHost = await HostRepository.updateHost(hostId, { isBlocked: newStatus });
    if (!updatedHost) {
      return { success: false, message: "Failed to update block status" };
    }
    return { success: true, message: `Host has been ${newStatus ? "blocked" : "unblocked"} successfully` };
  }
}

export default new AdminService();
