import React, { useEffect, useState } from "react";
import UserLayout from "../layouts/UserLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useEventStore } from '../store/eventStore';
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const fetchEvents = useEventStore((state) => state.fetchAllEvents);
  const events = useEventStore((state) => state.events);
  const isLoading = useEventStore((state) => state.isLoading);
  const error = useEventStore((state) => state.error);

  const navigate = useNavigate();
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, "", window.location.href);
    };
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    console.log("Fetched events from backend:", events);
  }, [events]);

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

          <div className="flex w-full max-w-xl bg-white rounded-full overflow-hidden shadow-lg focus-within:ring-2 focus-within:ring-purple-500 transition">
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              className="flex-1 px-6 py-4 text-gray-700 text-base focus:outline-none"
            />
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 transition-all duration-300">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ===== PAGE CONTENT WRAPPER ===== */}
      <div className="max-w-screen-xl mx-auto px-4 mt-12">
        {/* ===== TOP ACTION BUTTONS ===== */}
        <div className="flex justify-between items-center mb-6">
          {/* View All Events button on the LEFT */}
          <Button
            label="View All Events"
            onClick={() => console.log("View All Events Clicked")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md"
          />

          {/* Filter Events button on the RIGHT with properly aligned dropdown */}
          <div className="relative" onMouseLeave={() => setShowSidebar(false)}>
            <button
              onMouseEnter={() => setShowSidebar(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300"
            >
              Filter Events
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
                    <select className="w-full px-4 py-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                      <option>All Categories</option>
                      <option>Concert</option>
                      <option>Party</option>
                      <option>Workshop</option>
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
                      value=""
                      onChange={() => {}}
                    />
                  </div>

                  <Button
                    label="Reset Filters"
                    onClick={() => console.log("Reset Filters Clicked")}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== LATEST EVENTS SECTION ===== */}
        <section className="pb-12">
          {/* Latest Events heading on the LEFT */}
          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            Latest Events
          </h2>

          {isLoading && (
            <div className="text-center text-gray-500">Loading events...</div>
          )}

          {error && (
            <div className="text-center text-red-500">Error: {error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events && events.length > 0 ? (
              events.map((event) => (
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

                    {/* Book Now */}
                    <button
                      onClick={() => navigate(`/event/${event._id}`)}
                      className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-all duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              !isLoading && (
                <div className="text-center col-span-3 text-gray-500">
                  No events found.
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