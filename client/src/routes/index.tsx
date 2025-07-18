import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages for host, user, admin
import Home from "../pages/Home";
import DetailedEventPage from "../pages/DetailedEventPage";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import OtpVerification from "../pages/auth/OtpVerification";
import HostSignup from "../pages/auth/HostSignup";
import HostOtpVerification from "../pages/auth/HostOtpVerification";
import HostLogin from "../pages/auth/HostLogin";
import ResetPassword from "../pages/auth/ResetPassword";
import AdminLogin from "../pages/auth/AdminLogin";
import ForgotPassword from "../pages/auth/ForgotPassword";
import GoogleAuthCallback from "../components/user/GoogleAuthCallback";

// ProtectedRoutes
import ProtectedRoute from "../components/ProtectedRoute";
//host specific
import HostDashboard from "../pages/host/HostRevenueDashboard";
import HostEvents from "../pages/host/HostEvents";
import HostAddEvent from "../pages/host/HostAddEvent";
import HostSubscriptionPage from "../pages/host/HostSubscriptionPage";
import HostProfileManagement from "../pages/host/HostProfileManagement";
import HostDetailedEventPage from "../pages/host/HostDetailedEventPage";
import HostEditEventPage from "../pages/host/HostEditEventPage";
import HostEventBookingsPage from "../pages/host/HostEventBookingsPage";
import HostInboxPage from "../pages/host/HostInboxPage"

//user specific
import Profile from "../pages/user/Profile";
import ChangePassword from "../pages/user/ChangePassword";
import WalletPage from "../pages/user/WalletPage";
import MyBookingsPage from "../pages/user/MyBookingsPage"
import SavedEventsPage from "../pages/user/SavedEventsPage";
import BookingConfirmationPage from "../pages/user/BookingConfirmationPage";
import NotificationsPage from "../pages/user/NotificationsPage";



//admin specific
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminHostsPage from "../pages/admin/AdminHostsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminSubscriptionPage from "../pages/admin/AdminSubscriptionPage";
import AdminCouponPage from "../pages/admin/AdminCouponPage";
import AdminCategoryPage from "../pages/admin/AdminCategoryPage";
import AdminEventsPage from "../pages/admin/AdminEvents";
import AdminEventBookingsPage from '../pages/admin/AdminEventBookings'
import UserInboxPage from "../pages/user/UserInboxPage";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<DetailedEventPage />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

        {/* user specific */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/event/:id/booking-confirmation" element={<BookingConfirmationPage />} />

               {/* host specific */}
        <Route path="/host/signup" element={<HostSignup />} />
        <Route path="/host/verify-otp" element={<HostOtpVerification />} />
        <Route path="/host/login" element={<HostLogin />} />
        <Route path="/host/events/:id" element={<HostDetailedEventPage />} />
        <Route path="/host/events/edit/:id" element={<HostEditEventPage />} />
        <Route path="/host/events/:eventId/bookings" element={<HostEventBookingsPage />} />

        {/* admin specific */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Routes */}
        {/* user specific */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/change-password" element={<ChangePassword />} />
          <Route path="/user/wallet" element={<WalletPage />} />
          <Route path="/user/bookings" element={<MyBookingsPage />} />
          <Route path="/user/saved-events" element={<SavedEventsPage />} />
          <Route path="/user/inbox" element={<UserInboxPage />} />
          <Route path="/user/notification" element={<NotificationsPage />} />
        </Route>
        {/* host specific */}
        <Route element={<ProtectedRoute allowedRoles={["host"]} />}>
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/events" element={<HostEvents />} />
          <Route path="/host/events/add" element={<HostAddEvent />} />
          <Route path="/host/subscription" element={<HostSubscriptionPage />} />
          <Route path="/host/profile" element={<HostProfileManagement />} />
          <Route path="/host/inbox" element={<HostInboxPage />} />
        </Route>

        {/* admin specific */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hosts" element={<AdminHostsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionPage />} />
          <Route path="/admin/coupons" element={<AdminCouponPage />} />
          <Route path="/admin/event-categories" element={<AdminCategoryPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/events/:eventId/bookings" element={<AdminEventBookingsPage />} />
        </Route>
        {/* for all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
