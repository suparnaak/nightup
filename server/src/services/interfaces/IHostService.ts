import { IHost } from "../../models/host";

export interface IHostService {
  signup(
    name: string,
    email: string,
    phone: string,
    password: string,
    hostType: string
  ): Promise<IHost>;
  verifyOtp(email: string, otp: string): Promise<{
    success: boolean;
    message: string;
    token?: string;
    host?: Partial<IHost>;
  }>;
  resendOtp(email: string): Promise<{
    success: boolean;
    message: string;
    otpExpiry: Date;
  }>;
  login(email: string, password: string): Promise<{
    success: boolean;
    message: string;
    token: string;
    refreshToken: string;
    otpRequired?: boolean;
    host: Partial<IHost>;
  }>;
  refreshToken(refreshToken: string): Promise<{ token: string; message: string }>;
}
