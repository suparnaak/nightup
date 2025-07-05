import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import TYPES from "../config/di/types";
import { IAuthService } from "../services/interfaces/IAuthService";
import { IAuthController } from "./interfaces/IAuthController";
import {
  LoginDTO,
  AuthResponseDTO,
  SignupDTO,
  VerifyOtpDTO,
  ResendOtpDTO,
  PasswordResetDTO,
} from "../dtos/auth/AuthDTO";
import { ROLES, Role } from "../utils/constants";
@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(TYPES.AuthService)
    private authService: IAuthService
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as LoginDTO;
      const { email, password, role } = dto;

      if (!email || !password || !role) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      if (!ROLES.includes(role.toLowerCase() as Role)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS,
        });
        return;
      }

      const result: AuthResponseDTO = await this.authService.login(dto);

      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
        return;
      }

      const accessOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 1000,
      };

      const refreshOpts = {
        ...accessOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      res
        .cookie("token", result.token!, accessOpts)
        .cookie("refreshToken", result.refreshToken!, refreshOpts)
        .status(STATUS_CODES.SUCCESS)
        .json(result);
    } catch (err) {
      console.error("Login Error:", err);
      const message =
        err instanceof Error
          ? err.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message,
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.refreshToken;

      if (!token) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.REFRESH_TOKEN_MISSING,
        });
        return;
      }

      const result = await this.authService.refreshToken(token);

      const opts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 1000,
      };

      res
        .cookie("token", result.token, opts)
        .status(STATUS_CODES.SUCCESS)
        .json(result);
    } catch (err) {
      console.error("Auth Refresh Error:", err);
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.REFRESH_TOKEN_INVALID,
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res
        .clearCookie("token")
        .clearCookie("refreshToken")
        .status(STATUS_CODES.SUCCESS)
        .json({
          success: true,
          message: MESSAGES.COMMON.SUCCESS.LOGOUT,
        });
    } catch (err) {
      console.error("Logout Error:", err);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as SignupDTO;
      const { email, password, role, name } = dto;

      if (!email || !password || !role || !name) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      if (!ROLES.includes(role.toLowerCase() as Role)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.INVALID_ROLE,
        });
        return;
      }

      const result: AuthResponseDTO = await this.authService.signup(dto);
      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
        return;
      }

      const accessOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 3600000,
      };
      const refreshOpts = { ...accessOpts, maxAge: 7 * 24 * 60 * 60 * 1000 };
      res
        .cookie("token", result.token!, accessOpts)
        .cookie("refreshToken", result.refreshToken!, refreshOpts)
        .status(STATUS_CODES.CREATED)
        .json(result);
    } catch (err) {
      console.error("Signup Error:", err);
      const message =
        err instanceof Error
          ? err.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, message });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as VerifyOtpDTO;
      const { email, otp, verificationType, role = "user" } = dto;
      if (!email || !otp || !verificationType) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      if (!ROLES.includes(role.toLowerCase() as Role)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.INVALID_ROLE,
        });
        return;
      }

      const result: AuthResponseDTO = await this.authService.verifyOtp(dto);
      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (err) {
      console.error("OTP Verification Error:", err);
      const message =
        err instanceof Error
          ? err.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, message });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as ResendOtpDTO;
      const { email, verificationType, role = "user" } = dto;

      if (!email || !verificationType) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      if (!ROLES.includes(role.toLowerCase() as Role)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.INVALID_ROLE,
        });
        return;
      }

      const result: AuthResponseDTO = await this.authService.resendOtp(dto);
      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (err) {
      console.error("Resend OTP Error:", err);
      const message =
        err instanceof Error
          ? err.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, message });
    }
  }
  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const profile = req.user;
      if (!profile) {
        throw new Error(MESSAGES.USER.ERROR.NO_GOOGLE_AUTH);
      }
      const result = await this.authService.processGoogleAuth(profile);
      const accessOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 3600000,
        path: "/",
      };
      const refreshOpts = { ...accessOpts, maxAge: 7 * 24 * 60 * 60 * 1000 };
      res
        .cookie("token", result.token!, accessOpts)
        .cookie("refreshToken", result.refreshToken!, refreshOpts)
        .redirect(
          `${process.env.CORS_ORIGIN}/auth/google/callback?token=${result.token}`
        );
    } catch (error) {
      console.error("Google auth callback error:", error);
      res.redirect(`${process.env.CORS_ORIGIN}/login?error=google_auth_failed`);
    }
  }
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) throw new Error(MESSAGES.COMMON.ERROR.MISSING_FIELDS);
      const result = await this.authService.forgotPassword(email);
      res
        .status(
          result.success ? STATUS_CODES.SUCCESS : STATUS_CODES.BAD_REQUEST
        )
        .json(result);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ success: false, message: errMessage });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const dto: PasswordResetDTO & { confirmPassword: string } = req.body;
      if (dto.password !== dto.confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.PASSWORD_MISMATCH,
        });
        return;
      }
      const result = await this.authService.resetPassword(dto);
      res
        .status(
          result.success ? STATUS_CODES.SUCCESS : STATUS_CODES.BAD_REQUEST
        )
        .json(result);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ success: false, message: errMessage });
    }
  }
}
