import { Request, Response } from "express";
import UserService from "../services/userService";
import { MESSAGES, STATUS_CODES, PASSWORD_RULES } from "../utils/constants";
import jwt from "jsonwebtoken";
import { isRequired, isEmail } from "../utils/validators";


class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
    this.signup = this.signup.bind(this); 
    this.verifyOtp = this.verifyOtp.bind(this); 
    this.resendOtp = this.resendOtp.bind(this); 
    this.login = this.login.bind(this); 
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      // ✅ Check if all fields are provided
      if (!name || !email || !phone || !password || !confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }

      // ✅ Name Validation (only letters and spaces, no symbols or numbers)
      const nameTrimmed = name.trim();

      if (!nameTrimmed) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_NAME });
        return;
      }
      
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(nameTrimmed)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_NAME });
        return;
      }

      // ✅ Email Format Validation
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_EMAIL });
        return;
      }

      // ✅ Phone Number Validation (10 digits, not all zeros)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone) || phone === "0000000000") {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_PHONE });
        return;
      }

      // ✅ Password Length Validation
      if (password.length < PASSWORD_RULES.MIN_LENGTH) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.WEAK_PASSWORD });
        return;
      }

      // ✅ Password and Confirm Password Match
      if (password !== confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Passwords do not match" });
        return;
      }

      // ✅ Check if Email Already Exists (service layer validation)
      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.EMAIL_IN_USE });
        return;
      }

      // 🚀 Register User
      const user = await this.userService.signup(name, email, phone, password);

      // 🚀 Send Success Response
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
      const errMessage = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: errMessage });
    }
  }
// otp verification and resend otp
async verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.MISSING_FIELDS
      });
      return;
    }

    const result = await this.userService.verifyOtp(email, otp);

    if (!result.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: result.message
      });
      return;
    }

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: result.message,
      //token: result.token,
      user: result.user,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;

    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: errMessage
    });
  }
}


async resendOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
      return;
    }

    // Call service to resend OTP
    const result = await this.userService.resendOtp(email);

    if (!result.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: result.message });
      return;
    }

    res.status(STATUS_CODES.SUCCESS).json({
      message: result.message,
      otpExpiry: result.otpExpiry,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
    res.status(STATUS_CODES.BAD_REQUEST).json({ message: errMessage });
  }
}

//login
async login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const errors: { [key: string]: string } = {};

    // Input validation
    if (!isRequired(email)) {
      errors.email = MESSAGES.COMMON.ERROR.MISSING_FIELDS || "Email is required";
    } else if (!isEmail(email)) {
      errors.email = MESSAGES.COMMON.ERROR.INVALID_EMAIL || "Invalid email format";
    }

    if (!isRequired(password)) {
      errors.password = MESSAGES.COMMON.ERROR.MISSING_FIELDS || "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.MISSING_FIELDS || "Validation failed",
        errors,
      });
      return;
    }

    // Business logic delegated to service
    const result = await this.userService.login(email, password);
   // console.log(result);

    // Handle login failure scenarios
    if (!result.success) {
      //console.log(result.otpRequired)
      const statusCode =
        result.otpRequired
          ? STATUS_CODES.FORBIDDEN
          : STATUS_CODES.BAD_REQUEST;
      
      res.status(statusCode).json({
        success: false,
        message: result.message,
        error: result.otpRequired ? 'unverified' : 'invalid', 
        otpRequired: result.otpRequired || false,
      });
      
      return;
    }

    // Successful login - Set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as 'strict',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    };

    res
      .cookie('token', result.token, cookieOptions)
      .status(STATUS_CODES.SUCCESS)
      .json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
        user: result.user,
      });

  } catch (error) {
    console.error("Login Error:", error);

    // Generic error handling
    const errMessage = error instanceof Error
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
  // Clear the 'token' cookie with the same options used when setting it
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as 'strict'
  });
  res.status(STATUS_CODES.SUCCESS).json({
    success: true,
    message: "Logout successful"
  });
}

}

export default new UserController();
