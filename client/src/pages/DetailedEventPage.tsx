import React, { useEffect, useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import toast from "react-hot-toast";
import MapView from "../components/common/MapView";
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
  const { isAuthenticated } = useAuthStore();
  const { savedEvents, fetchSavedEvents, saveEvent, removeSavedEvent } = useUserStore();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabOption>("Description");
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [availableQuantities, setAvailableQuantities] = useState<Record<string, number>>({});
  const MAX_TICKETS = 5;

  // Pre‑fetch saved events on mount (or when auth changes)
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedEvents().catch(console.error);
    }
  }, [isAuthenticated, fetchSavedEvents]);

  // Fetch event details
  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const fetchedEvent = await fetchEventDetails(id);
        if (!fetchedEvent) {
          setError("Event not found.");
          toast.error("Event not found.");
          return;
        }
        setEvent(fetchedEvent);

        // Initialize ticket quantities
        if (Array.isArray(fetchedEvent.tickets)) {
          setSelectedTicketType(fetchedEvent.tickets[0].ticketType);
          const initQ: Record<string, number> = {};
          const availQ: Record<string, number> = {};
          fetchedEvent.tickets.forEach((t: any) => {
            initQ[t.ticketType] = 0;
            availQ[t.ticketType] = t.ticketCount;
          });
          setTicketQuantities(initQ);
          setAvailableQuantities(availQ);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load event details.");
        toast.error("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, fetchEventDetails]);

  // Derived liked state
  const isLiked = Boolean(
    event && savedEvents.some(se => se.event._id === event._id)
  );

  // Ticket quantity handlers
  const handleTicketQuantityChange = (ticketType: string, change: number) => {
    if (ticketType !== selectedTicketType) return;
    setTicketQuantities(prev => {
      const current = prev[ticketType] || 0;
      const avail = availableQuantities[ticketType] ?? 0;
      let next = Math.max(0, current + change);
      if (next > avail) {
        toast.error(`Only ${avail} tickets available`);
        next = avail;
      }
      if (next > MAX_TICKETS) {
        toast.error(`Max ${MAX_TICKETS} tickets per booking`);
        next = MAX_TICKETS;
      }
      return { ...prev, [ticketType]: next };
    });
  };

  const handleSelectTicketType = (ticketType: string) => {
    setSelectedTicketType(ticketType);
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const qty = ticketQuantities[selectedTicketType] || 0;
    const avail = availableQuantities[selectedTicketType] || 0;
    if (qty <= 0) {
      toast.error("Please select at least one ticket");
      return;
    }
    if (qty > avail) {
      toast.error(`Only ${avail} tickets available`);
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      return;
    }
    sessionStorage.setItem(
      "currentBooking",
      JSON.stringify({
        eventId: event._id,
        tickets: [{ ticketType: selectedTicketType, quantity: qty }],
        timestamp: new Date().toISOString(),
      })
    );
    toast.success("Proceeding to booking confirmation!");
    navigate(`/event/${event._id}/booking-confirmation`);
  };

  const handleSaveEvent = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save events");
      return;
    }
    if (!event) return;
    try {
      if (!isLiked) {
        await saveEvent(event._id);
        toast.success("Event saved to your wishlist");
      } else {
        await removeSavedEvent(event._id);
        toast.success("Event removed from your wishlist");
      }
      // No local setState needed; isLiked will update from store
    } catch (err) {
      console.error(err);
      toast.error("Failed to update wishlist");
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;
    const shareData = { title: event.title, text: event.description, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); }
      catch { toast.error("Error sharing event."); }
    } else {
      try { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }
      catch { toast.error("Failed to copy link."); }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-red-600 text-lg bg-white p-6 rounded-lg shadow-lg">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50">
        <div className="text-gray-600 text-lg bg-white p-6 rounded-lg shadow-lg">
          No event details available.
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return <div className="prose max-w-none"><p>{event.description}</p></div>;
      case "Artist":
        return <div><p>{event.artist || "No artist info."}</p></div>;
      case "Additional Details":
        return <div><p>{event.additionalDetails || "No additional details."}</p></div>;
      case "Event By":
        return (
          <div className="bg-white rounded-lg p-6">
            {event.hostId ? (
              <>
                <div><User /> {event.hostId.name}</div>
                <div><Mail /> {event.hostId.email}</div>
              </>
            ) : <p>Host info not available.</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Event Details */}
            <div className="lg:w-2/3 space-y-8">
              {/* Hero */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={event.eventImage}
                  alt={event.title}
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-sm p-6 flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEvent} className="p-2 rounded-full bg-white/20">
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </button>
                    <button onClick={handleShareEvent} className="p-2 rounded-full bg-white/20">
                      <Share2 className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[ 
                  {
                    icon: <Calendar className="h-6 w-6 text-purple-600" />,
                    label: "Date",
                    value: new Date(event.date).toLocaleDateString(undefined, {
                      weekday: "long", year: "numeric", month: "long", day: "numeric"
                    })
                  },
                  {
                    icon: <Clock className="h-6 w-6 text-purple-600" />,
                    label: "Time",
                    value: event.startTime && event.endTime
                      ? `${new Date(event.startTime).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})} - ${new Date(event.endTime).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`
                      : "Not specified"
                  },
                  {
                    icon: <MapPin className="h-6 w-6 text-purple-600" />,
                    label: "Venue",
                    value: event.venueName,
                    sub: `${event.venueCity}`
                  }
                ].map(({ icon, label, value, sub }, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl">{icon}</div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">{label}</p>
                        <p className="font-semibold text-gray-900">{value}</p>
                        {sub && <p className="text-sm text-gray-600">{sub}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="flex space-x-1 p-4 bg-gray-50">
                  {(["Description","Artist","Additional Details","Event By"] as TabOption[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-medium rounded-xl ${activeTab===tab ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-purple-50"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="p-6">{renderTabContent()}</div>
              </div>

              {/* Map */}
              {event.location && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><MapPin />Location</h2>
                  <MapView
                    lat={event.location.coordinates[1]}
                    lng={event.location.coordinates[0]}
                    locationName={event.venueName}
                  />
                </div>
              )}
            </div>

            {/* Right: Booking */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-2xl font-bold mb-2">Book Your Ticket</h2>
                <p className="text-sm text-gray-600 mb-6">Max {MAX_TICKETS} tickets</p>

                {Array.isArray(event.tickets) && event.tickets.length ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    {event.tickets.map((ticket: any) => {
                      const isSelected = ticket.ticketType === selectedTicketType;
                      const currentQty = ticketQuantities[ticket.ticketType] || 0;
                      const availQty = availableQuantities[ticket.ticketType] || 0;
                      const maxReached = currentQty >= Math.min(MAX_TICKETS, availQty);

                      return (
                        <div key={ticket.ticketType} className={`${isSelected ? "border-2 border-purple-500" : "border"} rounded-xl p-4`}>
                          <label className="flex justify-between items-center">
                            <div>
                              <input
                                type="radio"
                                name="ticketType"
                                checked={isSelected}
                                onChange={() => handleSelectTicketType(ticket.ticketType)}
                                className="mr-2"
                              />
                              {ticket.ticketType}
                            </div>
                            <span>₹{ticket.ticketPrice}</span>
                          </label>
                          <div className="flex items-center justify-end gap-3 mt-3">
                            <button
                              type="button"
                              onClick={() => handleTicketQuantityChange(ticket.ticketType, -1)}
                              disabled={!isSelected || currentQty <= 0}
                              className="px-2"
                            >-</button>
                            <span>{isSelected ? currentQty : 0}</span>
                            <button
                              type="button"
                              onClick={() => handleTicketQuantityChange(ticket.ticketType, 1)}
                              disabled={!isSelected || maxReached}
                              className="px-2"
                            >+</button>
                          </div>
                          {isSelected && availQty === 0 && <p className="text-red-500 mt-2">Sold out</p>}
                        </div>
                      );
                    })}

                    <Button label="Proceed to Booking" type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl" />
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700">Tickets not available.</p>
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
