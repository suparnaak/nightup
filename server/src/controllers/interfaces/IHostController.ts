import { Request, Response } from "express";

export interface IHostController {
  signup(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
}
