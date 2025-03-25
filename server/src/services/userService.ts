import bcrypt from "bcryptjs";
import { IUser } from "../models/user";
import UserRepository from "../repositories/userRepository";
import { IUserService } from "./interfaces/IUserService";
import { sendOtpEmail } from "../utils/mailer";
import { generateOTP } from "../utils/otpGenerator";
import { MESSAGES } from "../utils/constants";
import jwt from "jsonwebtoken";

class UserService implements IUserService {
  
   async signup(name: string, email: string, phone: string, password: string): Promise<IUser> {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) throw new Error(MESSAGES.COMMON.ERROR.EMAIL_IN_USE);

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    const newUser = await UserRepository.createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
      isBlocked: false,
      isAdmin: false,
    } as IUser);

    await sendOtpEmail(email, otp);
    return newUser;
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return UserRepository.findByEmail(email);
  }

  // Verify OTP
  async verifyOtp(email: string, otp: string, verificationType: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: MESSAGES.COMMON.ERROR.INVALID_EMAIL };
    }
  
    if (!user.otp || !user.otpExpiry) {
      return { success: false, message: MESSAGES.COMMON.ERROR.NO_OTP_FOUND };
    }
  
    const currentTime = new Date();
    if (user.otpExpiry < currentTime) {
      return { success: false, message: MESSAGES.COMMON.ERROR.OTP_EXPIRED };
    }
  
    if (user.otp !== otp) {
      return { success: false, message: MESSAGES.COMMON.ERROR.INVALID_OTP };
    }
  
    // Handle different verification flows
    if (verificationType === "emailVerification") {
      if (user.isVerified) {
        return { success: false, message: MESSAGES.COMMON.ERROR.ALREADY_VERIFIED };
      }
  
      await UserRepository.updateUser(user._id, { isVerified: true, otp: "", otpExpiry: undefined });
  
      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
      };
    } else if (verificationType === "passwordReset") {
      await UserRepository.updateUser(user._id, { otp: "", otpExpiry: undefined });
  
      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
      };
    } else {
      return { success: false, message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS };
    }
  }
  

  //  Resend OTP
  async resendOtp(email: string, verificationType: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);
    }
  
    // Optional validation, but good to have if called directly
    if (verificationType === 'emailVerification' && user.isVerified) {
      throw new Error(MESSAGES.COMMON.ERROR.ALREADY_VERIFIED);
    }
  
    const newOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
  
    await UserRepository.updateUser(user._id, {
      otp: newOtp,
      otpExpiry,
    });
  
    await sendOtpEmail(
      email,
      newOtp,
     
    );
  
    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.OTP_RESENT,
      otpExpiry,
    };
  }
  
  //google signup
  async processGoogleAuth(profile: any): Promise<{ user: IUser; token: string; message: string; status: number }> {
    // Instead of trying to read from an emails array, read the email directly:
    const email = profile.email;
    if (!email) {
      throw new Error("Google profile did not return an email address.");
    }
  
    // Proceed with finding or creating the user
    let user = await UserRepository.findByEmail(email);
    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await UserRepository.updateUser(user._id, { googleId: profile.id });
      }
    } else {
      user = await UserRepository.createUser({
        googleId: profile.id,
        name: profile.displayName,
        email, // use the extracted email
        password: "", // no password required for Google signups
        isVerified: true,
        isBlocked: false,
        isAdmin: false,
      } as IUser);
    }
  
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret is missing.");
    }
  
    const token = jwt.sign({ userId: user._id, type: "user" }, jwtSecret, { expiresIn: "1h" });
  
    return {
      user,
      token,
      message: "Login successful",
      status: 200,
    };
  }  

  //login
  async login(email: string, password: string): Promise<{ success: boolean; message: string; token: string; otpRequired?: boolean; user: Partial<IUser> }> {
    const user = await UserRepository.findByEmail(email);
    console.log(user)
    if (!user) {
     // console.log("here is the error no user")
      return { 
        success: false, 
        message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS || "Invalid email or password", 
        token: "", 
        user: {} 
      };
    }
  
    if (!user.isVerified) {
      return { 
        success: false, 
        message: MESSAGES.COMMON.ERROR.ACCOUNT_NOT_VERIFIED || "Account not verified", 
        token: "", 
        otpRequired: true, 
        user: {} 
      };
    }
  
    if (user.isBlocked) {
      console.log("here")
      return { 
        success: false, 
        message: MESSAGES.COMMON.ERROR.BLOCKED || "Your account is blocked.", 
        token: "", 
        user: {} 
      };
    }
  
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      //console.log("here is the error no password match")
      return { 
        success: false, 
        message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS || "Invalid email or password", 
        token: "", 
        user: {} 
      };
    }
  
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return { 
        success: false, 
        message: MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING || "JWT secret missing", 
        token: "", 
        user: {} 
      };
    }
  
    const token = jwt.sign({ userId: user._id, type: "user" }, jwtSecret, {
      expiresIn: "1h",
    });
  
    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
      token,
      user: {
        id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: "user",
      }
    };
  }
  
  

  //forgot password
  async forgotPassword(email: string): Promise<{ 
    success: boolean; 
    message: string; 
    email?: string;
    otpExpiry?: Date; 
  }> {
    try {
      // 1. Check if user exists
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: MESSAGES.COMMON.ERROR.NOT_FOUND,
        };
      }
  
      // 2. Check if user is verified
      if (!user.isVerified) {
        return {
          success: false,
          message: "Your email is not verified. Please verify before resetting password.",
        };
      }
  
      // 3. Generate a new OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
  
      // 4. Update OTP and expiry in the DB
      await UserRepository.updateUser(user._id, {
        otp,
        otpExpiry,
      });
  
      // 5. Send OTP via email
      await sendOtpEmail(email, otp);
  
      // 6. Return extra details for frontend use
      return {
        success: true,
        message: "An OTP has been sent to your email for password reset.",
        email: user.email,         // This is required on frontend for OTP verification
        otpExpiry: otpExpiry,      // You can pass timestamp (or milliseconds)
      };
  
    } catch (error) {
      console.error("Forgot Password Service Error:", error);
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      };
    }
  }
  //reset password
  async resetPassword(email: string, password: string): Promise<{ 
    success: boolean; 
    message: string;  
  }> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    await UserRepository.updateUser(user._id, {
      password: hashedPassword
      
    });
   
    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.PASSWORD_RESET,
      
    }
  }

}

export default new  UserService;
