import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import bcrypt from "bcryptjs";
import { IUser } from "../models/user";
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IUserService } from "./interfaces/IUserService";
import { sendOtpEmail } from "../utils/mailer";
import { generateOTP } from "../utils/otpGenerator";
import { MESSAGES } from "../utils/constants";
import jwt from "jsonwebtoken";


@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository
  ){}
   async signup(name: string, email: string, phone: string, password: string): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new Error(MESSAGES.COMMON.ERROR.EMAIL_IN_USE);

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    const newUser = await this.userRepository.createUser({
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
    return this.userRepository.findByEmail(email);
  }

  // Verify OTP
  async verifyOtp(email: string, otp: string, verificationType: string) {
    const user = await this.userRepository.findByEmail(email);
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
  
    if (verificationType === "emailVerification") {
      if (user.isVerified) {
        return { success: false, message: MESSAGES.COMMON.ERROR.ALREADY_VERIFIED };
      }
  
      await this.userRepository.updateUser(user._id, { isVerified: true, otp: "", otpExpiry: undefined });
  
      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
      };
    } else if (verificationType === "passwordReset") {
      await this.userRepository.updateUser(user._id, { otp: "", otpExpiry: undefined });
  
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
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);
    }
  
  
    if (verificationType === 'emailVerification' && user.isVerified) {
      throw new Error(MESSAGES.COMMON.ERROR.ALREADY_VERIFIED);
    }
  
    const newOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
  
    await this.userRepository.updateUser(user._id, {
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
  async processGoogleAuth(profile: any): Promise<{ user: IUser; token: string; refreshToken: string; message: string; status: number }> {
    const email = profile.email;
    if (!email) {
      throw new Error(MESSAGES.USER.ERROR.NO_GOOGLE_AUTH);
    }
  
    let user = await this.userRepository.findByEmail(email);
    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await this.userRepository.updateUser(user._id, { googleId: profile.id });
      }
    } else {
      user = await this.userRepository.createUser({
        googleId: profile.id,
        name: profile.displayName,
        email, 
        password: "", 
        isVerified: true,
        isBlocked: false,
        isAdmin: false,
      } as IUser);
    }
  
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error(MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING);
    }
  
    const token = jwt.sign({ 
    userId: user._id,
    type: "user",
    name: user.name,    
    email: user.email,  
    role: user.role,
    }, jwtSecret, { expiresIn: "1h" });

    const refreshToken = jwt.sign(
              { userId: user._id, type: "user" },
              jwtRefreshSecret,
              { expiresIn: "7d" }
            );
  
    return {
      user,
      token,
      refreshToken,
      message: MESSAGES.COMMON.SUCCESS.LOGIN,
      status: 200,
    };
  }  

  //login
  async login(email: string, password: string): Promise<{ success: boolean; message: string; token: string; refreshToken: string; otpRequired?: boolean; user: Partial<IUser> }> {
    const user = await this.userRepository.findByEmail(email);
    console.log(user)
    if (!user) {
     // console.log("here is the error no user")
      return { 
        success: false, 
        message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS || "Invalid email or password", 
        token: "", 
        refreshToken:"",
        user: {} 
      };
    }
  
    if (!user.isVerified) {
      return { 
        success: false, 
        message: MESSAGES.COMMON.ERROR.ACCOUNT_NOT_VERIFIED || "Account not verified", 
        token: "", 
        refreshToken:"",
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
        refreshToken:"",
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
        refreshToken:"",
        user: {} 
      };
    }
  
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || !jwtRefreshSecret) {
      return { 
        success: false, 
        message: MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING || "JWT secret missing", 
        token: "", 
        refreshToken:"",
        user: {} 
      };
    }
  
    const token = jwt.sign({ userId: user._id, type: "user" }, jwtSecret, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
              { userId: user._id, type: "user" },
              jwtRefreshSecret,
              { expiresIn: "7d" }
            );
  console.log(refreshToken)
    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
      token,
      refreshToken,
      user: {
        id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: "user",
      }
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
            userId: string;
            type: string;
          };
          const newAccessToken = jwt.sign(
            { userId: decoded.userId, type: "user" },
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
  
  

  //forgot password
  async forgotPassword(email: string): Promise<{ 
    success: boolean; 
    message: string; 
    email?: string;
    otpExpiry?: Date; 
  }> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: MESSAGES.COMMON.ERROR.NOT_FOUND,
        };
      }
  
      if (!user.isVerified) {
        return {
          success: false,
          message: MESSAGES.COMMON.ERROR.ACCOUNT_NOT_VERIFIED,
        };
      }
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
  
    
      await this.userRepository.updateUser(user._id, {
        otp,
        otpExpiry,
      });
  
     
      await sendOtpEmail(email, otp);
  
    
      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
        email: user.email,         
        otpExpiry: otpExpiry,      
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
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    await this.userRepository.updateUser(user._id, {
      password: hashedPassword
      
    });
   
    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.PASSWORD_RESET,
      
    }
  }

}

//export default new  UserService;
