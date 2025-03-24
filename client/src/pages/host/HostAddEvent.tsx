import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import HostLayout from "../../layouts/HostLayout";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import { useEventStore } from "../../store/eventStore";

const HostAddEvent: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [venueState, setVenueState] = useState("");
  const [venueZip, setVenueZip] = useState("");
  const [venueCapacity, setVenueCapacity] = useState<number>(0);
  const [category, setCategory] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState([
    { ticketType: "", ticketPrice: 0, ticketCount: 0 },
  ]);
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(
    null
  );
  const [additionalDetails, setAdditionalDetails] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEventImageFile(file);
      setEventImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTicketChange = (
    index: number,
    field: "ticketType" | "ticketPrice" | "ticketCount",
    value: string | number
  ) => {
    const newTickets = [...tickets];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setTickets(newTickets);
  };

  const addTicketField = () => {
    setTickets([
      ...tickets,
      { ticketType: "", ticketPrice: 0, ticketCount: 0 },
    ]);
  };

  const removeTicketField = (index: number) => {
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let eventImageUrl = "";
      if (eventImageFile) {
        eventImageUrl = await uploadImageToCloudinary(eventImageFile);
      }

      const eventData = {
        title,
        startTime,
        endTime,
        date,
        venueName,
        venueCity,
        venueState,
        venueZip,
        venueCapacity,
        category,
        artist,
        description,
        tickets,
        eventImage: eventImageUrl,
        additionalDetails,
        isBlocked: false,
      };

      await addEvent(eventData);
      navigate("/host/events");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/host/events");
  };

  return (
    <HostLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-6">Add New Event</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          {/* Date and Times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>
          {/* Venue Details */}
          <div>
            <label className="block text-gray-700">Venue Name</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">State</label>
              <input
                type="text"
                value={venueState}
                onChange={(e) => setVenueState(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Zip</label>
              <input
                type="text"
                value={venueZip}
                onChange={(e) => setVenueZip(e.target.value)}
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Venue Capacity</label>
            <input
              type="number"
              value={venueCapacity}
              onChange={(e) => setVenueCapacity(Number(e.target.value))}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          {/* Category, Artist, Description */}
          <div>
            <label className="block text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Select a category</option>
              <option value="Music">Music</option>
              <option value="DJ">DJ</option>
              <option value="Tech">Tech</option>
              <option value="Workshops">Workshops</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Artist</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            ></textarea>
          </div>
          {/* Tickets */}
          <div>
            <label className="block text-gray-700 mb-2">Tickets</label>
            {tickets.map((ticket, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 items-end"
              >
                <div className="md:col-span-2">
                  <label className="block text-gray-600 text-sm mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    placeholder="Ticket Type"
                    value={ticket.ticketType}
                    onChange={(e) =>
                      handleTicketChange(index, "ticketType", e.target.value)
                    }
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={ticket.ticketPrice}
                    onChange={(e) =>
                      handleTicketChange(
                        index,
                        "ticketPrice",
                        Number(e.target.value)
                      )
                    }
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Count
                  </label>
                  <input
                    type="number"
                    placeholder="Count"
                    value={ticket.ticketCount}
                    onChange={(e) =>
                      handleTicketChange(
                        index,
                        "ticketCount",
                        Number(e.target.value)
                      )
                    }
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  {tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketField(index)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTicketField}
              className="text-purple-600 hover:underline text-sm"
            >
              Add Another Ticket Type
            </button>
          </div>
          {/* Event Image Upload */}
          <div>
            <label className="block text-gray-700">Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
            {eventImagePreview && (
              <div className="mt-2">
                <img
                  src={eventImagePreview}
                  alt="Preview"
                  className="w-48 h-auto rounded"
                />
              </div>
            )}
          </div>
          {/* Additional Details */}
          <div>
            <label className="block text-gray-700">Additional Details</label>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            ></textarea>
          </div>
          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </HostLayout>
  );
};

export default HostAddEvent;
