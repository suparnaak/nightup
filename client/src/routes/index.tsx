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
import AdminHostsPage from "../pages/admin/AdminHostsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminSubscriptionPage from "../pages/admin/AdminSubscriptionPage";
import AdminCouponPage from "../pages/admin/AdminCouponPage";

// ProtectedRoutes
import ProtectedRoute from "../components/ProtectedRoute";

import HostDashboard from "../pages/host/HostDashboard";
import HostEvents from "../pages/host/HostEvents";
import HostAddEvent from "../pages/host/HostAddEvent";
import ForgotPassword from "../pages/auth/ForgotPassword";
import HostProfileManagement from "../pages/host/HostProfileManagement";
import AdminDashboard from "../pages/admin/AdminDashboard";
import GoogleAuthCallback from "../components/user/GoogleAuthCallback";
//user specific
import Profile from "../pages/user/Profile";//user's profile
import ChangePassword from "../pages/user/ChangePassword";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

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
        {/* user specific */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/change-password" element={<ChangePassword />} />
        </Route>
        {/* host specific */}
        <Route element={<ProtectedRoute allowedRoles={["host"]} />}>
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/events" element={<HostEvents />} />
          <Route path="/host/events/add" element={<HostAddEvent />} />
          <Route path="/host/profile" element={<HostProfileManagement />} />
        </Route>

        {/* admin specific */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hosts" element={<AdminHostsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionPage />} />
          <Route path="/admin/coupons" element={<AdminCouponPage />} />

        </Route>
        

        {/* for all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
