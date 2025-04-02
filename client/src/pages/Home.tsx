import React, { useEffect, useState } from "react";
import UserLayout from "../layouts/UserLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useEventStore } from "../store/eventStore";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const fetchEvents = useEventStore((state) => state.fetchAllEvents);
  const events = useEventStore((state) => state.events);
  const isLoading = useEventStore((state) => state.isLoading);
  const error = useEventStore((state) => state.error);

  const navigate = useNavigate();

  // State to toggle between showing few events and all events
  const [showAll, setShowAll] = useState<boolean>(false);
  // State to control the sidebar visibility
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  
  // New states for search and filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    // Prevent going back if needed
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, "", window.location.href);
    };
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Apply filters and search whenever dependencies change
  useEffect(() => {
    let result = [...events];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        event =>
          (event.title && event.title.toLowerCase().includes(query)) ||
          (event.artist && event.artist.toLowerCase().includes(query)) ||
          (event.venueName && event.venueName.toLowerCase().includes(query)) ||
          (event.category && event.category.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "All Categories") {
      result = result.filter(
        event => event.category && event.category === selectedCategory
      );
    }

    // Apply date filter
    if (selectedDate) {
      const filterDate = new Date(selectedDate).toLocaleDateString();
      result = result.filter(event => {
        if (!event.date) return false;
        return new Date(event.date).toLocaleDateString() === filterDate;
      });
    }

    setFilteredEvents(result);
  }, [events, searchQuery, selectedCategory, selectedDate]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedDate("");
  };

  // Helper function to check if an event is scheduled for today.
  const isEventToday = (eventDate: string): boolean => {
    const eventDay = new Date(eventDate).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    return eventDay === today;
  };

  // Get unique categories from events
  const categories = ["All Categories", ...new Set(events.map(event => event.category).filter(Boolean))];

  // Determine events to display based on showAll state and filters
  const displayedEvents = showAll ? filteredEvents : filteredEvents.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The actual filtering is handled in the useEffect
  };

  return (
    <UserLayout>
      {/* ===== BANNER SECTION ===== */}
      <section
        className="relative w-full bg-cover bg-center"
        style={{
          height: "60vh",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop')",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col justify-center items-center px-4"
          style={{
            backgroundColor: "rgba(76, 29, 149, 0.3)",
          }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-purple-100 mb-8 text-center">
            Discover Amazing Events Near You
          </h1>
          <form onSubmit={handleSearch} className="flex w-full max-w-xl bg-white rounded-full overflow-hidden shadow-lg focus-within:ring-2 focus-within:ring-purple-500 transition">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, artists, venues..."
              className="flex-1 px-6 py-4 text-gray-700 text-base focus:outline-none"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 transition-all duration-300">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-4 mt-12">
        {/* ===== TOP ACTION BUTTONS ===== */}
        <div className="flex justify-between items-center mb-6">
          <Button
            label={showAll ? "Show Latest Events" : "View All Events"}
            onClick={() => setShowAll(!showAll)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md"
          />
          
          {/* Filter dropdown */}
          <div className="relative" onMouseLeave={() => setShowSidebar(false)}>
            <button
              onMouseEnter={() => setShowSidebar(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300"
            >
              Filter Events {(selectedCategory !== "All Categories" || selectedDate) && "(Active)"}
            </button>
            {showSidebar && (
              <div
                onMouseEnter={() => setShowSidebar(true)}
                className="absolute top-full right-0 mt-1 bg-white shadow-xl p-6 w-80 z-10 rounded-md"
              >
                <h3 className="text-xl font-bold mb-4 text-purple-700">Filter Events</h3>
                <div className="flex flex-col space-y-6">
                  <div>
                    <label className="block text-sm mb-2 font-medium text-gray-700">
                      Category
                    </label>
                    <select 
                      className="w-full px-4 py-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 font-medium text-gray-700">
                      Date
                    </label>
                    <Input
                      type="date"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      label=""
                      name="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <Button
                    label="Reset Filters"
                    onClick={resetFilters}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter chips / active filters display */}
        {(selectedCategory !== "All Categories" || selectedDate || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="ml-2 text-purple-600 hover:text-purple-800">
                  ✕
                </button>
              </div>
            )}
            {selectedCategory !== "All Categories" && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("All Categories")} className="ml-2 text-purple-600 hover:text-purple-800">
                  ✕
                </button>
              </div>
            )}
            {selectedDate && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                Date: {new Date(selectedDate).toLocaleDateString()}
                <button onClick={() => setSelectedDate("")} className="ml-2 text-purple-600 hover:text-purple-800">
                  ✕
                </button>
              </div>
            )}
            {(selectedCategory !== "All Categories" || selectedDate || searchQuery) && (
              <button 
                onClick={resetFilters}
                className="text-purple-600 hover:text-purple-800 text-sm underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* ===== EVENTS SECTION ===== */}
        <section className="pb-12">
          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            {showAll ? "All Events" : "Latest Events"} 
            {filteredEvents.length > 0 && (
              <span className="text-gray-500 text-base font-normal ml-2">
                ({filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found)
              </span>
            )}
          </h2>
          {isLoading && (
            <div className="text-center text-gray-500">Loading events...</div>
          )}
          {error && (
            <div className="text-center text-red-500">Error: {error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedEvents && displayedEvents.length > 0 ? (
              displayedEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Event Image */}
                  <img
                    src={event.eventImage || "https://via.placeholder.com/400x200"}
                    alt={event.title || "Event Image"}
                    className="w-full h-48 object-cover"
                  />

                  {/* Event Details */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2 text-purple-700">
                      {event.title || "No Title"}
                    </h3>

                    {/* Venue */}
                    <p className="text-sm text-gray-600 mb-1">
                      {`${event.venueName || "Unknown Venue"}, ${event.venueCity || ""}`}
                    </p>

                    {/* Date */}
                    <p className="text-sm text-gray-600 mb-1">
                      Date: {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
                    </p>

                    {/* Time */}
                    <p className="text-sm text-gray-600 mb-1">
                      Time:{" "}
                      {event.startTime && event.endTime
                        ? `${new Date(event.startTime).toLocaleTimeString()} - ${new Date(event.endTime).toLocaleTimeString()}`
                        : "N/A"}
                    </p>

                    {/* Artist */}
                    <p className="text-sm text-gray-600 mb-1">
                      Artist: <span className="text-purple-600 font-medium">{event.artist || "N/A"}</span>
                    </p>

                    {/* Category */}
                    <p className="text-sm text-gray-600 mb-2">
                      Category: <span className="text-purple-600 font-medium">{event.category || "N/A"}</span>
                    </p>

                    {/* Conditional rendering for booking button */}
                    {isEventToday(event.date) ? (
                      <button
                        className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded-md cursor-not-allowed"
                        disabled
                      >
                        Booking Closed
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/event/${event._id}`)}
                        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-all duration-300"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              !isLoading && (
                <div className="text-center col-span-3 text-gray-500 py-12">
                  <p className="text-xl mb-2">No events found.</p>
                  {(selectedCategory !== "All Categories" || selectedDate || searchQuery) && (
                    <p>Try adjusting your search or filter criteria.</p>
                  )}
                  {(selectedCategory !== "All Categories" || selectedDate || searchQuery) && (
                    <button 
                      onClick={resetFilters}
                      className="mt-4 text-purple-600 hover:text-purple-800 underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </UserLayout>
  );
};

export default Home;