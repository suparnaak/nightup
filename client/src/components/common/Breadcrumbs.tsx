import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useEventStore } from "../../store/eventStore";

interface Breadcrumb {
  path: string;
  label: string;
}

interface RouteMapping {
  pattern: RegExp;
  getBreadcrumb: (match: string[], state?: any) => Promise<Breadcrumb[]> | Breadcrumb[];
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const { fetchEventDetails } = useEventStore();

  
  const getHome = () => [{ path: "/", label: "Home" }];
  const getHostDashboard = () => [{ path: "/host/dashboard", label: "Dashboard" }];
  const getHostEvents = () => [...getHostDashboard(), { path: "/host/events", label: "Events" }];
  const getHostEvent = (eventId: string, eventName: string) =>
    [...getHostEvents(), { path: `/host/events/${eventId}`, label: eventName }];
  const getHostEventEdit = (eventId: string, eventName: string) =>
    [...getHostEvent(eventId, eventName), { path: `/host/events/edit/${eventId}`, label: "Edit" }];
  const getHostBookings = (eventId: string, eventName: string) =>
    [...getHostEvent(eventId, eventName), { path: `/host/events/${eventId}/bookings`, label: "Bookings" }];
  const getHostProfile = () => [...getHostDashboard(), { path: "/host/profile", label: "Profile" }];
  const getHostSubscription = () => [...getHostDashboard(), { path: "/host/subscription", label: "Subscription" }];

  const getUserProfile = () => [...getHome(), { path: "/user/profile", label: "Profile" }];
  const getUserChangePassword = () => [...getUserProfile(), { path: "/user/change-password", label: "Change Password" }];
  const getUserWallet = () => [...getHome(), { path: "/user/wallet", label: "Wallet" }];

  const getAdminDashboard = () => [{ path: "/admin/dashboard", label: "Admin Dashboard" }];
  const getAdminHosts = () => [...getAdminDashboard(), { path: "/admin/hosts", label: "Hosts" }];
  const getAdminUsers = () => [...getAdminDashboard(), { path: "/admin/users", label: "Users" }];
  const getAdminSubscriptions = () => [...getAdminDashboard(), { path: "/admin/subscriptions", label: "Subscriptions" }];
  const getAdminCoupons = () => [...getAdminDashboard(), { path: "/admin/coupons", label: "Coupons" }];

  const routeMappings: RouteMapping[] = [
    { pattern: /^\/$/, getBreadcrumb: () => getHome() },

    {
      pattern: /^\/event\/([^\/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const eventId = match[1];
        const event = await fetchEventDetails(eventId);
        return [...getHome(), { path: `/event/${eventId}`, label: event?.title || "Event" }];
      },
    },

    { pattern: /^\/host\/dashboard\/?$/, getBreadcrumb: () => getHostDashboard() },
    { pattern: /^\/host\/events\/?$/, getBreadcrumb: () => getHostEvents() },
    { pattern: /^\/host\/events\/add\/?$/, getBreadcrumb: () => [...getHostEvents(), { path: "/host/events/add", label: "Add Event" }] },

    {
      pattern: /^\/host\/events\/([^\/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const eventId = match[1];
        const event = await fetchEventDetails(eventId);
        return getHostEvent(eventId, event?.title || "Event");
      },
    },

    {
      pattern: /^\/host\/events\/edit\/([^\/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const eventId = match[1];
        const event = await fetchEventDetails(eventId);
        return getHostEventEdit(eventId, event?.title || "Event");
      },
    },

    {
      pattern: /^\/host\/events\/([^\/]+)\/bookings\/?$/,
      getBreadcrumb: async (match) => {
        const eventId = match[1];
        const event = await fetchEventDetails(eventId);
        return getHostBookings(eventId, event?.title || "Event");
      },
    },

    { pattern: /^\/host\/subscription\/?$/, getBreadcrumb: () => getHostSubscription() },
    { pattern: /^\/host\/profile\/?$/, getBreadcrumb: () => getHostProfile() },

    { pattern: /^\/user\/profile\/?$/, getBreadcrumb: () => getUserProfile() },
    { pattern: /^\/user\/change-password\/?$/, getBreadcrumb: () => getUserChangePassword() },
    { pattern: /^\/user\/wallet\/?$/, getBreadcrumb: () => getUserWallet() },

    { pattern: /^\/admin\/dashboard\/?$/, getBreadcrumb: () => getAdminDashboard() },
    { pattern: /^\/admin\/hosts\/?$/, getBreadcrumb: () => getAdminHosts() },
    { pattern: /^\/admin\/users\/?$/, getBreadcrumb: () => getAdminUsers() },
    { pattern: /^\/admin\/subscriptions\/?$/, getBreadcrumb: () => getAdminSubscriptions() },
    { pattern: /^\/admin\/coupons\/?$/, getBreadcrumb: () => getAdminCoupons() },
  ];

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      for (const mapping of routeMappings) {
        const match = location.pathname.match(mapping.pattern);
        if (match) {
          const result = await mapping.getBreadcrumb(match, location.state);
          setBreadcrumbs(result);
          return;
        }
      }

      
      const pathnames = location.pathname.split("/").filter(Boolean);
      const defaultBreadcrumbs: Breadcrumb[] = [{ path: "/", label: "Home" }];
      pathnames.forEach((value, index) => {
        const path = `/${pathnames.slice(0, index + 1).join("/")}`;
        const label = value.charAt(0).toUpperCase() + value.slice(1);
        defaultBreadcrumbs.push({ path, label });
      });

      setBreadcrumbs(defaultBreadcrumbs);
    };

    generateBreadcrumbs();
  }, [location]);

  if (location.pathname === "/") return null;

  return (
    <nav className="bg-gray-100 text-gray-600 px-6 py-2">
      <div className="max-w-7xl mx-auto text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <span className="mx-1">/</span>}
            {index === breadcrumbs.length - 1 ? (
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
