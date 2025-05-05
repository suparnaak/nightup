import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from "express";
import { IHostService } from '../services/interfaces/IHostService';
import { IHostController } from "./interfaces/IHostController";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import TYPES from '../config/di/types';

@injectable()
export class HostController implements IHostController {
  constructor(
    @inject(TYPES.HostService)
    private hostService: IHostService
  ){}
  
  

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, confirmPassword, hostType } = req.body;

      if (!name || !email || !phone || !password || !confirmPassword || !hostType) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }

      const host = await this.hostService.signup(name, email, phone, password, hostType);

        res.status(STATUS_CODES.CREATED).json({
          message: MESSAGES.COMMON.SUCCESS.REGISTERED,
          host: {
            id: host._id,
            name: host.name,
            email: host.email,
            phone: host.phone,
            hostType: host.hostType,
          },
          otpExpiry: host.otpExpiry,
        });
      } catch (error) {
        const errMessage = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: errMessage });
      }
    }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const result = await this.hostService.login(email, password);

      if (!result.success) {
        const statusCode = result.otpRequired ? STATUS_CODES.FORBIDDEN : STATUS_CODES.BAD_REQUEST;
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
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      };

      res
        .cookie('token', result.token, cookieOptions)
        .status(STATUS_CODES.SUCCESS)
        .json({
          success: true,
          message: MESSAGES.COMMON.SUCCESS.LOGIN || "Login successful",
          host: result.host,
        });
    } catch (error) {
      console.error("Login Error:", error);
      const errMessage = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, message: errMessage });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const result = await this.hostService.verifyOtp(email, otp);

      if (!result.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: result.message,
        token: result.token,
        host: result.host,
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: errMessage,
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

      const result = await this.hostService.resendOtp(email);

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
}

//export default new HostController();
