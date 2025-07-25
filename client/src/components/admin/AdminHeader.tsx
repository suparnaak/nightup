import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      navigate("/admin/login");
    }
  };

  return (
    <header className="bg-black text-white py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img
          src="/assets/images/nightup-logo.jpg"
          alt="Admin Logo"
          className="h-10 w-auto"
        />
        <h1 className="text-2xl font-bold">Admin Portal</h1>
      </div>
      <button
        onClick={handleLogout}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
      >
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
