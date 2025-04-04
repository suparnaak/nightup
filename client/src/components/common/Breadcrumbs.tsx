import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Define a type for breadcrumb mappings
interface RouteMapping {
  pattern: RegExp;
  getBreadcrumb: (match: string[], state?: any) => Promise<{ path: string; label: string }[]> | { path: string; label: string }[];
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<{ path: string; label: string }[]>([]);
  
  // This function will fetch entity names when needed
  const fetchEntityName = async (entityType: string, id: string): Promise<string> => {
    // In a real application, you would make an API call here
    // For example:
    // const response = await fetch(`/api/${entityType}/${id}`);
    // const data = await response.json();
    // return data.name;
    
    // For demonstration, we'll just return a placeholder
    return `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} ${id}`;
  };

  // Define route mappings based on your application routes
  const routeMappings: RouteMapping[] = [
    // Public Routes
    {
      pattern: /^\/$/,
      getBreadcrumb: () => [{ path: "/", label: "Home" }]
    },
    {
      pattern: /^\/event\/([^\/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const eventId = match[1];
        const eventName = await fetchEntityName("event", eventId);
        return [
          { path: "/", label: "Home" },
          { path: `/event/${eventId}`, label: eventName }
        ];
      }
    },
    
    // Host Routes
    {
      pattern: /^\/host\/dashboard\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/host/dashboard", label: "Dashboard" }
      ]
    },
    {
      pattern: /^\/host\/events\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/host/dashboard", label: "Dashboard" },
        { path: "/host/events", label: "Events" }
      ]
    },
    {
      pattern: /^\/host\/events\/add\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/host/dashboard", label: "Dashboard" },
        { path: "/host/events", label: "Events" },
        { path: "/host/events/add", label: "Add Event" }
      ]
    },
    {
      pattern: /^\/host\/events\/([^\/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const eventId = match[1];
        const eventName = await fetchEntityName("event", eventId);
        return [
          //{ path: "/", label: "Home" },
          { path: "/host/dashboard", label: "Dashboard" },
          { path: "/host/events", label: "Events" },
          { path: `/host/events/${eventId}`, label: eventName }
        ];
      }
    },
    {
      pattern: /^\/host\/events\/edit\/([^\/]+)\/?$/,
      getBreadcrumb: async (match) => {
        const eventId = match[1];
        const eventName = await fetchEntityName("event", eventId);
        return [
          //{ path: "/", label: "Home" },
          { path: "/host/dashboard", label: "Dashboard" },
          { path: "/host/events", label: "Events" },
          { path: `/host/events/${eventId}`, label: eventName },
          { path: `/host/events/edit/${eventId}`, label: "Edit" }
        ];
      }
    },
    {
      pattern: /^\/host\/subscription\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/host/dashboard", label: "Dashboard" },
        { path: "/host/subscription", label: "Subscription" }
      ]
    },
    {
      pattern: /^\/host\/profile\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/host/dashboard", label: "Dashboard" },
        { path: "/host/profile", label: "Profile" }
      ]
    },
    
    // User Routes
    {
      pattern: /^\/user\/profile\/?$/,
      getBreadcrumb: () => [
        { path: "/", label: "Home" },
        { path: "/user/profile", label: "Profile" }
      ]
    },
    {
      pattern: /^\/user\/change-password\/?$/,
      getBreadcrumb: () => [
        { path: "/", label: "Home" },
        { path: "/user/profile", label: "Profile" },
        { path: "/user/change-password", label: "Change Password" }
      ]
    },
    {
      pattern: /^\/user\/wallet\/?$/,
      getBreadcrumb: () => [
        { path: "/", label: "Home" },
        { path: "/user/wallet", label: "Wallet" }
      ]
    },
    
    
    {
      pattern: /^\/admin\/dashboard\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/admin/dashboard", label: "Admin Dashboard" }
      ]
    },
    {
      pattern: /^\/admin\/hosts\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/admin/dashboard", label: "Admin Dashboard" },
        { path: "/admin/hosts", label: "Hosts" }
      ]
    },
    {
      pattern: /^\/admin\/users\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/admin/dashboard", label: "Admin Dashboard" },
        { path: "/admin/users", label: "Users" }
      ]
    },
    {
      pattern: /^\/admin\/subscriptions\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/admin/dashboard", label: "Admin Dashboard" },
        { path: "/admin/subscriptions", label: "Subscriptions" }
      ]
    },
    {
      pattern: /^\/admin\/coupons\/?$/,
      getBreadcrumb: () => [
        //{ path: "/", label: "Home" },
        { path: "/admin/dashboard", label: "Admin Dashboard" },
        { path: "/admin/coupons", label: "Coupons" }
      ]
    }
  ];

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      // Find matching route pattern
      for (const mapping of routeMappings) {
        const match = location.pathname.match(mapping.pattern);
        if (match) {
          const result = await mapping.getBreadcrumb(match, location.state);
          setBreadcrumbs(result);
          return;
        }
      }

      // Fallback to the original path-based breadcrumbs
      const pathnames = location.pathname.split("/").filter((x) => x);
      const defaultBreadcrumbs = [{ path: "/", label: "Home" }];
      
      pathnames.forEach((value, index) => {
        const path = `/${pathnames.slice(0, index + 1).join("/")}`;
        const label = value.charAt(0).toUpperCase() + value.slice(1);
        defaultBreadcrumbs.push({ path, label });
      });
      
      setBreadcrumbs(defaultBreadcrumbs);
    };

    generateBreadcrumbs();
  }, [location]);

  // Don't show breadcrumbs on the home page
  if (location.pathname === '/') {
    return null;
  }

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