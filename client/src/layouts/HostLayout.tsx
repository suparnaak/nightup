import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

type HostLayoutProps = {
  children: React.ReactNode;
};

const HostLayout: React.FC<HostLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default HostLayout;
