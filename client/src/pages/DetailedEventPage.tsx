import React, { useEffect, useState, FormEvent, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import toast from "react-hot-toast";
import MapView from "../components/common/MapView";
import { useEventStore } from "../store/eventStore";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import { useChatStore } from "../store/chatStore";
import { useBookingStore } from "../store/bookingStore"; 
import { io } from "../config/SocketClient";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Info,
  User,
  Mail,
  Heart,
  Share2,
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Star,
} from "lucide-react";

type TabOption = "Description" | "Artist" | "Additional Details" | "Event By" | "Host Reviews";

const DetailedEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventDetails } = useEventStore();
  const { isAuthenticated, user } = useAuthStore();
  const { savedEvents, fetchSavedEvents, saveEvent, removeSavedEvent } = useUserStore();
  // Use the bookingStore for reviews
  const { reviews, fetchReviewsByHost } = useBookingStore();

  const { messages, isLoading: chatLoading, error: chatError, fetchMessages, sendMessage, setMessages } = useChatStore();

  const [showChat, setShowChat] = useState(false);
  const [minimizedChat, setMinimizedChat] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [event, setEvent] = useState<any>(null);
  const [hostReviews, setHostReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabOption>("Description");
  const [selectedTicketType, setSelectedTicketType] = useState("");
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [availableQuantities, setAvailableQuantities] = useState<Record<string, number>>({});
  const MAX_TICKETS = 5;

  useEffect(() => {
    if (isAuthenticated) fetchSavedEvents().catch(console.error);
  }, [isAuthenticated, fetchSavedEvents]);

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
        
        // If event has a host ID, fetch reviews for that host
        // Handle both string ID and object with _id property
        const hostId = typeof fetchedEvent.hostId === 'string' 
          ? fetchedEvent.hostId 
          : fetchedEvent.hostId?._id;
          console.log("hostid",hostId)
        if (hostId) {
          // Use the fetchReviewsByHost from our booking store instead
          fetchHostReviews(hostId);
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

  // Updated function to fetch host reviews using bookingStore
  const fetchHostReviews = async (hostId: string) => {
    setLoadingReviews(true);
    try {
      await fetchReviewsByHost(hostId);
      // No need to set hostReviews state, we'll use the reviews from the store
    } catch (err) {
      console.error("Failed to fetch host reviews:", err);
      // We don't set error state or show toast here to avoid disrupting the main page experience
    } finally {
      setLoadingReviews(false);
    }
  };

  // Scroll to bottom of messages when new messages arrive or chat opens
  useEffect(() => {
    if (showChat && !minimizedChat) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChat, minimizedChat]);

  // ADDED: Real-time chat socket handler
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !event?.hostId?._id || !event?._id) return;
    
    console.log('Setting up socket handler for chat in DetailedEventPage');
    
    // Join user's room to receive messages
    io.emit('joinUserRoom', user.id);
    
    const handleNewMessage = (msg: any) => {
      console.log('Received message via socket in DetailedEventPage:', msg);
      
      // Check if this message belongs to the current conversation
      if (
        msg.eventId === event._id && 
        ((msg.senderId === user.id && msg.receiverId === event.hostId._id) ||
         (msg.senderId === event.hostId._id && msg.receiverId === user.id))
      ) {
        console.log('Adding message to current chat window');
        // Update messages state directly
        setMessages((prevMessages: any[]) => [...prevMessages, msg]);
      }
    };
    
    io.on('receiveMessage', handleNewMessage);
    
    return () => {
      console.log('Removing socket event listener in DetailedEventPage');
      io.off('receiveMessage', handleNewMessage);
    };
  }, [isAuthenticated, user?.id, event?.hostId?._id, event?._id, setMessages]);

  const isLiked = Boolean(event && savedEvents.some(se => se.event?._id === event._id));

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

  const handleSelectTicketType = (ticketType: string) => setSelectedTicketType(ticketType);

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const qty = ticketQuantities[selectedTicketType] || 0;
    const avail = availableQuantities[selectedTicketType] || 0;
    if (qty <= 0) return toast.error("Please select at least one ticket");
    if (qty > avail) return toast.error(`Only ${avail} tickets available`);
    if (!isAuthenticated) return toast.error("Please login to continue");

    sessionStorage.setItem(
      "currentBooking",
      JSON.stringify({ eventId: event._id, tickets: [{ ticketType: selectedTicketType, quantity: qty }], timestamp: new Date().toISOString() })
    );
    toast.success("Proceeding to booking confirmation!");
    navigate(`/event/${event._id}/booking-confirmation`);
  };

  const handleSaveEvent = async () => {
    if (!isAuthenticated) return toast.error("Please login to save events");
    if (!event) return;
    try {
      if (!isLiked) {
        await saveEvent(event._id);
        toast.success("Event saved to your wishlist");
      } else {
        await removeSavedEvent(event._id);
        toast.success("Event removed from your wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;
    const shareData = { title: event.title, text: event.description, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { toast.error("Error sharing event."); }
    } else {
      try { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); } catch { toast.error("Failed to copy link."); }
    }
  };

  const handleChatWithHost = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to chat with the host");
      return;
    }
    if (!event?.hostId?._id) {
      toast.error("Host information not available");
      return;
    }
    setShowChat(true);
    setMinimizedChat(false);
    await fetchMessages(event.hostId._id, event._id);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      await sendMessage(event.hostId._id, event._id, newMsg.trim());
      setNewMsg("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setMinimizedChat(false);
  };

  const handleToggleChatSize = () => {
    setMinimizedChat(!minimizedChat);
  };

  // Calculate average rating from reviews
  const averageRating = reviews && reviews.length 
    ? (reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50"><Spinner /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50"><div className="text-red-600 text-lg bg-white p-6 rounded-lg shadow-lg">{error}</div></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50"><div className="text-gray-600 text-lg bg-white p-6 rounded-lg shadow-lg">No event details available.</div></div>;

  const eventDate = new Date(event.date);
  const now = new Date();
  const isPast = eventDate < now;

  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
      />
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description": return <div className="prose max-w-none"><p>{event.description}</p></div>;
      case "Artist": return <div><p>{event.artist || "No artist info."}</p></div>;
      case "Additional Details": return <div><p>{event.additionalDetails || "No additional details."}</p></div>;
      case "Event By": return (
        <div className="bg-white rounded-lg">
          {event.hostId ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" /> 
                <span>{typeof event.hostId === 'string' ? 'Host' : event.hostId.name}</span>
              </div>
              {typeof event.hostId !== 'string' && event.hostId.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-600" /> 
                  <span>{event.hostId.email}</span>
                </div>
              )}
              {averageRating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">{renderStars(Number(averageRating))}</div>
                  <span className="text-sm font-medium">{averageRating}/5</span> 
                  <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                </div>
              )}
            </div>
          ) : (
            <p>Host info not available.</p>
          )}
        </div>
      );
      case "Host Reviews": return (
        <div className="space-y-6">
          {loadingReviews ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium mb-1">{review.user?.name || "Anonymous"}</div>
                    <div className="flex mb-2">{renderStars(review.rating)}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-700">{review.review}</p>
                {/* Display the event title for each review */}
                <div className="mt-2 text-sm text-gray-500">
                  Event: {review.eventTitle || "Unknown Event"}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No reviews yet for this host.</p>
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-8">
              {/* Hero & Actions */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={event.eventImage} alt={event.title} className="w-full h-[300px] object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-sm p-6 flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                  <div className="flex gap-2">
                    <button onClick={handleChatWithHost} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors" title="Chat with host">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </button>
                    <button onClick={handleSaveEvent} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors" title={isLiked ? "Remove from wishlist" : "Add to wishlist"}>
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </button>
                    <button onClick={handleShareEvent} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors" title="Share event">
                      <Share2 className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Host Info Card with Rating */}
              {event.hostId && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Hosted by {typeof event.hostId === 'string' ? 'Host' : event.hostId.name}</h3>
                      {averageRating && (
                        <div className="flex items-center gap-1">
                          <div className="flex">{renderStars(Number(averageRating))}</div>
                          <span className="text-sm">{averageRating}</span>
                          <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                <div className="flex flex-wrap p-4 bg-gray-50">
                  {(["Description", "Artist", "Additional Details", "Event By", "Host Reviews"] as TabOption[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium rounded-xl mr-1 mb-1 ${activeTab===tab ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-purple-50"}`}
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

            {/* Right: Booking or Past */}
            <div className="lg:w-1/3">
              {isPast ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Event Over</h2>
                  <p className="text-gray-600">This event took place on {eventDate.toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' })}.</p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-Right Chat Window */}
      {showChat && (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col ${
          minimizedChat ? 'w-64 h-12' : 'w-80 h-96 max-h-[70vh]'
        } bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out`}>
          {/* Chat Header */}
          <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2 overflow-hidden">
              <User className="h-4 w-4 flex-shrink-0" />
              <div className="overflow-hidden">
                <h3 className="font-medium text-sm truncate">{event?.hostId?.name || "Event Host"}</h3>
                {!minimizedChat && <p className="text-xs text-purple-200 truncate">{event?.title}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleToggleChatSize} className="p-1 hover:bg-purple-700 rounded-full">
                {minimizedChat ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </button>
              <button onClick={handleCloseChat} className="p-1 hover:bg-purple-700 rounded-full">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          {/* Messages Area - Hidden when minimized */}
          {!minimizedChat && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner />
                </div>
              ) : chatError ? (
                <div className="text-center text-red-500 p-2 text-sm">
                  Failed to load messages.
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 p-2 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg: any) => {
                  const isCurrentUser = msg.senderType === user?.role && msg.senderId === user?.id;
                  return (
                    <div 
                      key={msg._id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          isCurrentUser 
                            ? 'bg-purple-600 text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-purple-200' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messageEndRef} />
            </div>
          )}
          
          {/* Message Input - Hidden when minimized */}
          {!minimizedChat && (
            <form onSubmit={handleSendMessage} className="border-t p-2 flex gap-1">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button 
                type="submit" 
                disabled={!newMsg.trim()}
                className="bg-purple-600 text-white p-1 rounded-md disabled:bg-purple-300"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </UserLayout>
  );
};

export default DetailedEventPage;