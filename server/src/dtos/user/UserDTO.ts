import { BaseDTO } from '../base/BaseDTO';

export interface UserDTO extends BaseDTO {
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  role?: 'user' | 'host' | 'admin';
  isBlocked:boolean;
}

export interface UserSignupDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

}

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface UserAuthResponseDTO {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  otpRequired?: boolean;
  user?: UserDTO;
}

/* export interface OtpVerificationDTO {
  email: string;
  otp: string;
  verificationType: 'emailVerification' | 'passwordReset';
} */

/* export interface OtpResponseDTO {
  success: boolean;
  message: string;
  email?: string;
  otpExpiry?: Date;
  user?: UserDTO;
} */

/* export interface PasswordResetDTO {
  email: string;
  password: string;
} */