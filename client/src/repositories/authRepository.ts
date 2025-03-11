import axiosClient from '../api/axiosClient';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const authRepository = {
  signup: async (userData: SignupData) => {
    const response = await axiosClient.post('/users/signup', userData);
    return response.data;
  },
  
  // This will be implemented later when backend is ready
  googleSignup: async (token: string) => {
    const response = await axiosClient.post('/users/google-signup', { token });
    return response.data;
  }
};