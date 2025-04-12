// src/components/common/Breadcrumbs.tsx

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useEventStore } from "../../store/eventStore";
import { ROUTES } from "../../utils/breadcrumbsConstants";

interface Breadcrumb {
  path: string;
  label: string;
}

interface RouteMapping {
  pattern: RegExp;
  getBreadcrumb: (match: string[]) => Promise<Breadcrumb[]> | Breadcrumb[];
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const { fetchEventDetails } = useEventStore();

  // -- Generators --
  const getHome = (): Breadcrumb[] => [{ path: ROUTES.HOME, label: "Home" }];

  // Public Event
  const getEventDetail = (id: string, title: string) => [
    ...getHome(),
    { path: ROUTES.EVENT(id), label: title },
  ];
  const getBookingConfirmation = (id: string, title: string) => [
    ...getEventDetail(id, title),
    { path: ROUTES.EVENT_BOOKING_CONFIRMATION(id), label: "Confirmation" },
  ];

  // User
  const getUserProfile = () => [...getHome(), { path: ROUTES.USER_PROFILE, label: "Profile" }];
  const getUserChangePassword = () => [
    ...getUserProfile(),
    { path: ROUTES.USER_CHANGE_PASSWORD, label: "Change Password" },
  ];
  const getUserWallet = () => [...getHome(), { path: ROUTES.USER_WALLET, label: "Wallet" }];
  const getUserSavedEvents = () => [
    ...getHome(),
    { path: ROUTES.USER_SAVED_EVENTS, label: "Saved Events" },
  ];
  const getUserBookings = () => [
    ...getHome(),
    { path: ROUTES.USER_BOOKINGS, label: "Bookings" },
  ];

  // Host
  const getHostDashboard = () => [{ path: ROUTES.HOST_DASHBOARD, label: "Dashboard" }];
  const getHostEvents = () => [...getHostDashboard(), { path: ROUTES.HOST_EVENTS, label: "Events" }];
  const getHostEvent = (id: string, title: string) => [
    ...getHostEvents(),
    { path: ROUTES.HOST_EVENT(id), label: title },
  ];
  const getHostEventEdit = (id: string, title: string) => [
    ...getHostEvent(id, title),
    { path: ROUTES.HOST_EVENT_EDIT(id), label: "Edit" },
  ];
  const getHostEventBookings = (id: string, title: string) => [
    ...getHostEvent(id, title),
    { path: ROUTES.HOST_EVENT_BOOKINGS(id), label: "Bookings" },
  ];
  const getHostProfile = () => [...getHostDashboard(), { path: ROUTES.HOST_PROFILE, label: "Profile" }];
  const getHostSubscription = () => [
    ...getHostDashboard(),
    { path: ROUTES.HOST_SUBSCRIPTION, label: "Subscription" },
  ];

  // Admin
  const getAdminDashboard = () => [{ path: ROUTES.ADMIN_DASHBOARD, label: "Admin Dashboard" }];
  const getAdminHosts = () => [...getAdminDashboard(), { path: ROUTES.ADMIN_HOSTS, label: "Hosts" }];
  const getAdminUsers = () => [...getAdminDashboard(), { path: ROUTES.ADMIN_USERS, label: "Users" }];
  const getAdminSubscriptions = () => [
    ...getAdminDashboard(),
    { path: ROUTES.ADMIN_SUBSCRIPTIONS, label: "Subscriptions" },
  ];
  const getAdminCoupons = () => [
    ...getAdminDashboard(),
    { path: ROUTES.ADMIN_COUPONS, label: "Coupons" },
  ];

