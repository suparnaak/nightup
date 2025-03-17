import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

type HostLayoutProps = {
  children: React.ReactNode;
};

const HostLayout: React.FC<HostLayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <main className="p-8">{children}</main>
      <Footer />
    </div>
  );
};

export default HostLayout;
