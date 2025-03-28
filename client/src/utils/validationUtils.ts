export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };
  
  export const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return null;
  };
  
  export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    console.log("validateConfirmPassword called with:", password, confirmPassword);
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) {
      console.log("Mismatch detected");
      return "Passwords do not match";
    }
    return null;
  };
  
  export const validateName = (name: string): string | null => {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    return null;
  };
  
  export const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit phone number";
    return null;
  };