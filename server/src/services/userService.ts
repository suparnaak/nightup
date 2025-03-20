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
  async verifyOtp(email: string, otp: string, verificationType: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_EMAIL);
    }
  
    // Check OTP existence and expiry
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
  
    // Handle different verification flows
    if (verificationType === 'emailVerification') {
      if (user.isVerified) {
        throw new Error(MESSAGES.COMMON.ERROR.ALREADY_VERIFIED);
      }
  
      // Mark email as verified
      user.isVerified = true;
      await this.userRepository.updateUser(user._id, {
        isVerified: true,
        otp: "",
        otpExpiry: undefined,
      });
  
      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      };
    } else if (verificationType === 'passwordReset') {
      // OTP verified, proceed to password reset (do not set isVerified)
      await this.userRepository.updateUser(user._id, {
        otp: "",
        otpExpiry: undefined,
      });
  
      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      };
    } else {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS);
    }
  }
  

  //  Resend OTP
  async resendOtp(email: string, verificationType: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);
    }
  
    // Optional validation, but good to have if called directly
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
  
  async googleAuth(
    googleToken: string
  ): Promise<{ success: boolean; message: string; token?: string; user?: Partial<IUser> }> {
    try {
      // In a real-world scenario, you might verify the token with Google's API.
      // Since Passport is handling the verification, here we assume googleToken has been verified and contains the Google profile.
      // For this example, we assume that googleToken is a JSON stringified profile.
      const profile = JSON.parse(googleToken);
      const email = profile.emails?.[0]?.value || profile.email;
      if (!email) {
        return { success: false, message: "Email not found in Google profile" };
      }
      let user = await this.userRepository.findByEmail(email);
      if (user) {
        if (!user.googleId) {
          user = await this.userRepository.updateUser(user._id.toString(), { googleId: profile.id }) as IUser;
        }
      } else {
        // Create a new user with Google data
        user = await this.userRepository.createUser({
          googleId: profile.id,
          name: profile.displayName,
          email,
          phone: "",             // No phone provided by Google
          password: "",          // No password required for Google signup
          isVerified: true,      // Mark as verified since Google verifies the email
          isBlocked: false,      // Defaults
          isAdmin: false,        // Defaults
          otp: "",               // Not required
          otpExpiry: undefined,  // Not required
        } as IUser);
      }
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error(MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING);
      }
      const token = jwt.sign(
        {
          userId: user._id,
          type: "user",
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: (user as any).profileImage,
        },
        jwtSecret,
        { expiresIn: "1h" }
      );
      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.LOGIN,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          googleId: user.googleId,
          role: user.role,
        },
      };
    } catch (error) {
      console.error("Google Auth Service Error:", error);
      return { success: false, message: "Google authentication failed" };
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
      // 1. Check if user exists
      const user = await this.userRepository.findByEmail(email);
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
      await this.userRepository.updateUser(user._id, {
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

export default UserService;
