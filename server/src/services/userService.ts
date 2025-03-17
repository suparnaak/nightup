import bcrypt from "bcryptjs";
import { IUser } from "../models/user";
import UserRepository from "../repositories/userRepository";
import { IUserService } from "./interfaces/IUserService";
import { sendOtpEmail } from "../utils/mailer";
import { generateOTP } from "../utils/otpGenerator";
import { MESSAGES } from "../utils/constants";
import jwt from "jsonwebtoken";

class UserService implements IUserService {
  
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

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
  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_EMAIL);
    }

    if (user.isVerified) {
      throw new Error(MESSAGES.COMMON.ERROR.ALREADY_VERIFIED);
    }

    if (!user.otp || !user.otpExpiry) {
      throw new Error(MESSAGES.COMMON.ERROR.NO_OTP_FOUND);
    }

    const currentTime = new Date();
    if (user.otpExpiry < currentTime) {
      throw new Error(MESSAGES.COMMON.ERROR.OTP_EXPIRED);
    }

    if (user.otp !== otp) {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_OTP);
    }

    user.isVerified = true;
    user.otp = "";
    user.otpExpiry = undefined;

    await this.userRepository.updateUser(user._id, {
      isVerified: true,
      otp: "",
      otpExpiry: undefined,
    });

    return {
      success:true,
      message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
   
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  //  Resend OTP
  async resendOtp(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);
    }

    if (user.isVerified) {
      throw new Error(MESSAGES.COMMON.ERROR.ALREADY_VERIFIED);
    }

    const newOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    user.otp = newOtp;
    user.otpExpiry = otpExpiry;

    await this.userRepository.updateUser(user._id, {
      otp: newOtp,
      otpExpiry,
    });

    await sendOtpEmail(email, newOtp);

    return {
      success:true,
      message: MESSAGES.COMMON.SUCCESS.OTP_RESENT,
      otpExpiry,
    };
  }

  //login
  async login(email: string, password: string): Promise<{ success: boolean; message: string; token: string; otpRequired?: boolean; user: Partial<IUser> }> {
    const user = await this.userRepository.findByEmail(email);
    //console.log("got user")
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
}

export default UserService;
