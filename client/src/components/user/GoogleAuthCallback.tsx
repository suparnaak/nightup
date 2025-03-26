import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const GoogleAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { googleLogin } = useAuthStore();
  console.log("GoogleAuthCallback rendered", location.search);
  useEffect(() => {
    // Parse the query parameters from the URL
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      // Call the store method to update auth state
      googleLogin(token);
      // Optionally, you might want to remove the query parameters from the URL or navigate away.
      navigate("/");
    } else {
      // If there's no token, redirect to login page or show an error.
      navigate("/login");
    }
  }, [location.search, navigate, googleLogin]);

  return <div>Logging you in...</div>;
};

export default GoogleAuthCallback;
