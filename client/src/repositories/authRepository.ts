import axiosClient from '../api/axiosUserClient';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
interface LoginData {
  email: string;
  password: string;
}


export const authRepository = {
  signup: async (userData: SignupData) => {
    const response = await axiosClient.post('/signup', userData);
    return response.data;
  },
  
  // This will be implemented later when backend is ready
  googleSignup: async (token: string) => {
    const response = await axiosClient.post('/google-signup', { token });
    return response.data;
  },

  verifyOtp: async ({ email, otp }: { email: string; otp: string }) => {
    const response = await axiosClient.post('/verify-otp', { email, otp });
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await axiosClient.post('/resend-otp', { email });
    return response.data;
  },
  login: async (credentials: LoginData) => {
    const response = await axiosClient.post('/login', credentials);
    return response.data;
  },
};