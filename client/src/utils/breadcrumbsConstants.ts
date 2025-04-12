export const ROUTES = {
    HOME: "/",
  
    // User
    USER_PROFILE: "/user/profile",
    USER_CHANGE_PASSWORD: "/user/change-password",
    USER_WALLET: "/user/wallet",
    USER_SAVED_EVENTS: "/user/saved-events",
    USER_BOOKINGS: "/user/bookings",
  
    // Public Event
    EVENT: (id: string) => `/event/${id}`,
    EVENT_BOOKING_CONFIRMATION: (id: string) => `/event/${id}/booking-confirmation`,
  
    // Host
    HOST_DASHBOARD: "/host/dashboard",
    HOST_EVENTS: "/host/events",
    HOST_EVENTS_ADD: "/host/events/add",
    HOST_EVENT: (id: string) => `/host/events/${id}`,
    HOST_EVENT_EDIT: (id: string) => `/host/events/edit/${id}`,
    HOST_EVENT_BOOKINGS: (id: string) => `/host/events/${id}/bookings`,
    HOST_PROFILE: "/host/profile",
    HOST_SUBSCRIPTION: "/host/subscription",
  
    // Admin
    ADMIN_DASHBOARD: "/admin/dashboard",
    ADMIN_HOSTS: "/admin/hosts",
    ADMIN_USERS: "/admin/users",
    ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
    ADMIN_COUPONS: "/admin/coupons",
  };
  