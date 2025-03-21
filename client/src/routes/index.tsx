
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages for host, user
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import OtpVerification from "../pages/auth/OtpVerification";
import HostSignup from "../pages/auth/HostSignup";
import HostOtpVerification from "../pages/auth/HostOtpVerification";
import HostLogin from "../pages/auth/HostLogin";
import ResetPassword from "../pages/auth/ResetPassword";
import AdminLogin from "../pages/auth/AdminLogin";

// ProtectedRoutes
import ProtectedRoute from "../components/ProtectedRoute";

import HostDashboard from "../pages/host/HostDashboard";
import HostEvents from "../pages/host/HostEvents";
import HostAddEvent from "../pages/host/HostAddEvent";
import ForgotPassword from "../pages/auth/ForgotPassword";
import HostProfileManagement from "../pages/host/HostProfileManagement";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* user specific */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OtpVerification />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* host specific */}
        <Route path="/host/signup" element={<HostSignup />} />
        <Route path="/host/verify-otp" element={<HostOtpVerification />} />
        <Route path="/host/login" element={<HostLogin />} />

        {/* admin specific */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Routes */}
        {/* host specific */}
        <Route element={<ProtectedRoute allowedRoles={["host"]} />}>
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/events" element={<HostEvents />} />
          <Route path="/host/events/add" element={<HostAddEvent />} />
          <Route path="/host/profile" element={<HostProfileManagement />} />
        </Route>

       {/* for all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
