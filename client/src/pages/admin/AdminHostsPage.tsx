// src/pages/admin/AdminHostsPage.tsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/adminStore";
import {
  Users,
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

const AdminHostsPage: React.FC = () => {
  const { hosts, getHosts, isLoading, error, hostToggleStatus, verifyDocument } = useAdminStore();
  const [togglingStatus, setTogglingStatus] = useState<{ [hostId: string]: boolean }>({});

  useEffect(() => {
    getHosts().catch(console.error);
  }, [getHosts]);

  const sortedHosts = [...hosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Handler for toggling block status with per-host loading
  const toggleBlockStatus = async (hostId: string, newStatus: boolean) => {
    try {
      // Set loading state for this host
      setTogglingStatus((prev) => ({ ...prev, [hostId]: true }));
      const response = await hostToggleStatus(hostId, newStatus);
      await getHosts();
      toast.success(response.message || "Block status updated successfully");
    } catch (err: any) {
      console.error("Error toggling block status:", err);
      toast.error(err.response?.data?.message || "Failed to update block status");
    } finally {
      // Clear loading state for this host
      setTogglingStatus((prev) => ({ ...prev, [hostId]: false }));
    }
  };

  // Handler for document verification (approve/reject)
  const verifyHostDocument = async (hostId: string, action: "approve" | "reject") => {
    try {
      const response = await verifyDocument({ hostId, action });
      await getHosts();
      toast.success(response.message || "Document updated successfully");
    } catch (err: any) {
      console.error("Error verifying document:", err);
      toast.error(err.response?.data?.message || "Document update failed");
    }
  };

  // Helper function for subscription status color based on subStatus
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

  // Helper function for block status color based on isBlocked
  const getBlockStatusColor = (isBlocked: boolean) => {
    return isBlocked ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100";
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Host Management</h2>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Host Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedHosts.map((host) => (
              <tr key={host.id}>
                {/* Host Details */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-700 font-semibold">
                        {host.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {host.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Crown className="w-4 h-4 mr-1" />
                        {host.hostType}
                      </div>
                    </div>
                  </div>
                </td>
                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {host.email}
                      {host.isVerified ? (
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
                      {host.phone}
                    </div>
                  </div>
                </td>
                {/* Subscription */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-900 flex items-center mb-1">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {host.subscriptionPlan}
                    </div>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubscriptionStatusColor(
                        host.subStatus
                      )}`}
                    >
                      {host.subStatus}
                    </span>
                  </div>
                </td>
                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center">
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBlockStatusColor(
        host.isBlocked
      )}`}
    >
      {host.isBlocked ? "Blocked" : "Active"}
    </span>
    <button
      className="ml-2"
      title="Toggle block status"
      onClick={() => toggleBlockStatus(host.id, !host.isBlocked)}
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
</td>

                {/* Document */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {host.documentUrl ? (
                    <div className="flex items-center">
                      <a
                        href={host.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 underline mr-2"
                        title="View Document"
                      >
                        <FileCheck className="w-5 h-5" />
                      </a>
                      {!host.adminVerified ? (
                        <div className="flex space-x-2">
                          <button
                            className="text-green-600 hover:text-green-800 text-xs"
                            title="Approve Document"
                            onClick={() => verifyHostDocument(host.id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Reject Document"
                            onClick={() => verifyHostDocument(host.id, "reject")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <CheckCircle
                          className="w-5 h-5 text-green-600"
                          aria-label="Document verified"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">No document uploaded</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminHostsPage;
