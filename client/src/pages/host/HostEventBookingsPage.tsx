import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import HostLayout from "../../layouts/HostLayout";
import Pagination from "../../components/common/Pagination";

interface ExtendedBooking {
  _id: string;
  eventId: string | { _id: string; title: string; [key: string]: any };
  userId: string;
  user?: { _id: string; id: string; name: string; email: string; [key: string]: any };
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

  const getUserName = (booking: any): string => {
    if (booking.user && booking.user.name) {
      return booking.user.name;
    }
    if (typeof booking.userId === "object" && booking.userId.name) {
      return booking.userId.name;
    }
    return "Unknown User";
  };

  const getUserEmail = (booking: any): string => {
    if (booking.user && booking.user.email) {
      return booking.user.email;
    }
    if (typeof booking.userId === "object" && booking.userId.email) {
      return booking.userId.email;
    }
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

 /*  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = +e.target.value;
    setPageSize(newSize);
    if (eventId) fetchBookingsByEvent(eventId, 1, newSize);
  }; */

  const renderDetailsModal = () => {
    if (!selectedBooking) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-semibold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Booking Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Ticket Number
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedBooking.ticketNumber}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedBooking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Booking Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedBooking.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedBooking.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {getUserName(selectedBooking)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">
                      {getUserEmail(selectedBooking)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Information */}
              {typeof selectedBooking.eventId === 'object' && selectedBooking.eventId.title && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Event Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Event Title
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.eventId.title}
                    </p>
                  </div>
                </div>
              )}

              {/* Ticket Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tickets
                </h3>
                <div className="space-y-2">
                  {selectedBooking.tickets.map((ticket, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {ticket.ticketType}
                        </p>
                        <p className="text-xs text-gray-600">
                          Quantity: {ticket.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{ticket.price}
                        </p>
                        <p className="text-xs text-gray-600">
                          Total: ₹{ticket.price * ticket.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Payment ID
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedBooking.paymentId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Payment Method
                    </label>
                    <p className="text-sm text-gray-900 capitalize">
                      {selectedBooking.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Payment Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedBooking.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : selectedBooking.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Total Amount
                    </label>
                    <p className="text-sm text-gray-900 font-semibold">
                      ₹{selectedBooking.totalAmount}
                    </p>
                    {selectedBooking.discountedAmount > 0 && (
                      <p className="text-xs text-green-600">
                        Discount Applied: ₹{selectedBooking.discountedAmount}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cancellation Information (if cancelled) */}
              {selectedBooking.status === "cancelled" && selectedBooking.cancellation && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">
                    Cancellation Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-red-600">
                        Cancelled By
                      </label>
                      <p className="text-sm text-red-900">
                        {selectedBooking.cancellation.cancelledBy}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-600">
                        Cancelled At
                      </label>
                      <p className="text-sm text-red-900">
                        {formatDate(selectedBooking.cancellation.cancelledAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-600">
                        Reason
                      </label>
                      <p className="text-sm text-red-900">
                        {selectedBooking.cancellation.reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupon Information (if applicable) */}
              {selectedBooking.couponId && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Coupon Applied
                  </h3>
                  <p className="text-sm text-blue-800">
                    Coupon ID: {selectedBooking.couponId}
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
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
                        {getUserName(booking)}
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