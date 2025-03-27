import { Request, Response } from "express";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import jwt from "jsonwebtoken";
import { IUserProfileController } from "./interfaces/IUserProfileController";
import UserProfileService from "../services/userProfileService";
import { isPasswordStrong } from "../utils/validators";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class UserProfileController implements IUserProfileController {

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Assume the authentication middleware attaches the user to req.user
      const userId = req.user?.userId;
      if (!userId) {
              res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
              return;
            }
      const { name, phone } = req.body;

      // Call the service method to update profile
      const updatedUser = await UserProfileService.updateProfile(userId, { name, phone });

      res.status(STATUS_CODES.SUCCESS).json({
        user: updatedUser,
        message: MESSAGES.COMMON.SUCCESS.PROFILE_UPDATED || "Profile updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR || "Failed to update profile.",
      });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
      const {newPassword, confirmPassword } = req.body;

      // Validate that new password and confirmation match
      if (newPassword !== confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.COMMON.ERROR.PASSWORD_MISMATCH || "New passwords do not match.",
        });
        return;
      }

      // Validate new password against defined rules using the imported validator
      if (!isPasswordStrong(newPassword)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          message:
            MESSAGES.COMMON.ERROR.WEAK_PASSWORD ||
            "New password does not meet requirements.",
        });
        return;
      }

      const updatedUser = await UserProfileService.changePassword(userId, { newPassword });

      res.status(STATUS_CODES.SUCCESS).json({
        user: updatedUser,
        message: MESSAGES.COMMON.SUCCESS.PASSWORD_CHANGED || "Password changed successfully.",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR || "Failed to change password.",
      });
    }
  }
}

export default new UserProfileController();
