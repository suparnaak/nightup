// src/pages/HostEventBookingsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import HostLayout from "../../layouts/HostLayout";
import Pagination from "../../components/common/Pagination";

interface ExtendedBooking {
  _id: string;
  eventId: string | { _id: string; title: string; [key: string]: any };
  userId:
    | string
    | { _id: string; name: string; email: string; [key: string]: any };
  tickets: Array<{ ticketType: string; quantity: number; price: number }>;
  totalAmount: number;
  discountedAmount: number;
  paymentId: string;
  paymentStatus: string;
  paymentMethod: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  ticketNumber: string;
  cancellation?: {
    cancelledBy: string;
    cancelledAt: string;
    reason: string;
  };
  [key: string]: any; 
}

const HostEventBookingsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { bookings, isLoading, pagination, fetchBookingsByEvent } =
    useBookingStore();

  const [selectedBooking, setSelectedBooking] =
    useState<ExtendedBooking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (eventId) {
      fetchBookingsByEvent(eventId, pagination.page, pageSize);
    }
  }, [eventId, fetchBookingsByEvent, pagination.page, pageSize]);

  const getUserName = (
    userId: string | { name?: string; email?: string }
  ): string => {
    if (typeof userId === "object" && userId.name) return userId.name;
    return String(userId) || "Unknown";
  };

  const getUserEmail = (
    userId: string | { email?: string }
  ): string => {
    if (typeof userId === "object" && userId.email) return userId.email;
    return "Email not available";
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleString();

  const openBookingDetails = (booking: ExtendedBooking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const changePage = (newPage: number) => {
    if (eventId) {
      fetchBookingsByEvent(eventId, newPage, pageSize);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = +e.target.value;
    setPageSize(newSize);
    if (eventId) fetchBookingsByEvent(eventId, 1, newSize);
  };

  const renderDetailsModal = () => {
    if (!selectedBooking) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">Booking Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {/* ... rest of your modal markup unchanged ... */}
          </div>
        </div>
      </div>
    );
  };

  return (
    <HostLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bookings for Event</h1>
          <div className="flex items-center space-x-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600">
              Show:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border border-gray-300 rounded-md text-sm p-1"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">
              No bookings yet for this event.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking: any) => (
                    <tr
                      key={booking._id}
                      className={booking.status === "cancelled" ? "bg-red-50" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.ticketNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getUserName(booking.userId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{booking.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(booking.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => openBookingDetails(booking)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={changePage}
               
              />
            </div>
          </>
        )}
      </div>

      {showDetailsModal && renderDetailsModal()}
    </HostLayout>
  );
};

export default HostEventBookingsPage;
