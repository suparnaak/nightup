import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import HostLayout from "../../layouts/HostLayout";
import { useEventStore } from "../../store/eventStore";

const HostEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const events = useEventStore((state) => state.events);
  const isLoading = useEventStore((state) => state.isLoading);
  const error = useEventStore((state) => state.error);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const today = new Date();

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcomingEvents = sortedEvents.filter(
    (event) => new Date(event.date) >= today
  );
  const pastEvents = sortedEvents.filter(
    (event) => new Date(event.date) < today
  );

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(timeStr).toLocaleTimeString(undefined, options);
  };

  return (
    <HostLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <button
              onClick={() => navigate("/host/events/add")}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Event
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "upcoming"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Upcoming Events
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "past"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Past Events
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 text-lg">
              Loading events...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 text-lg">
              {error}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === "upcoming" ? upcomingEvents : pastEvents).map(
                  (event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
                    >
                      <img
                        src={event.eventImage}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4 flex flex-col h-[300px]">
                        <div>
                          <h2 className="text-xl font-semibold mb-1">
                            {event.title}
                          </h2>
                          <p className="text-gray-600 text-sm mb-1">
                            <strong>Date:</strong> {formatDate(event.date)}
                          </p>
                          <p className="text-gray-600 text-sm mb-1">
                            <strong>Time:</strong> {formatTime(event.startTime)}{" "}
                            - {formatTime(event.endTime)}
                          </p>
                          <p className="text-gray-600 text-sm mb-1">
                            <strong>Venue:</strong> {event.venueName},{" "}
                            {event.venueCity}, {event.venueState}
                          </p>
                          <p className="text-gray-600 text-sm mb-1">
                            <strong>Artist:</strong> {event.artist}
                          </p>
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <Link
                              to={`/host/events/${event._id}`}
                              className="text-purple-600 hover:underline font-medium"
                            >
                              More Details
                            </Link>
                            <Link
                              to={`/host/events/${event._id}/bookings`}
                              className="text-purple-600 hover:underline font-medium"
                            >
                              View Bookings
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* No Events Found Message */}
              {((activeTab === "upcoming" && upcomingEvents.length === 0) ||
                (activeTab === "past" && pastEvents.length === 0)) && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No {activeTab} events found.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </HostLayout>
  );
};

export default HostEvents;
