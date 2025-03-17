export const isEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  export const isPasswordStrong = (password: string, minLength = 6): boolean => {
    return password.length >= minLength;
  };
  
  export const isPhoneNumber = (phone: string): boolean => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };
  
  export const isRequired = (value: string | undefined | null): boolean => {
    return value !== undefined && value !== null && value.toString().trim() !== '';
  };