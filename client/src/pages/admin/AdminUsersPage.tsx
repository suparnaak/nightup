import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AdminLayout from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/adminStore";
import { Mail, Phone, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";
import { DataTable } from "../../components/common/DataTable";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isBlocked: boolean;
}

const AdminUsersPage: React.FC = () => {
  const { users, isLoading, error, userToggleStatus } = useAdminStore();
  const getUsers = useAdminStore(state => state.getUsers);
  const [toggling, setToggling] = useState<{ [id: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);

  const loadUsers = async (page: number) => {
    try {
      const res = await getUsers(page, pagination.limit);
      console.log("inside page",res.pagination)
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  const toggleBlock = async (id: string, newStatus: boolean) => {
    const action = newStatus ? "block" : "unblock";
    const confirm = await Swal.fire({
      title: `Are you sure you want to ${action} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`
    });
    if (!confirm.isConfirmed) return;

    try {
      setToggling(prev => ({ ...prev, [id]: true }));
      const resp = await userToggleStatus(id, newStatus);
      toast.success(resp.message || `User ${action}ed`);
      loadUsers(currentPage);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setToggling(prev => ({ ...prev, [id]: false }));
    }
  };

  const statusStyles = (blocked: boolean) =>
    blocked ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100";

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold">{user.name.charAt(0)}</span>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
            </div>
          </div>
        );
      },
      meta: {
        cellClassName: "px-6 py-4 whitespace-nowrap"
      }
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col space-y-1">
            <div className="text-sm text-gray-900 flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {user.email}
              {user.isVerified ? (
                <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500 ml-1" />
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {user.phone}
            </div>
          </div>
        );
      },
      meta: {
        cellClassName: "px-6 py-4 whitespace-nowrap"
      }
    },
    {
      accessorKey: "isBlocked",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusStyles(user.isBlocked)}`}>
              {user.isBlocked ? "Blocked" : "Active"}
            </span>
            <button 
              onClick={() => toggleBlock(user.id, !user.isBlocked)} 
              className="ml-3" 
              title="Toggle status"
              disabled={toggling[user.id]}
            >
              {toggling[user.id] ? (
                <Spinner />
              ) : user.isBlocked ? (
                <ToggleLeft className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleRight className="w-5 h-5 text-red-600" />
              )}
            </button>
          </div>
        );
      },
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center whitespace-nowrap"
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-red-600 bg-red-50 p-3 rounded">{error}</p>
        ) : users.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" />
            No users found.
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={users}
              tableClassName="min-w-full divide-y divide-gray-200 bg-white"
              headerRowClassName="bg-purple-600"
              headerCellClassName="px-6 py-3 text-left text-sm font-semibold text-white"
              rowClassName="hover:bg-gray-50 transition-colors"
              cellClassName="px-6 py-4 text-sm text-gray-800"
            />
            {/* {pagination.totalPages > 1 && ( */}
              <Pagination 
                currentPage={currentPage} 
                totalPages={pagination.totalPages} 
                onPageChange={setCurrentPage} 
                className="mt-6" 
              />
{/*             )}
 */}          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;