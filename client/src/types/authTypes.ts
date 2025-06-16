export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface HostSignupData extends SignupData {
  hostType: string;
}

export interface LoginData {
  email: string;
  password: string;
}