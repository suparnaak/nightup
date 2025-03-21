import axiosClient from '../api/axiosUserClient';
import axiosHostClient from '../api/axiosHostClient';
import axiosAdminClient from '../api/axiosAdminClient';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface HostSignupData extends SignupData {
  hostType: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authRepository = {
  // methods for user
  signup: async (userData: SignupData) => {
    const response = await axiosClient.post('/signup', userData);
    return response.data;
  },

  login: async (credentials: LoginData) => {
    const response = await axiosClient.post('/login', credentials);
    return response.data;
  },
  verifyOtp: async ({ email, otp, verificationType }: { email: string; otp: string; verificationType:string }) => {
    const response = await axiosClient.post('/verify-otp', { email, otp,verificationType });
    return response.data;
  },

  resendOtp: async (email: string,verificationType:string) => {
    const response = await axiosClient.post('/resend-otp', { email,verificationType });
    return response.data;
  },

  // Host methods
  hostSignup: async (hostData: HostSignupData) => {
    const response = await axiosHostClient.post('/signup', hostData);
    return response.data;
  },

  hostLogin: async (credentials: LoginData) => {
    const response = await axiosHostClient.post('/login', credentials);
    return response.data;
  },

  
  googleSignup: async (token: string) => {
    const response = await axiosClient.post('/google-signup', { token });
    return response.data;
  },

  
  hostVerifyOtp: async ({ email, otp }: { email: string; otp: string }) => {
    const response = await axiosHostClient.post('/verify-otp', { email, otp });
    return response.data;
  },
  forgotPassword: async ({ email }: { email: string }) => {
    const response = await axiosClient.post('/forgot-password', { email });
    return response.data;
  },
  resetPassword: async ({ email, password, confirmPassword }: { email: string, password: string, confirmPassword:string }) => {
    const response = await axiosClient.post('/reset-password', { email,password, confirmPassword });
    return response.data;
  },
  adminLogin: async (credentials: LoginData) => {
    const response = await axiosAdminClient.post('/login', credentials);
    return response.data;
  },
};
