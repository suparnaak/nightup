import React, { useEffect, useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import toast from "react-hot-toast";
import { useEventStore } from "../store/eventStore";
import { useAuthStore } from "../store/authStore"; 
import { useUserStore } from "../store/userStore";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Info,
  Music,
  FileText,
  User,
  Mail,
  Heart,
  Share2,
} from "lucide-react";

type TabOption = "Description" | "Artist" | "Additional Details" | "Event By";

const DetailedEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventDetails } = useEventStore();
  const { saveEvent, removeSavedEvent, fetchSavedEvents } = useUserStore();
  const { isAuthenticated } = useAuthStore(); 

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabOption>("Description");
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [ticketQuantities, setTicketQuantities] = useState<any>({});
  const [isLiked, setIsLiked] = useState(false);
  const MAX_TICKETS = 5;

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isAuthenticated && event) {
        try {
          const savedEvents = await fetchSavedEvents();
          console.log("Saved events from DB:", savedEvents);
          console.log("Current event:", event);
          
          const isEventSaved = savedEvents.some((savedEvent: any) => {
            return savedEvent.event === event._id;
          });
          
          console.log("Is event saved:", isEventSaved);
          setIsLiked(isEventSaved);
        } catch (err) {
          console.error("Failed to fetch saved events:", err);
        }
      }
    };
    
    checkSavedStatus();
  }, [isAuthenticated, event, fetchSavedEvents]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedEvents().catch(err => {
        console.error("Failed to fetch saved events on mount:", err);
      });
    }
  }, [isAuthenticated, fetchSavedEvents]);
  

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const fetchedEvent = await fetchEventDetails(id!);
        console.log(fetchedEvent);
        if (!fetchedEvent) {
          setError("Event not found.");
          toast.error("Event not found.");
          return;
        }
        setEvent(fetchedEvent);
        if (fetchedEvent.tickets && fetchedEvent.tickets.length > 0) {
          setSelectedTicketType(fetchedEvent.tickets[0].ticketType);
          const initialQuantities: Record<string, number> = {};
          fetchedEvent.tickets.forEach((ticket: any) => {
            initialQuantities[ticket.ticketType] = 0;
          });
          setTicketQuantities(initialQuantities);
        }
      } catch (err: any) {
        setError("Failed to load event details.");
        toast.error("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchEvent();
    }
  }, [id, fetchEventDetails]);


  const handleTicketQuantityChange = (ticketType: string, change: number) => {
    if (ticketType === selectedTicketType) {
      setTicketQuantities((prevState: any) => {
        const currentQuantity = prevState[ticketType] || 0;
        let newQuantity = currentQuantity + change;
        newQuantity = Math.max(0, newQuantity);
        newQuantity = Math.min(MAX_TICKETS, newQuantity);

        if (currentQuantity === MAX_TICKETS && change > 0) {
          toast.error(`Maximum ${MAX_TICKETS} tickets allowed per booking`);
        }

        return {
          ...prevState,
          [ticketType]: newQuantity,
        };
      });
    }
  };

  const handleSelectTicketType = (ticketType: string) => {
    setSelectedTicketType(ticketType);
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const quantity = ticketQuantities[selectedTicketType] || 0;

    if (quantity <= 0) {
      toast.error("Please select at least one ticket");
      return;
    }

    const bookingData = {
      eventId: event._id,
      tickets: [
        {
          ticketType: selectedTicketType,
          quantity: quantity,
        },
      ],
    };

    console.log("Booking Data:", bookingData);
    toast.success("Proceeding to booking confirmation!");
    navigate(`/event/${event._id}/booking-confirmation`);
  };

  // Save Event Functionality
  const handleSaveEvent = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save events for later");
      return;
    }
    
    if (!event) return;
    
    const eventIdToUse = event._id || event.eventId || event.id;
    
    try {
      if (!isLiked) {
        await saveEvent(eventIdToUse);
        setIsLiked(true);
        toast.success("Event saved to your wishlist");
      } else {
        await removeSavedEvent(eventIdToUse);
        setIsLiked(false);
        toast.success("Event removed from your wishlist");
      }
    } catch (error) {
      console.error("Error handling save event:", error);
      toast.error("Failed to update your wishlist");
    }
  };
  //share event 
  const handleShareEvent = async () => {
    if (!event) return;
  
    const shareData = {
      title: event.title,
      text: event.description,
      url: window.location.href,
    };
  
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        //toast.success("Event shared successfully!");
      } catch (error) {
        console.error("Error sharing event:", error);
        toast.error("Error sharing the event.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying link:", error);
        toast.error("Failed to copy the link.");
      }
    }
  };
  
  
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-red-600 text-lg bg-white p-6 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50">
        <div className="text-gray-600 text-lg bg-white p-6 rounded-lg shadow-lg">
          No event details available.
        </div>
      </div>
    );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>
        );
      case "Artist":
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {event.artist || "No artist information provided."}
            </p>
          </div>
        );
      case "Additional Details":
        return (
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {event.additionalDetails || "No additional details provided."}
            </p>
          </div>
        );
      case "Event By":
        return (
          <div className="bg-white rounded-lg p-6">
            {event.hostId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-600" />
                  <p className="text-gray-700">
                    <span className="font-medium text-gray-900">Name:</span>{" "}
                    {event.hostId.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <p className="text-gray-700">
                    <span className="font-medium text-gray-900">Email:</span>{" "}
                    {event.hostId.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">Host information not available.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side: Event Details with Image */}
            <div className="lg:w-2/3 space-y-8">
              {/* Hero Section - Now inside the left column with reduced height */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
                <img
                  src={
                    event.eventImage ||
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"
                  }
                  alt={event.title}
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 z-20">
                  <div className="bg-black/40 backdrop-blur-sm p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                          {event.title}
                        </h1>
                        {event.hostName && (
                          <p className="text-white/90 flex items-center gap-2 text-sm sm:text-base">
                            <User className="h-4 w-4" />
                            Hosted by {event.hostName}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEvent}
                          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              isLiked
                                ? "fill-red-500 text-red-500"
                                : "text-white"
                            }`}
                          />
                        </button>
                        <button onClick={handleShareEvent} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all">
                          <Share2 className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg shadow-purple-100 border border-purple-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Date
                      </p>
                      <p className="font-semibold text-gray-900">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg shadow-purple-100 border border-purple-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Time
                      </p>
                      <p className="font-semibold text-gray-900">
                        {event.startTime && event.endTime
                          ? `${new Date(event.startTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )} - ${new Date(event.endTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}`
                          : "Time not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg shadow-purple-100 border border-purple-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Venue
                      </p>
                      <p className="font-semibold text-gray-900">
                        {event.venueName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event.venueCity}, {event.venueState}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 overflow-hidden">
                <div className="flex space-x-1 p-4 bg-gray-50">
                  {(
                    [
                      "Description",
                      "Artist",
                      "Additional Details",
                      "Event By",
                    ] as TabOption[]
                  ).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200
                        ${
                          activeTab === tab
                            ? "bg-purple-600 text-white shadow-md"
                            : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {tab === "Description" && (
                          <FileText className="h-4 w-4" />
                        )}
                        {tab === "Artist" && <Music className="h-4 w-4" />}
                        {tab === "Additional Details" && (
                          <Info className="h-4 w-4" />
                        )}
                        {tab === "Event By" && <User className="h-4 w-4" />}
                        {tab}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-6">{renderTabContent()}</div>
              </div>
            </div>

            {/* Right Side: Booking Form */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Book Your Ticket
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Maximum {MAX_TICKETS} tickets per booking
                </p>

                {event.tickets && event.tickets.length > 0 ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="space-y-4">
                      {event.tickets.map((ticket: any) => {
                        const isSelected =
                          selectedTicketType === ticket.ticketType;
                        const currentQuantity =
                          ticketQuantities[ticket.ticketType] || 0;
                        const isMaxReached = currentQuantity >= MAX_TICKETS;

                        return (
                          <div
                            key={ticket.ticketType}
                            className={`relative rounded-xl transition-all duration-300 ${
                              isSelected
                                ? "bg-purple-50 border-2 border-purple-500 shadow-lg"
                                : "bg-gray-50 border border-gray-200 hover:border-purple-200"
                            }`}
                          >
                            <label className="p-4 block cursor-pointer">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    id={ticket.ticketType}
                                    name="ticketType"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleSelectTicketType(ticket.ticketType)
                                    }
                                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                  />
                                  <span className="font-medium text-gray-900">
                                    {ticket.ticketType}
                                  </span>
                                </div>
                                <span className="text-lg font-bold text-purple-700">
                                  ₹{ticket.ticketPrice}
                                </span>
                              </div>

                              <div className="flex items-center justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTicketQuantityChange(
                                      ticket.ticketType,
                                      -1
                                    )
                                  }
                                  disabled={!isSelected || currentQuantity <= 0}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    isSelected && currentQuantity > 0
                                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  -
                                </button>
                                <span
                                  className={`w-8 text-center font-medium ${
                                    isSelected
                                      ? "text-gray-900"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {isSelected ? currentQuantity : 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTicketQuantityChange(
                                      ticket.ticketType,
                                      1
                                    )
                                  }
                                  disabled={!isSelected || isMaxReached}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    isSelected && !isMaxReached
                                      ? "bg-purple-600 text-white hover:bg-purple-700"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      label="Proceed to Booking"
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-medium shadow-lg transition-all duration-200"
                    />
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">
                      Tickets are not available for this event.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default DetailedEventPage;