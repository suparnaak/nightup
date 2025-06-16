import React, { useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { SavedEvent } from "../../types/eventTypes";
import UserLayout from "../../layouts/UserLayout";
import { Link } from "react-router-dom";
import { Bookmark, Heart } from "lucide-react";

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; 
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return ""; 
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <UserLayout>
      <div className="min-h-[80vh] bg-gradient-to-br from-purple-50 to-fuchsia-50 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section - Similar to Profile */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Bookmark className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Your Saved Events
                  </h1>
                  <p className="text-purple-100 mt-1">Events you've bookmarked for later</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {isLoading && (
              <div className="flex justify-center py-10">
                <div className="animate-pulse">
                  <div className="h-6 w-32 bg-purple-200 rounded mb-4 mx-auto"></div>
                  <div className="h-4 w-48 bg-purple-100 rounded mx-auto"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                <p className="text-red-600 text-center">{error}</p>
              </div>
            )}

            {!isLoading && !error && savedEvents.length === 0 && (
              <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl max-w-lg mx-auto border border-purple-100">
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">No Saved Events Yet</h3>
                <p className="text-purple-600">Start exploring and save events that interest you!</p>
              </div>
            )}

            {!isLoading && !error && savedEvents.length > 0 && (
              <>
                <div className="mb-6 text-center">
                  <p className="text-purple-700 font-medium">
                    {savedEvents.length} {savedEvents.length === 1 ? 'Event' : 'Events'} Saved
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {savedEvents.map((evt: SavedEvent) => (
                    <div
                      key={evt._id}
                      className="rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-purple-100 bg-white hover:border-purple-200"
                    >
                      {/* Event Image - Clickable */}
                      <Link to={`/event/${evt.event._id}`}>
                        <div className="relative h-40 overflow-hidden bg-purple-100">
                          {evt.event.eventImage ? (
                            <img
                              src={evt.event.eventImage}
                              alt={evt.event.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-fuchsia-200">
                              <span className="text-purple-700 font-medium">No Image</span>
                            </div>
                          )}
                          
                          {/* Date overlay */}
                          {evt.event.date && (
                            <div className="absolute top-3 right-3 bg-purple-700 text-white py-1 px-3 text-xs font-medium rounded-full shadow-lg">
                              {formatDate(evt.event.date)}
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50">
                        {/* Title */}
                        <Link to={`/event/${evt.event._id}`}>
                          <h2 className="text-md font-semibold text-purple-800 hover:text-purple-600 transition-colors line-clamp-1 mb-2">
                            {evt.event.title}
                          </h2>
                        </Link>
                        
                        {/* Venue Info */}
                        {(evt.event.venueName || evt.event.venueCity) && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1 mb-1">
                            📍 {[evt.event.venueName, evt.event.venueCity].filter(Boolean).join(", ")}
                          </p>
                        )}
                        
                        {/* Time Info */}
                        {(evt.event.startTime || evt.event.endTime) && (
                          <p className="text-xs text-gray-600 mt-1 mb-3">
                            🕒 {evt.event.startTime && formatTime(evt.event.startTime)}
                            {evt.event.startTime && evt.event.endTime && " - "}
                            {evt.event.endTime && formatTime(evt.event.endTime)}
                          </p>
                        )}

                        {/* Remove Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(evt.event._id);
                            }}
                            className="text-xs px-3 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default SavedEventsPage;