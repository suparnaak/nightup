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
    //this.googleAuthCallback = this.googleAuthCallback.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      if (!name || !email || !phone || !password || !confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }

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
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_EMAIL });
        return;
      }

      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone) || phone === "0000000000") {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_PHONE });
        return;
      }

      if (password.length < PASSWORD_RULES.MIN_LENGTH) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.WEAK_PASSWORD });
        return;
      }

      if (password !== confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Passwords do not match" });
        return;
      }

      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.EMAIL_IN_USE });
        return;
      }

      const user = await this.userService.signup(name, email, phone, password);

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
    const { email, otp, verificationType } = req.body;

    if (!email || !otp || !verificationType) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.MISSING_FIELDS
      });
      return;
    }

    const result = await this.userService.verifyOtp(email, otp, verificationType);

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
    const { email, verificationType } = req.body;

    if (!email || !verificationType) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
      return;
    }
    const result = await this.userService.resendOtp(email, verificationType);

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

    const result = await this.userService.login(email, password);
   
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

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as 'strict',
      maxAge: 1 * 60 * 60 * 1000, 
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
 
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as 'strict'
  });
  res.status(STATUS_CODES.SUCCESS).json({
    success: true,
    message: MESSAGES.COMMON.SUCCESS.LOGOUT
  });
}

/* async googleAuthCallback(req: Request, res: Response): Promise<void> {
  try {
    // req.user is set by Passport; we'll pass its data to the service method.
    // Depending on your implementation, you might pass the token or JSON-stringified user.
    // Here, we'll assume the service expects a JSON string representing the Google profile.
    const profileData = JSON.stringify(req.user);

    const result = await this.userService.googleAuth(profileData);

    if (!result.success) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: result.message,
      });
      return;
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as "strict",
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    };

    // Set the JWT token in an HTTP-only cookie and redirect the user
    res
      .cookie("token", result.token, cookieOptions)
      .redirect(process.env.FRONTEND_URL || "http://localhost:5000");
  } catch (error) {
    console.error("Google Auth Callback Error:", error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
} */
  
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
  
      // Call the service
      const result = await this.userService.forgotPassword(email);
  
      // Check if the call was successful and send the result
      res.status(result.success ? STATUS_CODES.SUCCESS : STATUS_CODES.BAD_REQUEST).json(result);
  
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
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Passwords do not match" });
        return;
      }
  
      // Call the service
      const result = await this.userService.resetPassword(email, password);
      console.log(result)
      // Check if the call was successful and send the result
      res.status(result.success ? STATUS_CODES.SUCCESS : STATUS_CODES.BAD_REQUEST).json(result);
  
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