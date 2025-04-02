import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HostLayout from "../../layouts/HostLayout";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { useEventStore } from "../../store/eventStore";

const HostDetailedEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventDetails, deleteEvent } = useEventStore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const fetchedEvent = await fetchEventDetails(id!);
        if (!fetchedEvent) {
          setError("Event not found.");
          toast.error("Event not found.");
          return;
        }
        setEvent(fetchedEvent);
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

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      await deleteEvent(id!);
      toast.success("Event deleted successfully!");
      navigate("/host/events");
    } catch (err) {
      toast.error("Failed to delete event.");
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!event) return <p>No event details available.</p>;

  return (
    <HostLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col gap-8">
          {/* Event Image & Title */}
          <img
            src={event.eventImage || "https://via.placeholder.com/600x300"}
            alt={event.title}
            className="w-full h-64 object-cover rounded-md shadow-md"
          />
          <h1 className="text-3xl font-bold text-purple-700">{event.title}</h1>

          {/* Date and Time */}
          <div className="mt-4 bg-purple-50 p-4 rounded-md border border-purple-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-semibold text-purple-800">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold text-purple-800">
                  {event.startTime && event.endTime
                    ? `${new Date(event.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - ${new Date(event.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Time not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Venue Information */}
          <div className="mt-4 text-gray-800">
            <div className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mt-1 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <p className="font-semibold text-gray-900">Venue:</p>
                <p>{event.venueName}</p>
                <p>
                  {event.venueCity}, {event.venueState} {event.venueZip}
                </p>
                {event.detailedVenue && <p>{event.detailedVenue}</p>}
                <p className="mt-2">
                  <strong>Venue Capacity:</strong> {event.venueCapacity}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          {event.tickets && event.tickets.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-purple-700">
                Ticket Information
              </h2>
              <div className="mt-2">
                {event.tickets.map((ticket: any) => (
                  <div
                    key={ticket._id}
                    className="border p-3 rounded-md mb-2"
                  >
                    <p className="font-semibold">
                      Ticket Type: {ticket.ticketType}
                    </p>
                    <p>Price: ₹{ticket.ticketPrice}</p>
                    <p>Available Quantity: {ticket.ticketCount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {event.additionalDetails && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-purple-700">
                Additional Information
              </h2>
              <p className="mt-2 text-gray-700">{event.additionalDetails}</p>
            </div>
          )}

          {/* Event Description */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-purple-700">
              Event Description
            </h2>
            <p className="mt-2 text-gray-700">{event.description}</p>
          </div>

          {/* Host Information */}
          {event.hostName && (
            <div className="mt-4">
              <p className="text-gray-800">
                <strong>Host:</strong> {event.hostName}
              </p>
            </div>
          )}

          {/* Edit and Delete Options */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate(`/host/events/edit/${event._id}`)}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-white border border-purple-600 text-purple-600 py-2 px-4 rounded-md hover:bg-purple-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default HostDetailedEventPage;
