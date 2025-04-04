import React, { ReactNode } from "react";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import Footer from "../components/common/Footer";
import Breadcrumbs from "../components/common/Breadcrumbs";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <Breadcrumbs />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
