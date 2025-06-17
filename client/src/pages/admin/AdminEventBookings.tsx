import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { useBookingStore } from '../../store/bookingStore';
import toast from 'react-hot-toast';
import {
  User,
  Ticket,
  Calendar,
  Clock,
  Percent,
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const AdminEventBookings: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    bookings,
    isLoading,
    error,
    pagination,
    fetchBookingsByEventAdmin,
  } = useBookingStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (eventId) {
      fetchBookingsByEventAdmin(eventId, currentPage, itemsPerPage)
        .catch(err => toast.error(err.message));
    }
  }, [eventId, fetchBookingsByEventAdmin, currentPage, itemsPerPage]);

  // Fix: Get event title from the event object instead of eventId
  const eventTitle = bookings.length > 0 && bookings[0].event 
    ? bookings[0].event.title 
    : '';

  //const goToFirstPage = () => setCurrentPage(1);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-5 h-5 border-2 border-t-transparent border-purple-600 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 text-red-700 p-6 rounded-lg m-6">
          Error: {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-purple-50 min-h-screen">
        <div className="p-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-purple-800 mb-6">
            Bookings for "{eventTitle || 'Event'}"
          </h2>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Ticket size={24} className="text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg">
                No bookings found for this event.
              </p>
              <p className="text-purple-500 mt-2">
                Bookings will appear here once customers purchase tickets.
              </p>
            </div>
          ) : (
            <div>
              {/* Top pagination + per-page selector */}
              <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="text-sm text-purple-700 mb-4 md:mb-0">
                  Showing{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total}</span>{' '}
                  bookings
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-600 flex items-center">
                    Show
                    <select
                      value={itemsPerPage}
                      onChange={e => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="mx-2 border border-purple-200 rounded p-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    entries
                  </label>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.pages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>

              {/* Bookings list */}
              <div className="space-y-6">
                {bookings.map(booking => {
                  // Fix: Get userName from the user object instead of userId
                  const userName = booking.user?.name || 'Unknown User';

                  const totalTickets = booking.tickets.reduce(
                    (sum, t) => sum + t.quantity,
                    0
                  );
                  const bookingDate = new Date(booking.createdAt);

                  const status = booking.status?.toLowerCase() || 'pending';
                  const statusClasses = {
                    bg:
                      status === 'confirmed'
                        ? 'bg-green-50'
                        : status === 'pending'
                        ? 'bg-yellow-50'
                        : 'bg-red-50',
                    indicator:
                      status === 'confirmed'
                        ? 'bg-green-500'
                        : status === 'pending'
                        ? 'bg-yellow-500'
                        : 'bg-red-500',
                    text:
                      status === 'confirmed'
                        ? 'text-green-700'
                        : status === 'pending'
                        ? 'text-yellow-700'
                        : 'text-red-700',
                  };

                  return (
                    <div
                      key={booking.id} // Fix: Use booking.id instead of booking._id
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 hover:border-purple-300 transition-all"
                    >
                      {/* Header */}
                      <div
                        className={`px-6 py-4 border-b flex justify-between items-center ${statusClasses.bg}`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <User className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {userName}
                            </h3>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {bookingDate.toLocaleDateString()}{' '}
                              <Clock
                                size={12}
                                className="ml-2 mr-1"
                              />
                              {bookingDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`rounded-full h-3 w-3 mr-2 ${statusClasses.indicator}`}
                          ></div>
                          <span
                            className={`text-sm font-medium ${statusClasses.text}`}
                          >
                            {booking.status
                              ? booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1).toLowerCase()
                              : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Tickets */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="text-purple-800 font-semibold mb-3 flex items-center">
                              <Ticket size={18} className="mr-2" />
                              Ticket Details
                              <span className="ml-auto bg-purple-200 text-purple-800 text-xs py-1 px-2 rounded-full">
                                {totalTickets} total
                              </span>
                            </h4>
                            <ul className="space-y-2">
                              {booking.tickets.map((t, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                                >
                                  <span className="font-medium text-gray-700">
                                    {t.ticketType} × {t.quantity}
                                  </span>
                                  <span className="text-purple-700 font-semibold">
                                    ₹{t.price}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Payment */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="text-purple-800 font-semibold mb-3 flex items-center">
                              <Percent size={18} className="mr-2" />
                              Payment Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-700">
                                  ₹{booking.totalAmount + booking.discountedAmount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                <span className="text-gray-600 flex items-center">
                                  <Percent size={14} className="mr-1" />
                                  Discount
                                </span>
                                <span className="text-red-600">
                                  -₹{booking.discountedAmount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-purple-200 p-2 rounded shadow-sm">
                                <span className="font-semibold text-purple-800">
                                  Total Paid
                                </span>
                                <span className="font-bold text-purple-900">
                                  ₹{booking.totalAmount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Pagination */}
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.pages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEventBookings;