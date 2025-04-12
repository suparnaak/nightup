import React, { useEffect } from "react";
import { useUserStore, SavedEvent } from "../../store/userStore";
import UserLayout from "../../layouts/UserLayout";
import { Link } from "react-router-dom";

const SavedEventsPage: React.FC = () => {
  const {
    savedEvents,
    fetchSavedEvents,
    removeSavedEvent,
    isLoading,
    error,
  } = useUserStore();

  useEffect(() => {
    fetchSavedEvents().then(() => {
      console.log(
        "Raw populated events:",
        useUserStore.getState().savedEvents.map(e => e.event)
      );
    });
  }, [fetchSavedEvents]);

  useEffect(() => {
    console.log("💾 SavedEventsPage received:", savedEvents);
  }, [savedEvents]);

  const handleRemove = async (eventId: string) => {
    try {
      await removeSavedEvent(eventId);
    } catch (err) {
      console.error("Failed to remove event:", err);
    }
  };

  // Format date properly
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Check if date is valid
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Format time properly
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return ""; // Check if date is valid
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800">Your Saved Events</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto mt-2"></div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-purple-200 rounded mb-4 mx-auto"></div>
              <div className="h-4 w-48 bg-purple-100 rounded mx-auto"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 max-w-lg mx-auto">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {!isLoading && !error && savedEvents.length === 0 && (
          <div className="text-center py-12 bg-purple-50 rounded-lg max-w-lg mx-auto border border-purple-100">
            <p className="text-lg text-purple-700">You haven't saved any events yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {savedEvents.map((evt: SavedEvent) => (
            <div
              key={evt._id}
              className="rounded-lg shadow-sm overflow-hidden hover:shadow-md transition border border-purple-100"
            >
              {/* Event Image - Clickable */}
              <Link to={`/event/${evt.event._id}`}>
                <div className="relative h-40 overflow-hidden bg-purple-100">
                  {evt.event.eventImage ? (
                    <img
                      src={evt.event.eventImage}
                      alt={evt.event.title}
                      className="w-full h-full object-cover transition hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-200">
                      <span className="text-purple-700">No Image</span>
                    </div>
                  )}
                  
                  {/* Date overlay */}
                  {evt.event.date && (
                    <div className="absolute top-0 right-0 bg-purple-700 text-white py-1 px-2 text-xs font-medium">
                      {formatDate(evt.event.date)}
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-3 bg-purple-50">
                {/* Title */}
                <Link to={`/event/${evt.event._id}`}>
                  <h2 className="text-md font-semibold text-purple-800 hover:text-purple-600 line-clamp-1">
                    {evt.event.title}
                  </h2>
                </Link>
                
                {/* Venue Info */}
                {(evt.event.venueName || evt.event.venueCity) && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                    {[evt.event.venueName, evt.event.venueCity].filter(Boolean).join(", ")}
                  </p>
                )}
                
                {/* Time Info */}
                {(evt.event.startTime || evt.event.endTime) && (
                  <p className="text-xs text-gray-600 mt-1">
                    {evt.event.startTime && formatTime(evt.event.startTime)}
                    {evt.event.startTime && evt.event.endTime && " - "}
                    {evt.event.endTime && formatTime(evt.event.endTime)}
                  </p>
                )}

                {/* Remove Button */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(evt.event._id);
                    }}
                    className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default SavedEventsPage;