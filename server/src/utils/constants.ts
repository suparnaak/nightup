export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
};
export const MESSAGES = {
  COMMON: {
    SUCCESS: {
      REGISTERED: "Registered successfully. OTP sent to email for verification.",
      PAYMENT_SUCCESSFUL: "Payment successful.",
      OTP_VERIFIED: "OTP verified",
      OTP_RESENT: "A new OTP has been sent to your email.",
      LOGIN:"Login successfull",
      PASSWORD_RESET:"Your password reset successfully, you can Login.",
      LOGOUT:"Logged out Successfully",
      PROFILE_UPDATED:"Your profile is updated successfully",
      PASSWORD_CHANGED:"Password changed successfully"
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
      UNAUTHENTICATED: "You are not authenticated.",
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
      EVENT_CREATED:"Event created successfully",
      EVENT_FETCHED:"Events fetched successfully"
    },
    ERROR: {
      
      HOSTTYPE_REQUIRED: "Host type is required.",
      
    },
  },
  ADMIN:{
    SUCCESS:{
      DOCUMENT_VERIFIED: "Document has been verified successfully",
      DOCUMENT_REJECTED: "Document has been rejected",
      SUBSCRIPTION_CREATED: "Subscription created successfully",
      SUBSCRIPTION_UPDATED: "Subscription updated successfully",
      SUBSCRIPTION_DELETED:"Subscription deleted successfully",
      COUPON_CREATED :"Coupon created",
      COUPON_UPDATED:"Coupon updated",
      COUPON_DELETED:"Coupon deleted",



    },
    ERROR:{
      FAILED_DOC_VERIFY:"Document verification failed",
      INVALID_SUBSCRIPTION_NAME:"Subscription plan name is required",
      INVALID_SUBSCRIPTION_DURATION: "Valid subscription duration is required (Monthly, 6 Months, Yearly).",
      INVALID_SUBSCRIPTION_PRICE:"A valid subscription price greater than 0 is required.",
      INVALID_COUPON_CODE: "Invalid coupon code",
      INVALID_COUPON_DISCOUNT: "Invalid discount",
      INVALID_COUPON_MIN_AMOUNT:"Invalid minimum amount",
      INVALID_COUPON_QUANTITY:"Invalid quantity",
      INVALID_COUPON_START_DATE:"Invalid start date",
      INVALID_COUPON_END_DATE:"Invalid End date",
      COUPON_CODE_CANNOT_BE_UPDATED:"Counpon update failed",




    }
  }
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


