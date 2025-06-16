import { IUser } from "../../models/user";
import { 
  UserDTO, 
  UserSignupDTO, 
  UserLoginDTO, 
  UserAuthResponseDTO, 
  OtpVerificationDTO, 
  OtpResponseDTO, 
  PasswordResetDTO 
} from "../../dtos/user/UserDTO";

export interface IUserService {
 /*  signup(name: string, email: string, phone: string, password: string): Promise<IUser>;
  verifyOtp(email: string, otp: string, verificationType:string): Promise<{
    success: any; message: string; token?: string; user?: Partial<IUser> 
}>;

  resendOtp(email: string, verificationType:string): Promise<{
    success: any; message: string; otpExpiry: Date 
}>;
  login(email: string, password: string): Promise<{
    otpRequired?: boolean; success: boolean; message: string; token: string; refreshToken: string; user: Partial<IUser> 
}>;
  forgotPassword(email: string): Promise<{success: boolean;message: string;email?: string;otpExpiry?: Date; }>;  
  resetPassword(email: string,password: string):Promise<{success: boolean;message: string; }>;
  findUserByEmail(email: string): Promise<IUser | null>
  processGoogleAuth(profile: any): Promise<{ user: IUser; token: string; refreshToken: string; message: string; status: number }>
  refreshToken(refreshToken: string): Promise<{ token: string; message: string }>; */
  signup(userSignupDTO: UserSignupDTO): Promise<IUser>;
  
  verifyOtp(otpVerificationDTO: OtpVerificationDTO): Promise<OtpResponseDTO>;

  resendOtp(email: string, verificationType: string): Promise<OtpResponseDTO>;
  
  login(userLoginDTO: UserLoginDTO): Promise<UserAuthResponseDTO>;
  
  forgotPassword(email: string): Promise<OtpResponseDTO>;
  
  resetPassword(passwordResetDTO: PasswordResetDTO): Promise<OtpResponseDTO>;
  
  findUserByEmail(email: string): Promise<IUser | null>;
  
  processGoogleAuth(profile: any): Promise<UserAuthResponseDTO>;
  
  refreshToken(refreshToken: string): Promise<{ token: string; message: string }>;
  
}
