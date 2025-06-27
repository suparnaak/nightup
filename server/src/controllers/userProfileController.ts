import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../config/di/types";
import { Request, Response } from "express";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import jwt from "jsonwebtoken";
import { IUserProfileController } from "./interfaces/IUserProfileController";
import { IUserProfileService } from "../services/interfaces/IUserProfileService";
import { isPasswordStrong } from "../utils/validators";
import bcrypt from "bcryptjs/umd/types";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

@injectable()
export class UserProfileController implements IUserProfileController {
  constructor(
    @inject(TYPES.UserProfileService)
    private userProfileService: IUserProfileService
  ) {}
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
      const { name, phone } = req.body;

      const updatedUser = await this.userProfileService.updateProfile(userId, {
        name,
        phone,
      });

      res.status(STATUS_CODES.SUCCESS).json({
        user: updatedUser,
        message:
          MESSAGES.COMMON.SUCCESS.PROFILE_UPDATED ||
          "Profile updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message:
          MESSAGES.COMMON.ERROR.UNKNOWN_ERROR || "Failed to update profile.",
      });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;
      console.log(currentPassword);
      const updatedUser = await this.userProfileService.changePassword(userId, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      res.status(STATUS_CODES.SUCCESS).json({
        user: updatedUser,
        message:
          MESSAGES.COMMON.SUCCESS.PASSWORD_CHANGED ||
          "Password changed successfully.",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      res.status(STATUS_CODES.BAD_REQUEST).json({
        message: error.message || "Failed to change password.",
      });
    }
  }
}

