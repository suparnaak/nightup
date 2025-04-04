import React, { ReactNode } from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import Breadcrumbs from "../components/common/Breadcrumbs";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Breadcrumbs />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default UserLayout;
