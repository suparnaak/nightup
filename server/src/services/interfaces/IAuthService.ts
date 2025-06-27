import { LoginDTO, AuthResponseDTO, RefreshTokenResponseDTO, SignupDTO, VerifyOtpDTO, ResendOtpDTO, OtpResponseDTO, PasswordResetDTO } from "../../dtos/auth/AuthDTO";

export interface IAuthService {
  login(dto: LoginDTO): Promise<AuthResponseDTO>;
  refreshToken(token: string): Promise<RefreshTokenResponseDTO>;
  signup(signupData: SignupDTO): Promise<AuthResponseDTO>;
  verifyOtp(otpData: VerifyOtpDTO): Promise<AuthResponseDTO>;
  resendOtp(resendData: ResendOtpDTO): Promise<AuthResponseDTO>;
  processGoogleAuth(profile: any): Promise<AuthResponseDTO>
  forgotPassword(email: string): Promise<OtpResponseDTO>
  resetPassword(passwordResetDTO: PasswordResetDTO): Promise<OtpResponseDTO>
}