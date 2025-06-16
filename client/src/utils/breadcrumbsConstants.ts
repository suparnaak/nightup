export const ROUTES = {
  HOME: "/",

  // Public Events
  EVENT: (id: string) => `/event/${id}`,
  EVENT_BOOKING_CONFIRMATION: (id: string) =>
    `/event/${id}/booking-confirmation`,

  // User
  USER_PROFILE: "/user/profile",
  USER_CHANGE_PASSWORD: "/user/change-password",
  USER_WALLET: "/user/wallet",
  USER_SAVED_EVENTS: "/user/saved-events",
  USER_BOOKINGS: "/user/bookings",
  USER_INBOX: "/user/inbox",
  USER_NOTIFICATIONS: "/user/notification",

  // Host
  HOST_DASHBOARD: "/host/dashboard",
  HOST_EVENTS: "/host/events",
  HOST_EVENTS_ADD: "/host/events/add",
  HOST_EVENT: (id: string) => `/host/events/${id}`,
  HOST_EVENT_EDIT: (id: string) => `/host/events/edit/${id}`,
  HOST_EVENT_BOOKINGS: (id: string) => `/host/events/${id}/bookings`,
  HOST_PROFILE: "/host/profile",
  HOST_SUBSCRIPTION: "/host/subscription",
  HOST_INBOX: "/host/inbox",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_HOSTS: "/admin/hosts",
  ADMIN_USERS: "/admin/users",
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
  ADMIN_COUPONS: "/admin/coupons",

  // Listing at admin side
  ADMIN_EVENT_CATEGORIES: "/admin/event-categories",
  ADMIN_EVENTS: "/admin/events",
  ADMIN_EVENT_BOOKINGS: (id: string) => `/admin/events/${id}/bookings`,
};
