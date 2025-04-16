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
      PASSWORD_CHANGED:"Password changed successfully",
      EVENT_FETCHED: "Event details fetched successfully"
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
      JWT_SECRET_MISSING:"JWT token is not configured",
      NO_EVENT_FOUND: "No Event found",
      INVALID_EVENT_ID: "No Event Id availabale",
      REFRESH_TOKEN_MISSING: "No refresh token provided",
      REFRESH_TOKEN_INVALID: "refresh token is invalid",
      PAYMENT_FAILED: "Payment Failed Please try again",
      
    },
  },

  USER: {
    SUCCESS: {
      BOOKING_CREATED:"Booking confirmed successfully",
      EVENT_SAVED : "Event saved successfully",
      EVENT_REMOVED: "Event removed successfully",
      WALLET_UPDATED: "Wallet updated successfully",
    },
    ERROR: {
      EVENT_ID_MISSING: "Event is missing",
      EVENT_IS_SAVED: "Event is already saved",
      AMOUNT_INVALID: "Invalid Amount",
    },
  },

  HOST: {
    SUCCESS: {
      EVENT_CREATED:"Event created successfully",
      EVENT_FETCHED:"Events fetched successfully",
      EVENT_UPDATE:"Event updated successfully",
      EVENT_DELETED:"Event deleted successfully",
      FETCH_PROFILE: "Profile retrieved successfully",
      SUBSCRIPTION_UPGRADED: "Subscription upgraded successfully",
      SUBSCRIPTION_CREATED:"Subscribed successfully",
    },
    ERROR: {
      
      HOSTTYPE_REQUIRED: "Host type is required.",
      HOST_NOT_VERIFIED: "You are not allowed to add an event. Your account status does not permit this action.",
      DOCUMENT_NOT_VERIFIED: "You are not allowed to add an event. Your document is not verified by admin.",
      NO_SUBSCRIPTION: "You are not allowed to add an event. You don't have an active subscription.",
      MISSING_SUBSCRIPTION_FIELDS: "Missing required fields: planId, amount, or currentSubscriptionId",
      INVALID_SUBSCRIPTION:"Invalid subscription plan",
      UNAUTHORISED_SUBSCRIPTION:"Unauthorized: This subscription does not belong to you",
      SUBSCRIPTION_FAILED:"Failed to create new subscription",
      
    },
  },
  ADMIN:{
    SUCCESS:{
      HOSTS_FETCHED: "Hosts retrieved successfully",
      USERS_FETCHED: "Users retrieved successfully",
      DOCUMENT_VERIFIED: "Document has been verified successfully",
      DOCUMENT_REJECTED: "Document has been rejected",
      SUBSCRIPTION_CREATED: "Subscription created successfully",
      SUBSCRIPTION_UPDATED: "Subscription updated successfully",
      SUBSCRIPTION_DELETED:"Subscription deleted successfully",
      COUPON_CREATED :"Coupon created",
      COUPON_UPDATED:"Coupon updated",
      COUPON_DELETED:"Coupon deleted",
      CATEGORY_CREATED:"Category created successfully",
      CATEGORY_UPDATED:"Category updated successfully",
      EVENTS_FETCHED: "Events fetched successfully for admin",


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
      INVALID_CATEGORY_NAME:"Invalid category name",



    }
  }
};

/* export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  FORBIDDEN:403,
  CONFLICT:409
}; */

export enum STATUS_CODES {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  SERVER_ERROR = 500
}

