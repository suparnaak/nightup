/* import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IHost } from "../models/host";
import { IHostRepository } from '../repositories/interfaces/IHostRepository';
import { IHostService } from "./interfaces/IHostService";
import { sendOtpEmail } from "../utils/mailer";
import { generateOTP } from "../utils/otpGenerator";
import { MESSAGES } from "../utils/constants";

@injectable()
export class HostService implements IHostService {
  constructor(
    @inject(TYPES.HostRepository)
    private hostRepository: IHostRepository
  ){}
//sign up
  async signup(
    name: string,
    email: string,
    phone: string,
    password: string,
    hostType: string
  ): Promise<IHost> {
    const existingHost = await this.hostRepository.findByEmail(email);
    if (existingHost) throw new Error(MESSAGES.COMMON.ERROR.EMAIL_IN_USE);

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    const newHost = await this.hostRepository.createHost({
      name,
      email,
      phone,
      password: hashedPassword,
      hostType,
      isVerified: false,
      isBlocked: false,
      otp,
      otpExpiry,
      
    } as IHost);

    await sendOtpEmail(email, otp);
    return newHost;
  }
//otp verification
  async verifyOtp(email: string, otp: string): Promise<{
    success: boolean;
    message: string;
    token?: string;
    host?: Partial<IHost>;
  }> {
    const host = await this.hostRepository.findByEmail(email);
    if (!host) {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_EMAIL);
    }

    if (host.isVerified) {
      throw new Error(MESSAGES.COMMON.ERROR.ALREADY_VERIFIED);
    }

    if (!host.otp || !host.otpExpiry) {
      throw new Error(MESSAGES.COMMON.ERROR.NO_OTP_FOUND);
    }

    const currentTime = new Date();
    if (host.otpExpiry < currentTime) {
      throw new Error(MESSAGES.COMMON.ERROR.OTP_EXPIRED);
    }

    if (host.otp !== otp) {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_OTP);
    }

    host.isVerified = true;
    host.otp = "";
    host.otpExpiry = undefined;

    await this.hostRepository.updateHost(host._id, {
      isVerified: true,
      otp: "",
      otpExpiry: undefined,
    });

    const jwtSecret = process.env.JWT_SECRET || "yoursecretkey";
    const token = jwt.sign({ hostId: host._id, type: "host" }, jwtSecret, {
      expiresIn: "1h",
    });

    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED,
      token,
      host: {
        id: host._id,
        name: host.name,
        email: host.email,
        phone: host.phone,
        
      },
    };
  }
//otp resend
  async resendOtp(email: string): Promise<{
    success: boolean;
    message: string;
    otpExpiry: Date;
  }> {
    const host = await this.hostRepository.findByEmail(email);
    if (!host) {
      throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);
    }

    if (host.isVerified) {
      throw new Error(MESSAGES.COMMON.ERROR.ALREADY_VERIFIED);
    }

    const newOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    host.otp = newOtp;
    host.otpExpiry = otpExpiry;

    await this.hostRepository.updateHost(host._id, {
      otp: newOtp,
      otpExpiry,
    });

    await sendOtpEmail(email, newOtp);

    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.OTP_RESENT,
      otpExpiry,
    };
  }
//login
  async login(email: string, password: string): Promise<{
    success: boolean;
    message: string;
    token: string;
    refreshToken: string;
    otpRequired?: boolean;
    host: Partial<IHost>;
  }> {
    const host = await this.hostRepository.findByEmail(email);
    if (!host) {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS || "Invalid email or password",
        token: "",
        refreshToken: "",
        host: {},
      };
    }
    if (!host.isVerified) {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.ACCOUNT_NOT_VERIFIED || "Account not verified",
        token: "",
        refreshToken: "",
        otpRequired: true,
        host: {},
      };
    }
    if (host.isBlocked) {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.BLOCKED || "Your account is blocked.",
        token: "",
        refreshToken: "",
        host: {},
      };
    }
    const isPasswordMatch = await bcrypt.compare(password, host.password);
    if (!isPasswordMatch) {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS || "Invalid email or password",
        token: "",
        refreshToken: "",
        host: {},
      };
    }
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING || "JWT secret missing",
        token: "",
        refreshToken: "",
        host: {},
      };
    }
    const token = jwt.sign({ hostId: host._id, type: "host" }, jwtSecret, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
          { hostId: host._id, type: "host" },
          jwtRefreshSecret,
          { expiresIn: "7d" }
        );
    return {
      success: true,
      message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
      token,
      refreshToken,
      host: {
        id: host._id,
        name: host.name,
        email: host.email,
        phone: host.phone,
        role: "host"
      },
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
          hostId: string;
          type: string;
        };
        const newAccessToken = jwt.sign(
          { hostId: decoded.hostId, type: "host" },
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
}

//export default HostService;
 */
