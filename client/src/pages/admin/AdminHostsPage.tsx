import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import AdminLayout from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/adminStore";
import {
  Mail,
  Phone,
  Crown,
  CreditCard,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Pagination from "../../components/common/Pagination";
import { DataTable } from "../../components/common/DataTable";

interface Host {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostType: string;
  isVerified: boolean;
  isBlocked: boolean;
  subscriptionPlan: string;
  subStatus: string;
  documentUrl?: string;
  documentStatus: "approved" | "pending" | "rejected";
  rejectionReason?: string;
}

const AdminHostsPage: React.FC = () => {
  const getHosts = useAdminStore((state) => state.getHosts);
  const hosts = useAdminStore((state) => state.hosts);
  const pagination = useAdminStore((state) => state.pagination);
  const hostToggleStatus = useAdminStore((state) => state.hostToggleStatus);
  const verifyDocument = useAdminStore((state) => state.verifyDocument);
  const isLoading = useAdminStore((state) => state.isLoading);
  const error = useAdminStore((state) => state.error);

  const [togglingStatus, setTogglingStatus] = useState<{ [id: string]: boolean }>({});
  const [verifyingStatus, setVerifyingStatus] = useState<{ [id: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const limit=10

  useEffect(() => {
    getHosts(currentPage, limit).catch((err) => console.error(err));
  }, [getHosts, currentPage, limit]);

  const toggleBlockStatus = async (hostId: string, newStatus: boolean) => {
    const actionLabel = newStatus ? "block" : "unblock";
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to ${actionLabel} this host?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel} it!`,
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    try {
      setTogglingStatus((prev) => ({ ...prev, [hostId]: true }));
      const res = await hostToggleStatus(hostId, newStatus);
      toast.success(res.message || "Block status updated");
      await getHosts(currentPage, limit);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update block status");
    } finally {
      setTogglingStatus((prev) => ({ ...prev, [hostId]: false }));
    }
  };

  const verifyHostDocument = async (
    hostId: string,
    action: "approve" | "reject"
  ) => {
    setVerifyingStatus((prev) => ({ ...prev, [hostId]: true }));
    const payload: any = { hostId, action };

    if (action === "reject") {
      const { value: reason } = await Swal.fire({
        title: "Enter Rejection Reason",
        input: "text",
        showCancelButton: true,
        inputValidator: (v) => (v ? null : "Rejection reason is required"),
      });
      if (!reason) {
        toast.error("Rejection reason is required.");
        setVerifyingStatus((prev) => ({ ...prev, [hostId]: false }));
        return;
      }
      payload.rejectionReason = reason;
    }

    try {
      const response = await verifyDocument(payload);
      toast.success(response.message || "Document updated successfully");
      await getHosts(currentPage, limit);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Document update failed");
    } finally {
      setVerifyingStatus((prev) => ({ ...prev, [hostId]: false }));
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Not Subscribed":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getBlockStatusColor = (isBlocked: boolean) =>
    isBlocked ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100";

  const columns: ColumnDef<Host>[] = [
    {
      accessorKey: "name",
      header: "Host Details",
      cell: ({ row }) => {
        const host = row.original;
        return (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold">{host.name.charAt(0)}</span>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{host.name}</div>
              <div className="text-sm text-gray-500 flex items-center">
                <Crown className="w-4 h-4 mr-1" />
                {host.hostType}
              </div>
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
        const host = row.original;
        return (
          <div className="flex flex-col space-y-1">
            <div className="text-sm text-gray-900 flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {host.email}
              {host.isVerified ? (
                <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500 ml-1" />
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {host.phone}
            </div>
          </div>
        );
      },
      meta: {
        cellClassName: "px-6 py-4 whitespace-nowrap"
      }
    },
    {
      accessorKey: "subscriptionPlan",
      header: "Subscription",
      cell: ({ row }) => {
        const host = row.original;
        return (
          <div className="flex flex-col">
            <div className="flex items-center text-sm text-gray-900 mb-1">
              <CreditCard className="w-4 h-4 mr-1" />
              {host.subscriptionPlan}
            </div>
            <span
              className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getSubscriptionStatusColor(
                host.subStatus
              )}`}
            >
              {host.subStatus}
            </span>
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
        const host = row.original;
        return (
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getBlockStatusColor(
                host.isBlocked
              )}`}
            >
              {host.isBlocked ? "Blocked" : "Active"}
            </span>
            <button
              onClick={() => toggleBlockStatus(host.id, !host.isBlocked)}
              className="ml-3"
              title="Toggle status"
              disabled={togglingStatus[host.id]}
            >
              {togglingStatus[host.id] ? (
                <Spinner />
              ) : host.isBlocked ? (
                <ToggleLeft className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleRight className="w-5 h-5 text-red-600" />
              )}
            </button>
          </div>
        );
      },
      meta: {
        cellClassName: "px-6 py-4 whitespace-nowrap"
      }
    },
    {
      accessorKey: "documentStatus",
      header: "Document",
      cell: ({ row }) => {
        const host = row.original;
        return (
          <div>
            {host.documentUrl ? (
              <div className="flex items-center">
                <a
                  href={host.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline mr-2"
                >
                  <FileCheck className="w-5 h-5" />
                </a>
                {host.documentStatus === "approved" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : host.documentStatus === "pending" ? (
                  <div className="flex flex-col space-y-1">
                    <div className="flex space-x-2">
                      <button
                        disabled={verifyingStatus[host.id]}
                        onClick={() => verifyHostDocument(host.id, "approve")}
                        className="text-green-600 hover:text-green-800 text-xs disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={verifyingStatus[host.id]}
                        onClick={() => verifyHostDocument(host.id, "reject")}
                        className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                    {verifyingStatus[host.id] && (
                      <div className="flex items-center">
                        <Spinner />
                        <span className="text-xs ml-2">Verifying...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-red-600">
                    Rejected: {host.rejectionReason || "No reason provided"}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-red-600 text-sm">No document uploaded</p>
            )}
          </div>
        );
      },
      meta: {
        cellClassName: "px-6 py-4 whitespace-nowrap"
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Host Management</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-red-600 bg-red-50 p-3 rounded">{error}</p>
        ) : hosts.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" />
            <p>No hosts found.</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={hosts}
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
          {/*   )} */}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHostsPage;