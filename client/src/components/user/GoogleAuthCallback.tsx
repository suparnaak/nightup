import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const GoogleAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { googleLogin } = useAuthStore();
  console.log("GoogleAuthCallback rendered", location.search);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      googleLogin(token);
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [location.search, navigate, googleLogin]);

  return <div>Logging you in...</div>;
};

export default GoogleAuthCallback;
