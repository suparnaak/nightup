import { useEffect } from "react";
import { useEventStore } from "../../store/eventStore";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  User,
  Ticket,
  Eye,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminEvents = () => {
  const {
    fetchEventsForAdmin,
    events,
    isLoading,
    error,
    currentPage,
    totalPages,
    setPage,
  } = useEventStore();

  useEffect(() => {
    fetchEventsForAdmin();
  }, [currentPage]);

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string | number | Date) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const now = new Date();

  return (
    <AdminLayout>
      <div className="p-6 bg-purple-50">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-purple-800">All Events</h2>
        </div>

        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-purple-400 text-5xl mb-4">🎭</div>
            <p className="text-gray-600 text-lg">No events found.</p>
          </div>
        )}

        <div className="grid gap-6">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < now;

            return (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  <div className="md:w-1/4 relative">
                    <img
                      src={event.eventImage || "/placeholder-event.jpg"}
                      alt={event.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                    <div
                      className={`absolute top-3 right-3 text-white text-sm font-bold px-3 py-1 rounded-full ${
                        event.isBlocked
                          ? "bg-red-500"
                          : isPast
                          ? "bg-gray-500"
                          : "bg-green-500"
                      }`}
                    >
                      {event.isBlocked
                        ? "Cancelled"
                        : isPast
                        ? "Past"
                        : "Active"}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 md:w-3/4">
                    <h3 className="text-xl font-bold text-purple-800 mb-3">
                      {event.title}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={18} className="text-purple-600 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Clock size={18} className="text-purple-600 mr-2" />
                        <span>
                          {formatTime(event.startTime)} -{" "}
                          {formatTime(event.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="text-purple-600 mr-2" />
                        <span>
                          {event.venueName}, {event.venueCity}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Tag size={18} className="text-purple-600 mr-2" />
                        <span>{event.category}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <User size={18} className="text-purple-600 mr-2" />
                        <span>Artist: {event.artist}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <User size={18} className="text-purple-600 mr-2" />
                        <span>
                          Host:{" "}
                          {typeof event.hostId === "object" &&
                          "name" in event.hostId
                            ? event.hostId.name
                            : "Unknown Host"}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Info */}
                    {event.tickets.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-purple-700 font-semibold flex items-center mb-2">
                          <Ticket size={18} className="mr-2" />
                          Ticket Types
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {event.tickets.map((ticket, idx) => (
                            <div
                              key={idx}
                              className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                            >
                              {ticket.ticketType} - ₹{ticket.ticketPrice}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Bookings Link */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      {/* <a 
                        href={`/admin/events/${event._id}/bookings`}
                        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Eye size={16} className="mr-2" />
                        View Bookings
                      </a> */}
                      <Link
                        to={`/admin/events/${event._id}/bookings`}
                        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Eye size={16} className="mr-2" />
                        View Bookings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => currentPage > 1 && setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-purple-300 bg-white text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="hidden md:flex">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`relative inline-flex items-center px-4 py-2 border border-purple-300 bg-white text-sm font-medium ${
                      currentPage === i + 1
                        ? "bg-purple-600 text-white border-purple-600 z-10"
                        : "text-purple-700 hover:bg-purple-50"
                    }`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="md:hidden flex items-center px-4 border border-purple-300 bg-white">
                <span className="text-sm text-gray-700">
                  {currentPage} of {totalPages}
                </span>
              </div>

              <button
                onClick={() =>
                  currentPage < totalPages && setPage(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-purple-300 bg-white text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
