import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HostLayout from "../../layouts/HostLayout";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { useEventStore } from "../../store/eventStore";

const HostDetailedEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventDetails } = useEventStore();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isPast = event ? new Date(event.date) < new Date() : false;

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
    if (id) fetchEvent();
  }, [id, fetchEventDetails]);

  const handleCancelEvent = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason.");
      return;
    }
    try {
      await useEventStore.getState().deleteEvent(id!, cancellationReason);
      toast.success("Event cancelled successfully.");
      setShowCancelModal(false);
      navigate("/host/events");
    } catch {
      toast.error("Failed to cancel the event.");
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
          <h1 className="text-3xl font-bold text-purple-700">
            {event.title}
          </h1>

          {/* Date and Time */}
          <div className="mt-4 bg-purple-50 p-4 rounded-md border border-purple-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                {/* calendar icon omitted for brevity */}
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
                {/* clock icon omitted for brevity */}
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
              {/* location icon omitted */}
              <div>
                <p className="font-semibold text-gray-900">Venue:</p>
                <p>{event.venueName}</p>
                <p>
                  {event.venueCity}, {event.venueState} {event.venueZip}
                </p>
                <p className="mt-2">
                  <strong>Venue Capacity:</strong> {event.venueCapacity}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          {event.tickets?.length > 0 && (
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
              <p className="mt-2 text-gray-700">
                {event.additionalDetails}
              </p>
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

          {/* Edit and Cancel Options — only if not in the past */}
          {!isPast && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={() =>
                  navigate(`/host/events/edit/${event._id}`)
                }
                className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
              >
                Edit
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-white border border-red-500 text-red-500 py-2 px-4 rounded-md hover:bg-red-50"
              >
                Cancel Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Cancel Event
            </h2>
            <p className="mb-2 text-gray-700">
              Please provide a reason for cancellation:
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) =>
                setCancellationReason(e.target.value)
              }
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-300"
              rows={4}
              placeholder="Write your reason here..."
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleCancelEvent}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </HostLayout>
  );
};

export default HostDetailedEventPage;
