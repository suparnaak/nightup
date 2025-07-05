import "reflect-metadata";
import { injectable, inject } from "inversify";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import TYPES from "../config/di/types";
import { IAuthService } from "./interfaces/IAuthService";
import { IAuthRepository } from "../repositories/interfaces/IAuthRepository";
import {
  LoginDTO,
  AuthResponseDTO,
  RefreshTokenResponseDTO,
  SignupDTO,
  VerifyOtpDTO,
  ResendOtpDTO,
  JwtPayloadDTO,
  GoogleProfileDTO,
  PasswordResetDTO,
  OtpResponseDTO,
} from "../dtos/auth/AuthDTO";
import { AuthMapper } from "../mappers/AuthMapper";
import { MESSAGES, OTP_TTL } from "../utils/constants";
import { generateOTP } from "../utils/otpGenerator";
import { IUser } from "../models/user";
import { IHost } from "../models/host";
import { sendOtpEmail } from "../utils/mailer";
import { IHostRepository } from "../repositories/interfaces/IHostRepository";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.AuthRepository)
    private authRepository: IAuthRepository,
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository,
    @inject(TYPES.HostRepository)
    private hostRepository: IHostRepository
  ) {}
  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    const { role, email, password } = dto;
    const entity = await this.authRepository.findByEmailAndRole(email, role);
    if (!entity) {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS,
      };
    }
    if (role !== "admin" && (entity as IUser | IHost).isBlocked) {
    return {
      success: false,
      message: MESSAGES.COMMON.ERROR.BLOCKED,  
    };
  }


    const match = await bcrypt.compare(password, entity.password);
    if (!match) {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS,
      };
    }
    
    const token = jwt.sign(
      { id: entity._id, type: role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: entity._id, type: role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    return AuthMapper.toAuthResponse({
      success: true,
      message: MESSAGES.COMMON.SUCCESS.LOGIN,
      entity, 
      token,
      refreshToken,
      role,
    });
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDTO> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as JwtPayloadDTO;
      const { id, type } = decoded;

      
      const token = jwt.sign({ id, type }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.TOKEN_REFRESH,
        token,
      };
    } catch (err) {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.REFRESH_TOKEN_INVALID,
        token: "",
      };
    }
  }

  async signup(dto: SignupDTO): Promise<AuthResponseDTO> {
    const { name, email, phone, password, role, hostType } =
      dto as SignupDTO & { hostType?: string };
    if (!name || !email || !password || !role)
      throw new Error(MESSAGES.COMMON.ERROR.MISSING_FIELDS);

    if (!["user", "host"].includes(role.toLowerCase()))
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_ROLE);

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_TTL * 1000);

    let entity;
    if (role === "user") {
      if (await this.userRepository.findByEmail(email))
        throw new Error(MESSAGES.COMMON.ERROR.EMAIL_IN_USE);

      entity = await this.authRepository.createUser({
        name,
        email,
        phone,
        password: hashed,
        otp,
        otpExpiry,
        isVerified: false,
        isBlocked: false,
      } as IUser);
    } else {
      if (await this.hostRepository.findByEmail(email))
        throw new Error(MESSAGES.COMMON.ERROR.EMAIL_IN_USE);
      if (!hostType) throw new Error(MESSAGES.HOST.ERROR.HOSTTYPE_REQUIRED);

      entity = await this.hostRepository.createHost({
        name,
        email,
        phone,
        password: hashed,
        hostType,
        otp,
        otpExpiry,
        isVerified: false,
        isBlocked: false,
      } as IHost);
    }
    await sendOtpEmail(email, otp);
    console.log("OTP:", otp);
    return AuthMapper.toAuthResponse({
      success: true,
      message: MESSAGES.COMMON.SUCCESS.REGISTERED,
      entity,
      otpRequired: true,
      otpExpiry: entity.otpExpiry,
    });
  }

  async verifyOtp(dto: VerifyOtpDTO): Promise<AuthResponseDTO> {
    const { email, otp, verificationType, role = "user" } = dto;
    const repo =
      role.toLowerCase() === "host" ? this.hostRepository : this.userRepository;
    const entity = await repo.findByEmail(email);
    if (!entity) {
      return { success: false, message: MESSAGES.COMMON.ERROR.INVALID_EMAIL };
    }

    if (!entity.otp || !entity.otpExpiry) {
      return { success: false, message: MESSAGES.COMMON.ERROR.NO_OTP_FOUND };
    }
    const now = new Date();
    if (entity.otpExpiry < now) {
      return { success: false, message: MESSAGES.COMMON.ERROR.OTP_EXPIRED };
    }
    if (entity.otp !== otp) {
      return { success: false, message: MESSAGES.COMMON.ERROR.INVALID_OTP };
    }

    if (verificationType === "emailVerification") {
      if (entity.isVerified) {
        return {
          success: false,
          message: MESSAGES.COMMON.ERROR.ALREADY_VERIFIED,
        };
      }
      if (role === "user") {
        await this.userRepository.updateUser(entity._id, {
          isVerified: true,
          otp: "",
          otpExpiry: undefined,
        });
      } else {
        await this.hostRepository.updateHost(entity._id, {
          isVerified: true,
          otp: "",
          otpExpiry: undefined,
        });
      }
    } else if (verificationType === "passwordReset") {
      if (role === "user") {
        await this.userRepository.updateUser(entity._id, {
          otp: "",
          otpExpiry: undefined,
        });
      } else {
        await this.hostRepository.updateHost(entity._id, {
          otp: "",
          otpExpiry: undefined,
        });
      }
    } else {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS,
      };
    }

    return AuthMapper.toAuthResponse({
      success: true,
      message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
      entity,
    });
  }

  async resendOtp(dto: ResendOtpDTO): Promise<AuthResponseDTO> {
    const { email, role = "user" } = dto;
    const isHost = role.toLowerCase() === "host";
    const repo = isHost ? this.hostRepository : this.userRepository;
    const entity = await repo.findByEmail(email);
    if (!entity) throw new Error(MESSAGES.COMMON.ERROR.INVALID_EMAIL);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_TTL * 1000);

    if (isHost) {
      await this.hostRepository.updateHost(entity._id, { otp, otpExpiry });
    } else {
      await this.userRepository.updateUser(entity._id, { otp, otpExpiry });
    }

    await sendOtpEmail(email, otp);
    return AuthMapper.toAuthResponse({
      success: true,
      message: MESSAGES.COMMON.SUCCESS.OTP_RESENT,
      entity,
      otpExpiry,
    });
  }

  async processGoogleAuth(profile: GoogleProfileDTO): Promise<AuthResponseDTO> {
    const email = profile.email;
    if (!email) {
      throw new Error(MESSAGES.USER.ERROR.NO_GOOGLE_AUTH);
    }

    let user = await this.userRepository.findByEmail(email);
    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await this.userRepository.updateUser(user._id, {
          googleId: profile.id,
        });
      }
    } else {
      user = await this.authRepository.createUser({
        googleId: profile.id,
        name: profile.displayName,
        email,
        password: "",
        isVerified: true,
        isBlocked: false,
      } as IUser);
    }

    const jwtSecret = process.env.JWT_SECRET!;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;

    const tokenPayload = {
      id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role || "user",
      type: "user",
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "1h" });

    const refreshToken = jwt.sign(tokenPayload, jwtRefreshSecret, {
      expiresIn: "7d",
    });
    return AuthMapper.toAuthResponse({
      success: true,
      message: MESSAGES.COMMON.SUCCESS.LOGIN,
      entity: user,
      token,
      refreshToken,
    });
  }

  async forgotPassword(email: string): Promise<OtpResponseDTO> {
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
      const otpExpiry = new Date(Date.now() + OTP_TTL * 1000); // 10 min expiry

      await this.userRepository.updateUser(user._id, {
        otp,
        otpExpiry,
      });

      await sendOtpEmail(email, otp);

      return {
        success: true,
        message: MESSAGES.COMMON.SUCCESS.OTP_SENT,
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

  async resetPassword(
    passwordResetDTO: PasswordResetDTO
  ): Promise<OtpResponseDTO> {
    const { email, password } = passwordResetDTO;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.updateUser(user._id, {
      password: hashedPassword,
    });

    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.PASSWORD_RESET,
    };
  }
}
