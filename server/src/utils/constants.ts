export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
};
export const MESSAGES = {
  COMMON: {
    SUCCESS: {
      REGISTERED: "Registered successfully. OTP sent to email for verification.",
      PAYMENT_SUCCESSFUL: "Payment successful.",
      OTP_VERIFIED: "OTP verification successful. You can now log in.",
      OTP_RESENT: "A new OTP has been sent to your email.",
      LOGIN:"Login successfull",
      PASSWORD_RESET:"Your password reset successfully, you can Login."
    },
    ERROR: {
      INVALID_NAME: "Invalid name.",
      INVALID_EMAIL: "Invalid email address.",
      INVALID_PHONE: "Invalid phone number.",
      WEAK_PASSWORD: `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long.`,
      PASSWORD_MISMATCH: "Password and Confirm Password must match.",
      INVALID_CREDENTIALS: "Invalid credentials.",
      EMAIL_IN_USE: "Email is already in use.",
      MISSING_FIELDS: "All fields are required.",
      UNAUTHORIZED: "Unauthorized access.",
      UNKNOWN_ERROR: "An unknown error occurred. Please try again later.",
      ACCOUNT_NOT_VERIFIED: "Account not verified. Please verify your email.",
      NOT_FOUND: "Email not found.",
      OTP_EXPIRED: "OTP has expired. Request a new OTP.",
      INVALID_OTP: "Invalid OTP. Please check and try again.",
      ALREADY_VERIFIED: "Account is already verified.",
      NO_OTP_FOUND: "No OTP found. Please request a new one.",
      BLOCKED: "Your account is blocked",
      JWT_SECRET_MISSING:"JWT token is not configured"
      
    },
  },

  USER: {
    SUCCESS: {
      
    },
    ERROR: {
      
    },
  },

  HOST: {
    SUCCESS: {
      
    },
    ERROR: {
      
      HOSTTYPE_REQUIRED: "Host type is required.",
      
    },
  },
};


export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  FORBIDDEN:403
};


