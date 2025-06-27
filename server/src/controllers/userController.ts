import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import TYPES from "../config/di/types";
import { IUserService } from "../services/interfaces/IUserService";
import { IUserController } from "./interfaces/IUserController";
/* import {
  UserSignupDTO,
  UserLoginDTO,
  OtpVerificationDTO,
  PasswordResetDTO,
} from "../dtos/user/UserDTO"; */
import { MESSAGES, STATUS_CODES, PASSWORD_RULES } from "../utils/constants";
import { isRequired, isEmail } from "../utils/validators";
import { UserMapper } from "../mappers/UserMapper";

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject(TYPES.UserService)
    private userService: IUserService
  ) {}

  /* async signup(req: Request, res: Response): Promise<void> {
    try {
      const dto: UserSignupDTO = req.body;

      const { name, email, phone, password, confirmPassword } = dto;
      if (!name || !email || !phone || !password || !confirmPassword) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }

      if (password !== confirmPassword) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.PASSWORD_MISMATCH });
        return;
      }

      const user = await this.userService.signup(dto);

      const userDto = UserMapper.toDTO(user);
      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.COMMON.SUCCESS.REGISTERED,
        user: userDto,
        otpExpiry: user.otpExpiry,
      });
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: errMessage });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const dto: OtpVerificationDTO = req.body;
      const result = await this.userService.verifyOtp(dto);

      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: errMessage });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, verificationType } = req.body;
      const result = await this.userService.resendOtp(email, verificationType);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: errMessage });
    }
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const profile = req.user;
      if (!profile) {
        throw new Error(MESSAGES.USER.ERROR.NO_GOOGLE_AUTH);
      }
      const result = await this.userService.processGoogleAuth(profile);
      res
        .cookie("token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 3600000,
          path: "/",
        })
        .cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
      res.redirect(
        `${process.env.CORS_ORIGIN}/auth/google/callback?token=${result.token}`
      );
    } catch (error) {
      console.error("Google auth callback error:", error);
      res.redirect(`${process.env.CORS_ORIGIN}/login?error=google_auth_failed`);
    }
  } */

  async getProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.COMMON.ERROR.UNAUTHENTICATED });
      return;
    }
    console.log(req.user);
    res.status(STATUS_CODES.SUCCESS).json({ user: req.user });
  }
  /* async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) throw new Error(MESSAGES.COMMON.ERROR.MISSING_FIELDS);
      const result = await this.userService.forgotPassword(email);
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
  } */

  /* async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const dto: PasswordResetDTO & { confirmPassword: string } = req.body;
      if (dto.password !== dto.confirmPassword) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({
            success: false,
            message: MESSAGES.COMMON.ERROR.PASSWORD_MISMATCH,
          });
        return;
      }
      const result = await this.userService.resetPassword(dto);
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
  } */
}
