import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import HostLayout from "../../layouts/HostLayout";

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

const HostEventBookingsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { bookings, isLoading, pagination, fetchBookingsByEvent } = useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (eventId) {
      fetchBookingsByEvent(eventId, pagination.page, pageSize);
    }
  }, [eventId, fetchBookingsByEvent, pagination.page, pageSize]);

  // Helper function to get user name if available
  const getUserName = (
    userId: string | { name?: string; email?: string; [key: string]: any }
  ): string => {
    if (!userId) return "Unknown";
    if (typeof userId === "object" && userId.name) return userId.name;
    return String(userId); // Fall back to ID
  };

  // Helper function to get user email if available
  const getUserEmail = (
    userId: string | { email?: string; [key: string]: any }
  ): string => {
    if (!userId) return "Unknown";
    if (typeof userId === "object" && userId.email) return userId.email;
    return "Email not available";
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Handle opening booking details
  const openBookingDetails = (booking: ExtendedBooking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Handle page change
  const changePage = (newPage: number) => {
    if (eventId) {
      fetchBookingsByEvent(eventId, newPage, pageSize);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    if (eventId) {
      fetchBookingsByEvent(eventId, 1, newSize); // Reset to page 1 when changing page size
    }
  };

  // Render booking details modal
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

            <div className="mt-6 space-y-6">
              {/* Booking Info Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                  Booking Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ticket Number</p>
                    <p className="font-medium">
                      {selectedBooking.ticketNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedBooking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedBooking.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="font-medium">
                      {formatDate(selectedBooking.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(selectedBooking.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {getUserName(selectedBooking.userId)}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {getUserEmail(selectedBooking.userId)}
                  </p>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Ticket Details</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedBooking.tickets.map((ticket, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {ticket.ticketType}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {ticket.quantity}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          ₹{ticket.price}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          ₹{ticket.quantity * ticket.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {selectedBooking.totalAmount !==
                      selectedBooking.discountedAmount && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan={3}
                          className="px-3 py-2 font-medium text-right"
                        >
                          Discount Amount:
                        </td>
                        <td className="px-3 py-2 font-medium">
                          ₹{selectedBooking.discountedAmount}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-50">
                      <td
                        colSpan={3}
                        className="px-3 py-2 font-medium text-right"
                      >
                        Total Amount:
                      </td>
                      <td className="px-3 py-2 font-medium">
                        ₹{selectedBooking.totalAmount}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                  Payment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">
                      {selectedBooking.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium">
                      {selectedBooking.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment ID</p>
                    <p className="font-medium text-sm break-all">
                      {selectedBooking.paymentId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Information (if applicable) */}
              {selectedBooking.cancellation && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-red-800">
                    Cancellation Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Cancelled By:</strong>{" "}
                      {selectedBooking.cancellation.cancelledBy}
                    </p>
                    <p>
                      <strong>Cancelled On:</strong>{" "}
                      {formatDate(selectedBooking.cancellation.cancelledAt)}
                    </p>
                    <p>
                      <strong>Reason:</strong>{" "}
                      {selectedBooking.cancellation.reason}
                    </p>
                  </div>
                </div>
              )}
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No bookings yet for this event.</p>
          </div>
        ) : (
          <>
            {/* Table View */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ticket #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Payment
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking: any) => (
                    <tr
                      key={booking._id}
                      className={
                        booking.status === "cancelled" ? "bg-red-50" : ""
                      }
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                      pagination.page === 1
                        ? "text-gray-300"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                      pagination.page === pagination.pages
                        ? "text-gray-300"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(pagination.page - 1) * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(pagination.page * pageSize, pagination.total)}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => changePage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                          pagination.page === 1
                            ? "text-gray-300"
                            : "text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>

                      {/* Page numbers */}
                      {Array.from({ length: pagination.pages }).map((_, index) => {
                        const pageNum = index + 1;
                        
                        // Show limited page numbers for better UI
                        if (
                          pagination.pages <= 7 ||
                          pageNum === 1 ||
                          pageNum === pagination.pages ||
                          (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => changePage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                pagination.page === pageNum
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-900 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        
                        // Add ellipsis
                        if (
                          (pageNum === 2 && pagination.page > 3) ||
                          (pageNum === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                        ) {
                          return (
                            <span
                              key={`ellipsis-${pageNum}`}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        
                        return null;
                      })}

                      <button
                        onClick={() => changePage(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                          pagination.page === pagination.pages
                            ? "text-gray-300"
                            : "text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && renderDetailsModal()}
    </HostLayout>
  );
};

export default HostEventBookingsPage;