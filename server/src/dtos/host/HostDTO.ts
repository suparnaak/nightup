import { Types } from "mongoose";
import { BaseDTO } from "../base/BaseDTO";

export interface HostDTO extends BaseDTO {
  id?: string | Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  hostType: string;
  isVerified: boolean;
  isBlocked: boolean;
  role: 'host';
}

export interface HostSignupDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  hostType: string;
}

export interface HostLoginDTO {
  email: string;
  password: string;
}

export interface HostAuthResponseDTO {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  otpRequired?: boolean;
  host?: HostDTO;
}

export interface OtpResponseDTO {
  success: boolean;
  message: string;
  otpExpiry?: Date;
  host?: HostDTO;
  token?: string;
}