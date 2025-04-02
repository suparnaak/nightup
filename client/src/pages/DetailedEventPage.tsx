import React, { useEffect, useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import toast from "react-hot-toast";
import { useEventStore } from "../store/eventStore";

type TabOption = "Description" | "Artist" | "Additional Details" | "Event By";

const DetailedEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventDetails } = useEventStore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<TabOption>("Description");

  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [ticketQuantities, setTicketQuantities] = useState<any>({});
  
  const MAX_TICKETS = 5;

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const fetchedEvent = await fetchEventDetails(id!);
        console.log(fetchedEvent)
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

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const quantity = ticketQuantities[selectedTicketType] || 0;
    
    if (quantity <= 0) {
      toast.error("Please select at least one ticket");
      return;
    }
    
    const bookingData = {
      eventId: event._id,
      tickets: [{
        ticketType: selectedTicketType,
        quantity: quantity,
      }],
    };
    
    console.log("Booking Data:", bookingData);
    toast.success("Proceeding to booking confirmation!");
    navigate(`/event/${event._id}/booking-confirmation`);
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!event) return <p>No event details available.</p>;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return <p className="text-gray-700">{event.description}</p>;
      case "Artist":
        return <p className="text-gray-700">{event.artist || "No artist information provided."}</p>;
      case "Additional Details":
        return <p className="text-gray-700">{event.additionalDetails || "No additional details provided."}</p>;
      case "Event By":
        return (
          <div className="text-gray-700">
            {event.hostId ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p><span className="font-semibold">Name:</span> {event.hostId.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p><span className="font-semibold">Email:</span> {event.hostId.email}</p>
                </div>
              </div>
            ) : (
              <p>Host information not available.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

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

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Event Details */}
          <div className="md:w-2/3">
            <img
              src={event.eventImage || "https://via.placeholder.com/600x300"}
              alt={event.title}
              className="w-full h-64 object-cover rounded-md shadow-md"
            />
            
            {/* Event title as heading */}
            <h1 className="text-3xl font-bold mt-6 text-purple-700">{event.title}</h1>
            
            {/* More visible date and time */}
            <div className="mt-4 bg-purple-50 p-4 rounded-md border border-purple-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-purple-800">
                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-purple-800">
                    {event.startTime && event.endTime
                      ? `${new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(
                          event.endTime
                        ).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                      : "Time not specified"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Venue information */}
            <div className="mt-4 text-gray-800">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Venue:</p>
                  <p>{event.venueName}</p>
                  <p>{event.venueCity}, {event.venueState} {event.venueZip}</p>
                  <p>{event.detailedVenue || ""}</p>
                </div>
              </div>
            </div>
            
            {/* Tabbed content - added Event By tab */}
            <div className="mt-6">
              <div className="border-b flex flex-wrap">
                {(["Description", "Artist", "Additional Details", "Event By"] as TabOption[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-4 focus:outline-none ${
                      activeTab === tab ? "border-b-2 border-purple-700 text-purple-700" : "text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-4">{renderTabContent()}</div>
            </div>
            
            {/* Host Name below the detailed description */}
            {event.hostName && (
              <p className="mt-4 text-gray-800">
                <strong>Host:</strong> {event.hostName}
              </p>
            )}
          </div>

          {/* Right Side: Booking Form */}
          <div className="md:w-1/3 bg-gray-100 p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-purple-700">Book Your Ticket</h2>
            <p className="text-sm text-gray-600 mb-4">Maximum {MAX_TICKETS} tickets per booking</p>
            
            {event.tickets && event.tickets.length > 0 ? (
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Radio button selection for ticket types */}
                <div className="space-y-3">
                  {event.tickets.map((ticket: any) => {
                    const isSelected = selectedTicketType === ticket.ticketType;
                    const currentQuantity = ticketQuantities[ticket.ticketType] || 0;
                    const isMaxReached = currentQuantity >= MAX_TICKETS;
                    
                    return (
                      <div 
                        key={ticket.ticketType} 
                        className={`border rounded-md p-3 bg-white ${isSelected ? 'border-purple-500' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={ticket.ticketType}
                              name="ticketType"
                              checked={isSelected}
                              onChange={() => handleSelectTicketType(ticket.ticketType)}
                              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <label htmlFor={ticket.ticketType} className="ml-2 text-lg font-medium text-gray-900">
                              {ticket.ticketType}
                            </label>
                          </div>
                          <span className="font-bold text-purple-700">₹{ticket.ticketPrice}</span>
                        </div>
                        
                        {/* Quantity selector with - and + buttons */}
                        <div className="flex items-center justify-end mt-2">
                          <button 
                            type="button"
                            onClick={() => handleTicketQuantityChange(ticket.ticketType, -1)}
                            disabled={!isSelected || currentQuantity <= 0}
                            className={`w-8 h-8 flex items-center justify-center rounded-full 
                              ${isSelected && currentQuantity > 0
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          >
                            -
                          </button>
                          <span className={`mx-3 w-8 text-center ${!isSelected && 'text-gray-400'}`}>
                            {isSelected ? currentQuantity : 0}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleTicketQuantityChange(ticket.ticketType, 1)}
                            disabled={!isSelected || isMaxReached}
                            className={`w-8 h-8 flex items-center justify-center rounded-full 
                              ${isSelected && !isMaxReached
                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Button 
                  label="Proceed" 
                  type="submit" 
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-md" 
                />
              </form>
            ) : (
              <p className="text-gray-700">Tickets are not available for this event.</p>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default DetailedEventPage;