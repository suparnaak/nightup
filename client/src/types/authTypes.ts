
export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'host';
  hostType?: string; 
}
export interface LoginData {
  email: string;
  password: string;
  role:string
}