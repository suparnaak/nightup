import { Request, Response } from "express";
import UserService from "../services/userService";
import { MESSAGES, STATUS_CODES, PASSWORD_RULES } from "../utils/constants";
import jwt from "jsonwebtoken";
import { isRequired, isEmail } from "../utils/validators";

class UserController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      if (!name || !email || !phone || !password || !confirmPassword) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }

      const nameTrimmed = name.trim();

      if (!nameTrimmed) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.INVALID_NAME });
        return;
      }

      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(nameTrimmed)) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.INVALID_NAME });
        return;
      }
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.INVALID_EMAIL });
        return;
      }

      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone) || phone === "0000000000") {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.INVALID_PHONE });
        return;
      }

      if (password.length < PASSWORD_RULES.MIN_LENGTH) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.WEAK_PASSWORD });
        return;
      }

      if (password !== confirmPassword) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: "Passwords do not match" });
        return;
      }

      const existingUser = await UserService.findUserByEmail(email);
      if (existingUser) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.EMAIL_IN_USE });
        return;
      }

      const user = await UserService.signup(name, email, phone, password);

      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.COMMON.SUCCESS.REGISTERED,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
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
  // otp verification and resend otp
  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, verificationType } = req.body;

      if (!email || !otp || !verificationType) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const result = await UserService.verifyOtp(email, otp, verificationType);

      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: result.message,
        user: result.user,
      });
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;

      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: errMessage,
      });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, verificationType } = req.body;

      if (!email || !verificationType) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }
      const result = await UserService.resendOtp(email, verificationType);

      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: result.message });
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json({
        message: result.message,
        otpExpiry: result.otpExpiry,
      });
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: errMessage });
    }
  }
  // google signup
  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const profile = req.user;
      console.log(profile)
      if (!profile) {
        res.redirect(
          `${process.env.CORS_ORIGIN}/login?error=google_auth_failed`
        );
        return;
      }
      const result = await UserService.processGoogleAuth(profile);
      console.log(result)
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
        path: "/",
      });
      res.redirect(
        `${process.env.CORS_ORIGIN}/auth/google/callback?token=${result.token}`
      );
    } catch (error) {
      console.error("Google auth callback error:", error);
      res.redirect(
        `${process.env.CORS_ORIGIN}/user/login?error=google_auth_failed`
      );
    }
  }
  //auth profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHENTICATED });
        return;
      }
      res.status(STATUS_CODES.SUCCESS).json({ user: req.user });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res
        .status(STATUS_CODES.SERVER_ERROR)
        .json({ message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR });
    }
  }
  //login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const errors: { [key: string]: string } = {};

      if (!isRequired(email)) {
        errors.email =
          MESSAGES.COMMON.ERROR.MISSING_FIELDS || "Email is required";
      } else if (!isEmail(email)) {
        errors.email =
          MESSAGES.COMMON.ERROR.INVALID_EMAIL || "Invalid email format";
      }

      if (!isRequired(password)) {
        errors.password =
          MESSAGES.COMMON.ERROR.MISSING_FIELDS || "Password is required";
      }

      if (Object.keys(errors).length > 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS || "Validation failed",
          errors,
        });
        return;
      }

      const result = await UserService.login(email, password);
      console.log(result);
      if (!result.success) {
        //console.log(result.otpRequired)
        console.log("success false");
        const statusCode = result.otpRequired
          ? STATUS_CODES.FORBIDDEN
          : STATUS_CODES.BAD_REQUEST;

        res.status(statusCode).json({
          success: false,
          message: result.message,
          //error: result.otpRequired ? 'unverified' : 'invalid',
          otpRequired: result.otpRequired || false,
        });

        return;
      }

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as "strict",
        maxAge: 1 * 60 * 60 * 1000,
      };

      res
        .cookie("token", result.token, cookieOptions)
        .status(STATUS_CODES.SUCCESS)
        .json({
          success: true,
          message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
          user: result.user,
        });
    } catch (error) {
      console.error("Login Error:", error);

      const errMessage =
        error instanceof Error
          ? error.message
          : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR || "An unknown error occurred";

      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: errMessage,
      });
    }
  }

  //logout
  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as 'strict'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.COMMON.SUCCESS.LOGOUT
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const result = await UserService.forgotPassword(email);

      res
        .status(
          result.success ? STATUS_CODES.SUCCESS : STATUS_CODES.BAD_REQUEST
        )
        .json(result);
    } catch (error) {
      console.error("Forgot Password Controller Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword } = req.body;

      if (!email || !password || !confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }
      if (password !== confirmPassword) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ message: "Passwords do not match" });
        return;
      }
      const result = await UserService.resetPassword(email, password);
      console.log(result);
      res
        .status(
          result.success ? STATUS_CODES.SUCCESS : STATUS_CODES.BAD_REQUEST
        )
        .json(result);
    } catch (error) {
      console.error("Reset Password Controller Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new UserController();
