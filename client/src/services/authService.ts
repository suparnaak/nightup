import axiosClient from "../api/axiosUserClient";
import axiosHostClient from "../api/axiosHostClient";
import axiosAdminClient from "../api/axiosAdminClient";
import { SignupData, LoginData } from "../types/authTypes";

function getAxiosByRole(role: string) {
  switch (role) {
    case "user":
      return axiosClient;
    case "host":
      return axiosHostClient;
    case "admin":
      return axiosAdminClient;
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
}

export const authRepository = {
  signup: async (signupData: SignupData) => {
    const axios = getAxiosByRole(signupData.role);
    const response = await axios.post("/signup", signupData);
    return response.data;
  },

  login: async (credentials: LoginData) => {
    const axios = getAxiosByRole(credentials.role);
    const response = await axios.post("/login", credentials);
    return response.data;
  },

  verifyOtp: async ({
    email,
    otp,
    verificationType,
    role = "user",
  }: {
    email: string;
    otp: string;
    verificationType: string;
    role?: string;
  }) => {
    const axios = getAxiosByRole(role);
    console.log("role:-", role);
    const response = await axios.post("/verify-otp", {
      email,
      otp,
      verificationType,
      role,
    });
    return response.data;
  },
  resendOtp: async (
    email: string,
    verificationType: string,
    role: string = "user"
  ) => {
    const axios = getAxiosByRole(role);
    const response = await axios.post("/resend-otp", {
      email,
      verificationType,
      role,
    });
    return response.data;
  },
  forgotPassword: async ({ email }: { email: string }) => {
    const response = await axiosClient.post("/forgot-password", { email });
    return response.data;
  },
  resetPassword: async ({
    email,
    password,
    confirmPassword,
  }: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await axiosClient.post("/reset-password", {
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },
  getGoogleAuthUrl: () => {
    return `${import.meta.env.VITE_API_URL}/api/users/auth/google`;
  },
  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get("/me", {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    const response = await axiosClient.post("/logout");
    return response.data;
  },
};