import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IHost } from '../models/host';
import { IHostRepository } from '../repositories/interfaces/IHostRepository';
import { IHostService } from './interfaces/IHostService';
import { sendOtpEmail } from '../utils/mailer';
import { generateOTP } from '../utils/otpGenerator';
import { MESSAGES } from '../utils/constants';
import { HostSignupDTO, HostLoginDTO, HostAuthResponseDTO, OtpResponseDTO } from '../dtos/host/HostDTO';
import { HostMapper } from '../mappers/HostMapper';

@injectable()
export class HostService implements IHostService {
  constructor(
    @inject(TYPES.HostRepository) private hostRepository: IHostRepository
  ) {}

  async signup(dto: HostSignupDTO): Promise<IHost> {
    const { name, email, phone, password, hostType } = dto;
    const existing = await this.hostRepository.findByEmail(email);
    if (existing) throw new Error(MESSAGES.COMMON.ERROR.EMAIL_IN_USE);

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const newHost = await this.hostRepository.createHost({
      name,
      email,
      phone,
      password: hashed,
      hostType,
      isVerified: false,
      isBlocked: false,
      otp,
      otpExpiry,
    } as IHost);

    await sendOtpEmail(email, otp);
    return newHost;
  }

  async login(dto: HostLoginDTO): Promise<HostAuthResponseDTO> {
    const { email, password } = dto;
    const host = await this.hostRepository.findByEmail(email);
    if (!host) {
      return { success: false, message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS };
    }
    if (!host.isVerified) {
      return { success: false, message: MESSAGES.COMMON.ERROR.ACCOUNT_NOT_VERIFIED, otpRequired: true };
    }
    if (host.isBlocked) {
      return { success: false, message: MESSAGES.COMMON.ERROR.BLOCKED };
    }

    const match = await bcrypt.compare(password, host.password);
    if (!match) {
      return { success: false, message: MESSAGES.COMMON.ERROR.INVALID_CREDENTIALS };
    }

    const jwtSecret = process.env.JWT_SECRET!;
    const jwtRefresh = process.env.JWT_REFRESH_SECRET!;
    const token = jwt.sign({ hostId: host._id.toString(), type: 'host' }, jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ hostId: host._id.toString(), type: 'host' }, jwtRefresh, { expiresIn: '7d' });

    const hostDto = HostMapper.toDTO(host);
    return { success: true, message: MESSAGES.COMMON.SUCCESS.LOGIN, token, refreshToken, host: hostDto };
  }

  async verifyOtp(email: string, otp: string): Promise<OtpResponseDTO> {
    const host = await this.hostRepository.findByEmail(email);
    if (!host) {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_EMAIL);
    }
    if (host.otpExpiry! < new Date()) {
      throw new Error(MESSAGES.COMMON.ERROR.OTP_EXPIRED);
    }
    if (host.otp !== otp) {
      throw new Error(MESSAGES.COMMON.ERROR.INVALID_OTP);
    }

    const updated = await this.hostRepository.updateHost(host._id, { isVerified: true, otp: '', otpExpiry: undefined });
    if (!updated) throw new Error(MESSAGES.COMMON.ERROR.UNKNOWN_ERROR);

    const jwtSecret = process.env.JWT_SECRET!;
    const token = jwt.sign({ hostId: updated._id.toString(), type: 'host' }, jwtSecret, { expiresIn: '1h' });

    const hostDto = HostMapper.toDTO(updated);
    return { success: true, message: MESSAGES.COMMON.SUCCESS.OTP_VERIFIED, token, host: hostDto };
  }

  async resendOtp(email: string): Promise<OtpResponseDTO> {
    const host = await this.hostRepository.findByEmail(email);
    if (!host) throw new Error(MESSAGES.COMMON.ERROR.NOT_FOUND);

    const newOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await this.hostRepository.updateHost(host._id, { otp: newOtp, otpExpiry });
    await sendOtpEmail(email, newOtp);

    return { success: true, message: MESSAGES.COMMON.SUCCESS.OTP_RESENT, otpExpiry, host: undefined };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; message: string }> {
    const jwtSecret = process.env.JWT_SECRET!;
    const jwtRefresh = process.env.JWT_REFRESH_SECRET!;
    const decoded = jwt.verify(refreshToken, jwtRefresh) as { hostId: string; type: string };
    const newToken = jwt.sign({ hostId: decoded.hostId, type: 'host' }, jwtSecret, { expiresIn: '1h' });
    return { token: newToken, message: MESSAGES.COMMON.SUCCESS.TOKEN_REFRESH };
  }
}
