import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { useBookingStore } from '../../store/bookingStore';
import toast from 'react-hot-toast';
import { User, Ticket, Calendar, Clock, DollarSign, Percent, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminEventBookings: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { bookings, isLoading, error, pagination, fetchBookingsByEventAdmin } = useBookingStore();
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Fetch bookings when page, itemsPerPage or eventId changes
  useEffect(() => {
    if (eventId) {
      fetchBookingsByEventAdmin(eventId, currentPage, itemsPerPage)
        .catch(err => toast.error(err.message));
    }
  }, [eventId, fetchBookingsByEventAdmin, currentPage, itemsPerPage]);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < pagination.pages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <div className="w-5 h-5 border-2 border-t-transparent border-purple-600 rounded-full animate-spin"></div>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="bg-red-100 text-red-700 p-6 rounded-lg m-6">Error: {error}</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="bg-purple-50 min-h-screen">
        <div className="p-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-purple-800 mb-6">Bookings for Event</h2>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Ticket size={24} className="text-purple-600" />
              </div>
              <p className="text-gray-600 text-lg">No bookings found for this event.</p>
              <p className="text-purple-500 mt-2">Bookings will appear here once customers purchase tickets.</p>
            </div>
          ) : (
            <div>
              {/* Pagination controls at top */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
                <div className="text-sm text-purple-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, pagination.total)}</span> of{" "}
                  <span className="font-medium">{pagination.total}</span> bookings
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-600 flex items-center">
                    Show
                    <select 
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="mx-2 border border-purple-200 rounded p-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    entries
                  </label>
                  <div className="flex items-center">
                    <button 
                      onClick={goToPrevPage} 
                      disabled={currentPage === 1}
                      className="p-2 rounded-l border border-purple-200 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-white"
                    >
                      <ChevronLeft size={16} className="text-purple-700" />
                    </button>
                    <div className="px-4 py-2 border-t border-b border-purple-200 flex items-center">
                      <span className="text-purple-800 font-medium">{currentPage}</span>
                      <span className="text-gray-500 mx-1">of</span>
                      <span className="text-purple-800 font-medium">{pagination.pages}</span>
                    </div>
                    <button 
                      onClick={goToNextPage} 
                      disabled={currentPage === pagination.pages || pagination.pages === 0}
                      className="p-2 rounded-r border border-purple-200 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-white"
                    >
                      <ChevronRight size={16} className="text-purple-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking cards */}
              <div className="space-y-6">
                {bookings.map(booking => {
                  // Handle user name display
                  let userName: string;
                  if (typeof booking.userId === 'object' && booking.userId !== null && 'name' in booking.userId) {
                    userName = (booking.userId as any).name;
                  } else {
                    userName = String(booking.userId);
                  }

                  const totalTickets = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);
                  const bookingDate = new Date(booking.createdAt);

                  // Determine status styling
                  const status = booking.status?.toLowerCase() || "pending";
                  const statusClasses = {
                    bg: status === "confirmed" ? "bg-green-50" : 
                         status === "pending" ? "bg-yellow-50" : 
                         status === "cancelled" ? "bg-red-50" : "bg-gray-50",
                    indicator: status === "confirmed" ? "bg-green-500" : 
                                status === "pending" ? "bg-yellow-500" : 
                                status === "cancelled" ? "bg-red-500" : "bg-gray-500", 
                    text: status === "confirmed" ? "text-green-700" : 
                          status === "pending" ? "text-yellow-700" : 
                          status === "cancelled" ? "text-red-700" : "text-gray-700"
                  };

                  return (
                    <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 hover:border-purple-300 transition-all">
                      {/* Booking header with status indicator */}
                      <div className={`px-6 py-4 border-b flex justify-between items-center ${statusClasses.bg}`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <User className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{userName}</h3>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {bookingDate.toLocaleDateString()} 
                              <Clock size={12} className="ml-2 mr-1" />
                              {bookingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className={`rounded-full h-3 w-3 mr-2 ${statusClasses.indicator}`}></div>
                          <span className={`text-sm font-medium ${statusClasses.text}`}>
                            {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase() : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Booking body */}
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Ticket details */}
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
                                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                  <span className="font-medium text-gray-700">{t.ticketType} × {t.quantity}</span>
                                  <span className="text-purple-700 font-semibold">₹{t.price}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Payment details */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="text-purple-800 font-semibold mb-3 flex items-center">
                              <DollarSign size={18} className="mr-2" />
                              Payment Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-700">₹{booking.totalAmount + booking.discountedAmount}</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                <span className="text-gray-600 flex items-center">
                                  <Percent size={14} className="mr-1" />
                                  Discount
                                </span>
                                <span className="text-red-600">-₹{booking.discountedAmount}</span>
                              </div>
                              <div className="flex justify-between items-center bg-purple-200 p-2 rounded shadow-sm">
                                <span className="font-semibold text-purple-800">Total Paid</span>
                                <span className="font-bold text-purple-900">₹{booking.totalAmount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls at bottom */}
              <div className="mt-6 flex justify-center">
                <div className="bg-white rounded-lg shadow-md px-4 py-3 flex items-center">
                  <button 
                    onClick={() => setCurrentPage(1)} 
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    First
                  </button>
                  <button 
                    onClick={goToPrevPage} 
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-l text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    Previous
                  </button>
                  
                  <div className="px-4 flex">
                    {/* Generate page buttons */}
                    {(() => {
                      const pageButtons = [];
                      let startPage, endPage;
                      
                      if (pagination.pages <= 5) {
                        // Less than 5 pages, show all
                        startPage = 1;
                        endPage = pagination.pages;
                      } else if (currentPage <= 3) {
                        // Near start
                        startPage = 1;
                        endPage = 5;
                      } else if (currentPage >= pagination.pages - 2) {
                        // Near end
                        startPage = pagination.pages - 4;
                        endPage = pagination.pages;
                      } else {
                        // Middle
                        startPage = currentPage - 2;
                        endPage = currentPage + 2;
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pageButtons.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-8 h-8 mx-1 rounded-full ${
                              currentPage === i 
                                ? 'bg-purple-600 text-white' 
                                : 'text-purple-700 hover:bg-purple-100'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      return pageButtons;
                    })()}
                  </div>
                  
                  <button 
                    onClick={goToNextPage} 
                    disabled={currentPage === pagination.pages || pagination.pages === 0}
                    className="px-3 py-1 rounded-r text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    Next
                  </button>
                  <button 
                    onClick={() => setCurrentPage(pagination.pages)} 
                    disabled={currentPage === pagination.pages || pagination.pages === 0}
                    className="px-3 py-1 rounded text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-white"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEventBookings;