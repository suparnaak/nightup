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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Swal from "sweetalert2";

const AdminUsersPage: React.FC = () => {
  const { users, isLoading, error, userToggleStatus } = useAdminStore();
  const getUsers = useAdminStore(state => state.getUsers);
  const [togglingStatus, setTogglingStatus] = useState<{ [userId: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  useEffect(() => {
    loadUsers(currentPage, limit);
  }, [currentPage, limit]);

  const loadUsers = async (page: number, limit: number) => {
    try {
      const result = await getUsers(page, limit);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleBlockStatus = async (userId: string, newStatus: boolean) => {
    const actionLabel = newStatus ? "block" : "unblock";
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to ${actionLabel} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel} it!`,
      cancelButtonText: "Cancel",
    });
  
    if (!confirmation.isConfirmed) {
      return; 
    }
  
    try {
      setTogglingStatus((prev) => ({ ...prev, [userId]: true }));
      const response = await userToggleStatus(userId, newStatus);
      toast.success(response.message || `User ${actionLabel}ed successfully`);
      // Refresh the current page after toggling status
      loadUsers(currentPage, limit);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update block status");
    } finally {
      setTogglingStatus((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getBlockStatusColor = (isBlocked: boolean) => {
    return isBlocked ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100";
  };

  const renderPagination = () => {
    const pages = [];
    const { totalPages } = pagination;

    // Show max 5 pages with current page in the middle when possible
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center mt-6">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`p-1 rounded ${
            currentPage === 1
              ? "text-gray-400"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`p-1 rounded ${
            currentPage === totalPages
              ? "text-gray-400"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          User Management
        </h2>
        <div className="flex items-center">
          <label htmlFor="limit" className="mr-2 text-sm text-gray-600">
            Users per page:
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center my-8">
          <Spinner  />
        </div>
      )}
      
      {error && <p className="text-red-600 bg-red-50 p-3 rounded">{error}</p>}

      {!isLoading && users.length === 0 && (
        <div className="bg-yellow-50 p-4 rounded flex items-center">
          <AlertTriangle className="text-yellow-500 mr-2" />
          <p>No users found.</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
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
              {users.map((user) => (
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
          
          {/* Pagination controls */}
          {renderPagination()}
          
          {/* Pagination info */}
          <div className="mt-2 mb-4 text-center text-sm text-gray-500">
            Showing {users.length} of {pagination.total} users | Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;