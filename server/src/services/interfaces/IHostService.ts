import { HostSignupDTO, HostLoginDTO } from '../../dtos/host/HostDTO';
import { OtpResponseDTO, HostAuthResponseDTO } from '../../dtos/host/HostDTO';
import { IHost } from '../../models/host';

export interface IHostService {
  signup(dto: HostSignupDTO): Promise<IHost>;
  login(dto: HostLoginDTO): Promise<HostAuthResponseDTO>;
  verifyOtp(email: string, otp: string): Promise<OtpResponseDTO>;
  resendOtp(email: string): Promise<OtpResponseDTO>;
  refreshToken(refreshToken: string): Promise<{ token: string; message: string }>;
}