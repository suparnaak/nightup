import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HostLayout from "../../layouts/HostLayout";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import { useEventStore } from "../../store/eventStore";
import { validateEventForm } from "../../utils/eventValidation";
import { useCategoryStore } from "../../store/categoryStore";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

const HostAddEvent: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useEventStore();
  const { categories, getHostCategories } = useCategoryStore();
  const { user } = useAuthStore();
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
  const [categoryId, setCategoryId] = useState<string>("");
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

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string | null;
  }>({});

  useEffect(() => {
    getHostCategories().catch((err) => {
      console.error("Failed to load categories:", err);
      toast.error("Could not load categories");
    });
  }, [getHostCategories]);

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

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

  const validateForm = (): boolean => {
    const errors = validateEventForm(
      title,
      date,
      startTime,
      endTime,
      venueName,
      venueCity,
      venueState,
      venueZip,
      venueCapacity,
      categoryId,
      artist,
      description,
      tickets
    );
    setFormErrors(errors);
    return !Object.values(errors).some((err) => err !== null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    if (!user) {
      toast.error("You must be logged in to create an event");
      return;
    }
    setLoading(true);
    try {
      let eventImageUrl = "";
      if (eventImageFile) {
        eventImageUrl = await uploadImageToCloudinary(eventImageFile);
      }
      const selectedCat = categories.find((c) => c.id === categoryId);
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
        categoryId,
        category: selectedCat?.name || "",
        artist,
        description,
        tickets,
        eventImage: eventImageUrl,
        additionalDetails,
        isBlocked: false,
        hostId: user.id,
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
              /* required */
              className="w-full border border-gray-300 p-2 rounded"
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
            )}
          </div>
          {/* Date and Times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getTodayDate()}
                /* required */
                className="w-full border border-gray-300 p-2 rounded"
              />
              {formErrors.date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                /* required */
                className="w-full border border-gray-300 p-2 rounded"
              />
              {formErrors.startTime && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.startTime}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                /* required */
                className="w-full border border-gray-300 p-2 rounded"
              />
              {formErrors.endTime && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.endTime}
                </p>
              )}
            </div>
          </div>
          {/* Venue Details */}
          <div>
            <label className="block text-gray-700">Venue Name</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              /* required */
              className="w-full border border-gray-300 p-2 rounded"
            />
            {formErrors.venueName && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.venueName}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                /* required */
                className="w-full border border-gray-300 p-2 rounded"
              />
              {formErrors.venueCity && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.venueCity}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700">State</label>
              <input
                type="text"
                value={venueState}
                onChange={(e) => setVenueState(e.target.value)}
                /* required */
                className="w-full border border-gray-300 p-2 rounded"
              />
              {formErrors.venueState && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.venueState}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700">Zip</label>
              <input
                type="text"
                value={venueZip}
                onChange={(e) => setVenueZip(e.target.value)}
                /* required */
                className="w-full border border-gray-300 p-2 rounded"
              />
              {formErrors.venueZip && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.venueZip}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Total Tickets</label>
            <input
              type="number"
              value={venueCapacity}
              onChange={(e) => setVenueCapacity(Number(e.target.value))}
              /* required */
              className="w-full border border-gray-300 p-2 rounded"
            />
            {formErrors.venueCapacity && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.venueCapacity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                // Remove the setCategoryName calls
              }}
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {formErrors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.categoryId}
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Artist</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              /* required */
              className="w-full border border-gray-300 p-2 rounded"
            />
            {formErrors.artist && (
              <p className="text-red-500 text-sm mt-1">{formErrors.artist}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              /* required */
              className="w-full border border-gray-300 p-2 rounded"
            ></textarea>
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.description}
              </p>
            )}
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
                    /* required */
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
                    /* required */
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
                    /* required */
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
            {formErrors.tickets && (
              <p className="text-red-500 text-sm mt-1">{formErrors.tickets}</p>
            )}
          </div>
          {/* Event Image Upload */}

          <div>
            <label className="block text-gray-700 mb-2">Event Image</label>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <label
                  htmlFor="event-image-upload"
                  className="cursor-pointer group"
                >
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-purple-400 group-hover:bg-purple-50 transition-all">
                    {eventImagePreview ? (
                      <img
                        src={eventImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400 group-hover:text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    )}
                  </div>
                </label>
                <input
                  id="event-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="event-image-upload" className="cursor-pointer">
                  <div className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center space-x-2 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {eventImageFile ? "Change Image" : "Upload Image"}
                    </span>
                  </div>
                </label>
                {eventImageFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {eventImageFile.name}
                  </p>
                )}
              </div>
            </div>
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
