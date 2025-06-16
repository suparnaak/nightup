import React, { useEffect } from "react";
import UserLayout from "../../layouts/UserLayout";
import Spinner from "../../components/common/Spinner";
import { useNotificationStore } from "../../store/notificationStore";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-[80vh] bg-gradient-to-br from-purple-50 to-fuchsia-50 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Bell className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Your Notifications</h1>
                  <p className="text-purple-100 mt-1">Stay updated with recent alerts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {unreadCount > 0 && (
              <p className="mb-4 text-sm text-purple-600">
                You have {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}.
              </p>
            )}

            {notifications.length === 0 ? (
              <p className="text-gray-600">You have no notifications.</p>
            ) : (
              <ul className="space-y-4">
                {notifications.map((n) => (
                  <li
                    key={n.notificationId}
                    onClick={() => !n.read && markAsRead(n.notificationId)}
                    className={`
                      p-4
                      rounded-md
                      cursor-pointer
                      transition
                      ${
                        n.read
                          ? "bg-gray-100 text-gray-600"
                          : "bg-white text-gray-900 shadow-md hover:shadow-lg"
                      }
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${n.read ? "" : "text-purple-700"}`}>
                        {n.message}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(n.createdAt).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <Link
                      to="/bookings"
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Go to Bookings
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default NotificationsPage;
