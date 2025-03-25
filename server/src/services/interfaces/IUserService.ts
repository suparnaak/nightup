import { IUser } from "../../models/user";

export interface IUserService {
  signup(name: string, email: string, phone: string, password: string): Promise<IUser>;
  verifyOtp(email: string, otp: string, verificationType:string): Promise<{ message: string; token?: string; user?: Partial<IUser> }>;
  resendOtp(email: string, verificationType:string): Promise<{ message: string; otpExpiry: Date }>;
  login(email: string, password: string): Promise<{ success: boolean; message: string; token: string; user: Partial<IUser> }>;
  forgotPassword(email: string): Promise<{success: boolean;message: string;email?: string;otpExpiry?: Date; }>;  
  resetPassword(email: string,password: string):Promise<{success: boolean;message: string; }>;
  //googleAuth(googleToken: string): Promise<{ success: boolean; message: string; token?: string; user?: Partial<IUser> }>;
  
}
