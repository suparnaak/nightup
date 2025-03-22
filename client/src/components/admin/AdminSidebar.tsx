import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-200 min-h-screen p-4">
      <nav className="space-y-4">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 font-semibold text-white bg-purple-600 rounded"
              : "block px-4 py-2 font-semibold text-gray-700 hover:bg-purple-100 rounded"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 font-semibold text-white bg-purple-600 rounded"
              : "block px-4 py-2 font-semibold text-gray-700 hover:bg-purple-100 rounded"
          }
        >
          Users
        </NavLink>
        <NavLink
          to="/admin/hosts"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 font-semibold text-white bg-purple-600 rounded"
              : "block px-4 py-2 font-semibold text-gray-700 hover:bg-purple-100 rounded"
          }
        >
          Hosts
        </NavLink>
        <NavLink
          to="/admin/events"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 font-semibold text-white bg-purple-600 rounded"
              : "block px-4 py-2 font-semibold text-gray-700 hover:bg-purple-100 rounded"
          }
        >
          Events
        </NavLink>
        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 font-semibold text-white bg-purple-600 rounded"
              : "block px-4 py-2 font-semibold text-gray-700 hover:bg-purple-100 rounded"
          }
        >
          Bookings
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
