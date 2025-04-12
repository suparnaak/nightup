import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import UserLayout from "../layouts/UserLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useEventStore } from "../store/eventStore";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Award,
  Shield,
  CreditCard,
  Users,
  Star,
  CheckCircle,
} from "lucide-react";

const Home: React.FC = () => {
  const fetchEvents = useEventStore((state) => state.fetchAllEvents);
  const events = useEventStore((state) => state.events);
  const isLoading = useEventStore((state) => state.isLoading);
  const error = useEventStore((state) => state.error);
  const selectedCity = useEventStore((state) => state.selectedCity);
  const fetchEventsByCity = useEventStore((state) => state.fetchEventsByCity);

  const navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);

  const [visibleEventsCount, setVisibleEventsCount] = useState<number>(6);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const BATCH_SIZE = 6;

  // based on city
  useEffect(() => {
    if (!initialFetchDone) {
      if (selectedCity) {
        fetchEventsByCity(selectedCity);
      } else {
        fetchEvents();
      }
      setInitialFetchDone(true);
    }
  }, [fetchEvents, fetchEventsByCity, selectedCity, initialFetchDone]);

  //when city changes
  useEffect(() => {
    if (initialFetchDone) {
      if (selectedCity) {
        fetchEventsByCity(selectedCity);
      } else {
        fetchEvents();
      }

      setVisibleEventsCount(6);
      setHasMore(true);
    }
  }, [selectedCity, initialFetchDone, fetchEventsByCity, fetchEvents]);

  const filteredEvents = useMemo(() => {
    let result = [...events];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          (event.title && event.title.toLowerCase().includes(query)) ||
          (event.artist && event.artist.toLowerCase().includes(query)) ||
          (event.venueName && event.venueName.toLowerCase().includes(query)) ||
          (event.category && event.category.toLowerCase().includes(query))
      );
    }

    if (selectedCategory && selectedCategory !== "All Categories") {
      result = result.filter(
        (event) => event.category && event.category === selectedCategory
      );
    }

    if (selectedDate) {
      const filterDate = new Date(selectedDate).toLocaleDateString();
      result = result.filter((event) => {
        if (!event.date) return false;
        return new Date(event.date).toLocaleDateString() === filterDate;
      });
    }

    return result;
  }, [events, searchQuery, selectedCategory, selectedDate]);

  // Reset visible events count when filters change
  useEffect(() => {
    setVisibleEventsCount(6);
    setHasMore(true);
  }, [searchQuery, selectedCategory, selectedDate]);

  // Check if we have more events to load
  useEffect(() => {
    setHasMore(visibleEventsCount < filteredEvents.length);
  }, [visibleEventsCount, filteredEvents.length]);

  // Infinite scroll implementation using Intersection Observer
  const lastEventElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setVisibleEventsCount((prevCount) => prevCount + BATCH_SIZE);
          }
        },
        { threshold: 0.1 }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedDate("");
  };

  const isEventToday = (eventDate: string): boolean => {
    const eventDay = new Date(eventDate).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    return eventDay === today;
  };

  const categories = [
    "All Categories",
    ...new Set(events.map((event) => event.category).filter(Boolean)),
  ];

  const displayedEvents = filteredEvents.slice(0, visibleEventsCount);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Format time properly
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <UserLayout>
      {/* ===== BANNER SECTION ===== */}
      <section
        className="relative w-full bg-cover bg-center"
        style={{
          height: "70vh",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop')",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col justify-center items-center px-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent shadow overlay
          }}
        >
          <div className="max-w-screen-xl w-full mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center leading-tight">
              {selectedCity
                ? `Discover Events in ${selectedCity}`
                : "Find Your Perfect Event Experience"}
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Book tickets for concerts, workshops, sports, and more with just a
              few clicks
            </p>
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-2xl mx-auto bg-white rounded-full overflow-hidden shadow-lg focus-within:ring-2 focus-within:ring-purple-500 transition"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, artists, venues..."
                className="flex-1 px-6 py-4 text-gray-700 text-base focus:outline-none"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 transition-all duration-300"
              >
                Search
              </button>
            </form>

            {/* Trending categories quick access */}
            <div className="mt-8 hidden md:block">
              <div className="flex justify-center space-x-4">
                {["Concerts", "Sports", "Technology", "Art", "Food"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-fuchsia-900 px-4 py-2 rounded-full backdrop-blur-sm transition"
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES SECTION ===== */}
      <section className="bg-purple-50 py-8 border-t border-b border-purple-100">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="text-purple-600 mb-2 flex items-center justify-center">
                <Users size={28} />
              </div>
              <p className="text-2xl font-bold text-purple-800">10,000+</p>
              <p className="text-sm text-gray-600">Happy Customers</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-purple-600 mb-2 flex items-center justify-center">
                <Shield size={28} />
              </div>
              <p className="text-2xl font-bold text-purple-800">100%</p>
              <p className="text-sm text-gray-600">Secure Payments</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-purple-600 mb-2 flex items-center justify-center">
                <Calendar size={28} />
              </div>
              <p className="text-2xl font-bold text-purple-800">500+</p>
              <p className="text-sm text-gray-600">Events Monthly</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-purple-600 mb-2 flex items-center justify-center">
                <Star size={28} />
              </div>
              <p className="text-2xl font-bold text-purple-800">4.9/5</p>
              <p className="text-sm text-gray-600">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-4 mt-12">
        {/* ===== TOP ACTION BUTTONS ===== */}
        <div className="flex justify-end items-center mb-6">
          {/* Filter dropdown */}
          <div className="relative" onMouseLeave={() => setShowSidebar(false)}>
            <button
              onMouseEnter={() => setShowSidebar(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300 flex items-center"
            >
              <span>Filter Events</span>
              {(selectedCategory !== "All Categories" || selectedDate) && (
                <span className="ml-2 bg-purple-800 text-white text-xs py-1 px-2 rounded-full">
                  Active
                </span>
              )}
            </button>
            {showSidebar && (
              <div
                onMouseEnter={() => setShowSidebar(true)}
                className="absolute top-full right-0 mt-1 bg-white shadow-xl p-6 w-80 z-10 rounded-md border border-purple-100"
              >
                <h3 className="text-xl font-bold mb-4 text-purple-700">
                  Filter Events
                </h3>
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
                        <option key={index} value={category}>
                          {category}
                        </option>
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

        {/* Location indicator */}
        {selectedCity && (
          <div className="mb-6 flex items-center">
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm inline-flex items-center">
              <MapPin size={14} className="mr-1" />
              {selectedCity}
              <button
                onClick={() => {
                  // Clear the selected city
                  useEventStore.setState({ selectedCity: null }); // Adjust this line based on your state management
                }}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Filter chips / active filters display */}
        {(selectedCategory !== "All Categories" ||
          selectedDate ||
          searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </div>
            )}
            {selectedCategory !== "All Categories" && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("All Categories")}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </div>
            )}
            {selectedDate && (
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                Date: {new Date(selectedDate).toLocaleDateString()}
                <button
                  onClick={() => setSelectedDate("")}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </div>
            )}
            {(selectedCategory !== "All Categories" ||
              selectedDate ||
              searchQuery) && (
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
          <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center">
            {selectedCity ? `Events in ${selectedCity}` : "Events"}
            {filteredEvents.length > 0 && (
              <span className="text-gray-500 text-base font-normal ml-2">
                ({filteredEvents.length}{" "}
                {filteredEvents.length === 1 ? "event" : "events"} found)
              </span>
            )}
          </h2>
          {isLoading && !displayedEvents.length && (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          {error && (
            <div className="text-center bg-red-50 text-red-600 py-4 rounded-md mb-6">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedEvents && displayedEvents.length > 0
              ? displayedEvents.map((event, index) => (
                  <div
                    key={event._id}
                    ref={
                      index === displayedEvents.length - 1
                        ? lastEventElementRef
                        : null
                    }
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    {/* Event Image with Overlay */}
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          event.eventImage ||
                          "https://via.placeholder.com/400x200"
                        }
                        alt={event.title || "Event Image"}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 m-2 rounded">
                        {event.category || "Event"}
                      </div>
                      {/* Date badge */}
                      {event.date && (
                        <div className="absolute bottom-0 left-0 bg-white  text-purple-700 px-3 py-1 m-2 rounded-tr-md flex items-center">
                          <Calendar
                            size={14}
                            className="mr-1 text-purple-700"
                          />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="text-xl font-semibold mb-2 text-purple-700 line-clamp-1">
                        {event.title || "No Title"}
                      </h3>

                      {/* Venue with icon */}
                      <div className="flex items-start mb-1">
                        <MapPin
                          size={16}
                          className="text-gray-500 mr-1 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {`${event.venueName || "Unknown Venue"}${
                            event.venueCity ? `, ${event.venueCity}` : ""
                          }`}
                        </p>
                      </div>

                      {/* Time with icon */}
                      {(event.startTime || event.endTime) && (
                        <div className="flex items-start mb-1">
                          <Clock
                            size={16}
                            className="text-gray-500 mr-1 flex-shrink-0 mt-0.5"
                          />
                          <p className="text-sm text-gray-600">
                            {event.startTime && formatTime(event.startTime)}
                            {event.startTime && event.endTime && " - "}
                            {event.endTime && formatTime(event.endTime)}
                          </p>
                        </div>
                      )}

                      {/* Artist with icon */}
                      {event.artist && (
                        <div className="flex items-start mb-1">
                          <Award
                            size={16}
                            className="text-gray-500 mr-1 flex-shrink-0 mt-0.5"
                          />
                          <p className="text-sm text-gray-600 line-clamp-1">
                            <span className="text-purple-600 font-medium">
                              {event.artist}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Trust badges */}
                      <div className="flex items-center mt-3 mb-3 text-xs text-gray-500 space-x-3">
                        <span className="flex items-center">
                          <CheckCircle
                            size={12}
                            className="mr-1 text-green-500"
                          />
                          Verified
                        </span>
                        <span className="flex items-center">
                          <CreditCard
                            size={12}
                            className="mr-1 text-blue-500"
                          />
                          Secure booking
                        </span>
                      </div>

                      {/* Conditional rendering for booking button */}
                      {isEventToday(event.date) ? (
                        <button
                          className="mt-2 w-full bg-gray-500 text-white px-4 py-2 rounded-md cursor-not-allowed"
                          disabled
                        >
                          Booking Closed
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/event/${event._id}`)}
                          className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center justify-center"
                        >
                          Book Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              : !isLoading && (
                  <div className="text-center col-span-full text-gray-500 py-12 bg-gray-50 rounded-lg">
                    <p className="text-xl mb-2">No events found.</p>
                    {(selectedCategory !== "All Categories" ||
                      selectedDate ||
                      searchQuery) && (
                      <p>Try adjusting your search or filter criteria.</p>
                    )}
                    {(selectedCategory !== "All Categories" ||
                      selectedDate ||
                      searchQuery) && (
                      <button
                        onClick={resetFilters}
                        className="mt-4 text-purple-600 hover:text-purple-800 underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
          </div>

          {/* Loading indicator for infinite scroll */}
          {isLoading && displayedEvents.length > 0 && (
            <div ref={loadingRef} className="text-center py-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            </div>
          )}

          {/* End of results indicator */}
          {!isLoading && !hasMore && displayedEvents.length > 0 && (
            <div className="text-center py-6 text-gray-500">
              No more events to load
            </div>
          )}
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section className="py-12 border-t border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-8 text-center">
            Why Book With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4 flex justify-center">
                <Shield size={40} />
              </div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2 text-center">
                100% Secure Payments
              </h3>
              <p className="text-gray-600 text-center">
                All transactions are processed through secure payment gateways
                with encryption.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4 flex justify-center">
                <Users size={40} />
              </div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2 text-center">
                Trusted by 10,000+ Customers
              </h3>
              <p className="text-gray-600 text-center">
                Join thousands of satisfied customers who book their events
                through our platform.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4 flex justify-center">
                <Star size={40} />
              </div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2 text-center">
                24/7 Customer Support
              </h3>
              <p className="text-gray-600 text-center">
                Our dedicated support team is available around the clock to
                assist with any questions.
              </p>
            </div>
          </div>
        </section>

        {/* ===== NEWSLETTER SECTION ===== */}
        {/* ===== BECOME AN EVENT ORGANIZER SECTION ===== */}
        <section className="py-12 border-t border-purple-100">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-900 rounded-2xl overflow-hidden">
              <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left side copy */}
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-4">
                    Become an Event Organizer
                  </h2>
                  <p className="text-indigo-100 mb-6">
                    Partner with us to reach thousands of potential attendees.
                    Our platform provides powerful tools to manage your events
                    and ticket sales efficiently.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      "List events for free",
                      "Reach a wider audience",
                      "Easy payment processing",
                      "Event analytics",
                    ].map((text, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle
                          size={20}
                          className="mr-2 text-green-400 flex-shrink-0 mt-1"
                        />
                        <span className="text-sm">{text}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/host/login">
                    <button className="bg-white text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-md font-semibold transition-all duration-300">
                      Get Started Now
                    </button>
                  </Link>
                </div>

                {/* Right side: steps instead of form */}
                <div className="text-white space-y-8">
                  <h3 className="text-2xl font-semibold mb-4">
                    How to Get Started
                  </h3>

                  <ol className="list-decimal list-inside space-y-4 text-indigo-100">
                    <li>
                      <strong>Register with Email Verification</strong>
                      <p className="mt-1 text-sm">
                        Sign up with your business email. We’ll send a
                        verification link—click it to confirm your account.
                      </p>
                    </li>
                    <li>
                      <strong>Upload Documents for Verification</strong>
                      <p className="mt-1 text-sm">
                        Provide necessary business or identity documents. Our
                        team will review and approve within 24–48 hours.
                      </p>
                    </li>
                    <li>
                      <strong>Subscribe to a Premium Plan</strong>
                      <p className="mt-1 text-sm">
                        Choose a plan that suits your needs. Unlock advanced
                        features like priority listing and detailed analytics.
                      </p>
                    </li>
                  </ol>

                  <p className="text-indigo-200 text-sm">
                    Once these steps are complete, you’ll be fully verified and
                    can start posting your events immediately!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
};

export default Home;
