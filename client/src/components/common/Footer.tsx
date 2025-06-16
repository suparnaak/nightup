import React from "react";
const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-6">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} NightUp. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
