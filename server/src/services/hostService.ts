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
