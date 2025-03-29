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

export const validDurations = ["Monthly", "6 Months", "Yearly"];

export const isValidDuration = (duration: string): boolean => {
  return validDurations.includes(duration);
};

export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

// Ensures the date is today or a future date
export const isFutureDate = (date: string): boolean => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

// Ensures the end date is not before the start date
export const isEndDateValid = (startDate: string, endDate: string): boolean => {
  return new Date(endDate) >= new Date(startDate);
};