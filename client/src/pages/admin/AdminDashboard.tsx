// src/pages/admin/AdminDashboard.tsx
import React from "react";
import AdminLayout from "../../layouts/AdminLayout";

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Welcome, Admin!</h2>
        <p className="text-gray-700">
          This is your dashboard. Use the sidebar to navigate to different management pages.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
