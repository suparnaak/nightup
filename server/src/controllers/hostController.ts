import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import TYPES from '../config/di/types';
import { IHostService } from '../services/interfaces/IHostService';
import { IHostController } from './interfaces/IHostController';
import { MESSAGES, STATUS_CODES } from '../utils/constants';
import { HostSignupDTO, HostLoginDTO, HostAuthResponseDTO, OtpResponseDTO } from '../dtos/host/HostDTO';
import { HostMapper } from '../mappers/HostMapper';

@injectable()
export class HostController implements IHostController {
  constructor(
    @inject(TYPES.HostService) private hostService: IHostService
  ) {}

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as HostSignupDTO;
      const { name, email, phone, password, confirmPassword, hostType } = dto;

      if (!name || !email || !phone || !password || !confirmPassword || !hostType) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }
      if (password !== confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.PASSWORD_MISMATCH });
        return;
      }

      const host = await this.hostService.signup(dto);
      const hostDto = HostMapper.toDTO(host);

      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.COMMON.SUCCESS.REGISTERED,
        host: hostDto,
        otpExpiry: host.otpExpiry,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: msg });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body as { email: string; otp: string };
      const result: OtpResponseDTO = await this.hostService.verifyOtp(email, otp);
      const status = result.success ? STATUS_CODES.SUCCESS : STATUS_CODES.BAD_REQUEST;
      res.status(status).json(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: msg });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as { email: string };
      const result: OtpResponseDTO = await this.hostService.resendOtp(email);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: msg });
    }
  }

  
}
