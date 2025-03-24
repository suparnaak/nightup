import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/adminStore";
import {
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";

const AdminUsersPage: React.FC = () => {
  const { users, getUsers, isLoading, error, userToggleStatus } = useAdminStore();
  const [togglingStatus, setTogglingStatus] = useState<{ [userId: string]: boolean }>({});

  useEffect(() => {
    getUsers().catch(console.error);
  }, [getUsers]);

  const sortedUsers = [...users].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const toggleBlockStatus = async (userId: string, newStatus: boolean) => {
    try {
      setTogglingStatus((prev) => ({ ...prev, [userId]: true }));
      const response = await userToggleStatus(userId, newStatus);
      await getUsers();
      toast.success(response.message || "Block status updated successfully");
    } catch (err: any) {
      console.error("Error toggling block status:", err);
      toast.error(err.response?.data?.message || "Failed to update block status");
    } finally {
      setTogglingStatus((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getBlockStatusColor = (isBlocked: boolean) => {
    return isBlocked ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100";
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                {/* User Details */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 font-semibold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {user.email}
                      {user.isVerified ? (
                        <CheckCircle
                          className="w-4 h-4 text-green-500 ml-1"
                          aria-label="Email verified"
                        />
                      ) : (
                        <AlertTriangle
                          className="w-4 h-4 text-red-500 ml-1"
                          aria-label="Email not verified"
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {user.phone}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBlockStatusColor(
                        user.isBlocked
                      )}`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                    <button
                      className="ml-2"
                      title="Toggle block status"
                      onClick={() => toggleBlockStatus(user.id, !user.isBlocked)}
                    >
                      {togglingStatus[user.id] ? (
                        <Spinner />
                      ) : user.isBlocked ? (
                        <ToggleLeft className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleRight className="w-5 h-5 text-red-600" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
