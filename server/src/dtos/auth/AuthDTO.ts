import { IHost } from "../../models/host";
import { IUser } from "../../models/user";
import { UserDTO } from "../user/UserDTO";

export interface LoginDTO {
  email: string;
  password: string;
  role: "admin" | "user" | "host";
}

export interface AuthResponseDTO {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  otpRequired?: boolean;
  otpExpiry?: Date;
  user?: UserDTO;
}

export interface RefreshTokenResponseDTO {
  success: boolean;
  message: string;
  token: string;
}

export interface SignupDTO {
  name: string;
  email: string;
  password: string;
  role: "user" | "host";
  confirmPassword?: string;
  phone?: string;
  hostType?: string;
}

export interface VerifyOtpDTO {
  email: string;
  otp: string;
  verificationType: string;
  role?: string;
}

export interface ResendOtpDTO {
  email: string;
  verificationType: string;
  role?: string;
}

export interface JwtPayloadDTO {
  id: string;
  type: "user" | "host" | "admin";
  role?: string;
  iat?: number;
  exp?: number;
}
export interface GoogleProfileDTO {
  id: string;
  displayName: string;
  email: string;
  photos?: Array<{ value: string }>;
  provider: "google";
  _raw?: string;
  _json?: any;
}

export interface OtpResponseDTO {
  success: boolean;
  message: string;
  email?: string;
  otpExpiry?: Date;
  user?: UserDTO;
}
export interface PasswordResetDTO {
  email: string;
  password: string;
}