  // -- Route mappings --
  const routeMappings: RouteMapping[] = [
    // Home
    { pattern: /^\/$/, getBreadcrumb: () => getHome() },

    // Public Event
    {
      pattern: /^\/event\/([^/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const id = match[1];
        const ev = await fetchEventDetails(id);
        return getEventDetail(id, ev?.title || "Event");
      },
    },
    {
      pattern: /^\/event\/([^/]+)\/booking-confirmation\/?$/,
      getBreadcrumb: async (match) => {
        const id = match[1];
        const ev = await fetchEventDetails(id);
        return getBookingConfirmation(id, ev?.title || "Event");
      },
    },

    // User
    { pattern: new RegExp(`^${ROUTES.USER_PROFILE}/?$`),         getBreadcrumb: () => getUserProfile() },
    { pattern: new RegExp(`^${ROUTES.USER_CHANGE_PASSWORD}/?$`), getBreadcrumb: () => getUserChangePassword() },
    { pattern: new RegExp(`^${ROUTES.USER_WALLET}/?$`),          getBreadcrumb: () => getUserWallet() },
    { pattern: new RegExp(`^${ROUTES.USER_SAVED_EVENTS}/?$`),    getBreadcrumb: () => getUserSavedEvents() },
    { pattern: new RegExp(`^${ROUTES.USER_BOOKINGS}/?$`),        getBreadcrumb: () => getUserBookings() },

    // Host
    { pattern: new RegExp(`^${ROUTES.HOST_DASHBOARD}/?$`),   getBreadcrumb: () => getHostDashboard() },
    { pattern: new RegExp(`^${ROUTES.HOST_EVENTS}/?$`),      getBreadcrumb: () => getHostEvents() },
    { pattern: new RegExp(`^${ROUTES.HOST_EVENTS_ADD}/?$`),  getBreadcrumb: () => [...getHostEvents(), { path: ROUTES.HOST_EVENTS_ADD, label: "Add Event" }] },
    {
      pattern: /^\/host\/events\/([^/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const id = match[1];
        const ev = await fetchEventDetails(id);
        return getHostEvent(id, ev?.title || "Event");
      },
    },
    {
      pattern: /^\/host\/events\/edit\/([^/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const id = match[1];
        const ev = await fetchEventDetails(id);
        return getHostEventEdit(id, ev?.title || "Event");
      },
    },
    {
      pattern: /^\/host\/events\/([^/]+)\/bookings\/?$/,
      getBreadcrumb: async (match) => {
        const id = match[1];
        const ev = await fetchEventDetails(id);
        return getHostEventBookings(id, ev?.title || "Event");
      },
    },
    { pattern: new RegExp(`^${ROUTES.HOST_PROFILE}/?$`),      getBreadcrumb: () => getHostProfile() },
    { pattern: new RegExp(`^${ROUTES.HOST_SUBSCRIPTION}/?$`), getBreadcrumb: () => getHostSubscription() },

    // Admin
    { pattern: new RegExp(`^${ROUTES.ADMIN_DASHBOARD}/?$`),   getBreadcrumb: () => getAdminDashboard() },
    { pattern: new RegExp(`^${ROUTES.ADMIN_HOSTS}/?$`),       getBreadcrumb: () => getAdminHosts() },
    { pattern: new RegExp(`^${ROUTES.ADMIN_USERS}/?$`),       getBreadcrumb: () => getAdminUsers() },
    { pattern: new RegExp(`^${ROUTES.ADMIN_SUBSCRIPTIONS}/?$`), getBreadcrumb: () => getAdminSubscriptions() },
    { pattern: new RegExp(`^${ROUTES.ADMIN_COUPONS}/?$`),     getBreadcrumb: () => getAdminCoupons() },
  ];

  useEffect(() => {
    const generate = async () => {
      for (const { pattern, getBreadcrumb } of routeMappings) {
        const match = location.pathname.match(pattern);
        if (match) {
          const crumbs = await getBreadcrumb(match);
          setBreadcrumbs(crumbs);
          return;
        }
      }
      setBreadcrumbs([]); // no match → hide
    };
    generate();
  }, [location.pathname]);

  if (location.pathname === ROUTES.HOME) return null;

  return (
    <nav className="bg-gray-100 text-gray-600 px-6 py-2">
      <div className="max-w-7xl mx-auto text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.path}>
            {idx > 0 && <span className="mx-1">/</span>}
            {idx === breadcrumbs.length - 1 ? (
              <span className="text-gray-800 font-medium">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="text-purple-600 hover:underline">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
