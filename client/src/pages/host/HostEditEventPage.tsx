import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HostLayout from "../../layouts/HostLayout";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { useEventStore } from "../../store/eventStore";
import { useCategoryStore } from "../../store/categoryStore";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import { validateEventForm } from "../../utils/eventValidation";

interface TicketType {
  ticketType: string;
  ticketPrice: number;
  ticketCount: number;
}

interface FormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  categoryId: string;
  category: string;
  artist: string;
  description: string;
  additionalDetails: string;
  eventImage: string;
  tickets: TicketType[];
}

const HostEditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventDetails, editEvent } = useEventStore();
  const { categories, getHostCategories } = useCategoryStore();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueCity: "",
    venueState: "",
    venueZip: "",
    venueCapacity: 0,
    categoryId: "",
    category: "",
    artist: "",
    description: "",
    additionalDetails: "",
    eventImage: "",
    tickets: [{ ticketType: "", ticketPrice: 0, ticketCount: 0 }],
  });

  useEffect(() => {
    getHostCategories().catch((err) => {
      console.error("Failed to load categories:", err);
      toast.error("Could not load categories");
    });
  }, [getHostCategories]);

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
        
        setFormData({
          title: fetchedEvent.title,
          date: new Date(fetchedEvent.date).toISOString().split("T")[0],
          startTime: new Date(fetchedEvent.startTime).toLocaleTimeString([], { 
            hour12: false, 
            hour: "2-digit", 
            minute: "2-digit" 
          }),
          endTime: new Date(fetchedEvent.endTime).toLocaleTimeString([], { 
            hour12: false, 
            hour: "2-digit", 
            minute: "2-digit" 
          }),
          venueName: fetchedEvent.venueName,
          venueCity: fetchedEvent.venueCity,
          venueState: fetchedEvent.venueState,
          venueZip: fetchedEvent.venueZip,
          venueCapacity: fetchedEvent.venueCapacity,
          categoryId: fetchedEvent.categoryId || "",
          category: fetchedEvent.category,
          artist: fetchedEvent.artist,
          description: fetchedEvent.description,
          additionalDetails: fetchedEvent.additionalDetails || "",
          eventImage: fetchedEvent.eventImage || "",
          tickets: fetchedEvent.tickets && fetchedEvent.tickets.length > 0 
            ? fetchedEvent.tickets 
            : [{ ticketType: "", ticketPrice: 0, ticketCount: 0 }],
        });
        
        // Set the current image as preview
        if (fetchedEvent.eventImage) {
          setEventImagePreview(fetchedEvent.eventImage);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "venueCapacity" ? Number(value) : value,
    }));
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
    const newTickets = [...formData.tickets];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setFormData(prev => ({ ...prev, tickets: newTickets }));
  };

  const addTicketField = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, { ticketType: "", ticketPrice: 0, ticketCount: 0 }]
    }));
  };

  const removeTicketField = (index: number) => {
    if (formData.tickets.length > 1) {
      setFormData(prev => ({
        ...prev,
        tickets: prev.tickets.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors = validateEventForm(
      formData.title,
      formData.date,
      formData.startTime,
      formData.endTime,
      formData.venueName,
      formData.venueCity,
      formData.venueState,
      formData.venueZip,
      formData.venueCapacity,
      formData.categoryId,
      formData.artist,
      formData.description,
      formData.tickets
    );
    setFormErrors(errors);
    return !Object.values(errors).some((err) => err !== null);
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      let eventImageUrl = formData.eventImage;
      
      // Upload new image if a file was selected
      if (eventImageFile) {
        eventImageUrl = await uploadImageToCloudinary(eventImageFile);
      }
      
      const selectedCat = categories.find((c) => c.id === formData.categoryId);
      
      const processedData = {
        ...formData,
        eventImage: eventImageUrl,
        category: selectedCat?.name || formData.category,
      };
      
      await editEvent(id!, processedData);
      toast.success("Event updated successfully!");
      navigate("/host/events");
    } catch (err: any) {
      toast.error("Failed to update event.");
      setError(err.response?.data?.message || "An error occurred");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>
  );
}
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <HostLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">Edit Event</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
            )}
          </div>

          {/* Date and Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getTodayDate()}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
              {formErrors.date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
              {formErrors.startTime && (
                <p className="text-red-500 text-sm mt-1">{formErrors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
              {formErrors.endTime && (
                <p className="text-red-500 text-sm mt-1">{formErrors.endTime}</p>
              )}
            </div>
          </div>

          {/* Venue Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Venue Name</label>
            <input
              type="text"
              name="venueName"
              value={formData.venueName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
            {formErrors.venueName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.venueName}</p>
            )}
          </div>

          {/* Venue Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">City</label>
              <input
                type="text"
                name="venueCity"
                value={formData.venueCity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
              {formErrors.venueCity && (
                <p className="text-red-500 text-sm mt-1">{formErrors.venueCity}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">State</label>
              <input
                type="text"
                name="venueState"
                value={formData.venueState}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
              {formErrors.venueState && (
                <p className="text-red-500 text-sm mt-1">{formErrors.venueState}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Zip Code</label>
              <input
                type="text"
                name="venueZip"
                value={formData.venueZip}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
              {formErrors.venueZip && (
                <p className="text-red-500 text-sm mt-1">{formErrors.venueZip}</p>
              )}
            </div>
          </div>

          {/* Venue Capacity */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Total Tickets</label>
            <input
              type="number"
              name="venueCapacity"
              value={formData.venueCapacity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              min="0"
              required
            />
            {formErrors.venueCapacity && (
              <p className="text-red-500 text-sm mt-1">{formErrors.venueCapacity}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {formErrors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>
            )}
          </div>

          {/* Artist */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Artist</label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
            {formErrors.artist && (
              <p className="text-red-500 text-sm mt-1">{formErrors.artist}</p>
            )}
          </div>

          {/* Tickets Section */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Ticket Types</label>
            {formData.tickets.map((ticket, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-md"
              >
                <div className="md:col-span-2">
                  <label className="block text-gray-600 text-sm mb-1">
                    Ticket Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., VIP, General, Early Bird"
                    value={ticket.ticketType}
                    onChange={(e) =>
                      handleTicketChange(index, "ticketType", e.target.value)
                    }
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={ticket.ticketPrice}
                    onChange={(e) =>
                      handleTicketChange(
                        index,
                        "ticketPrice",
                        Number(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 p-2 rounded"
                    min="0"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex-1">
                    <label className="block text-gray-600 text-sm mb-1">
                      Available Count
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={ticket.ticketCount}
                      onChange={(e) =>
                        handleTicketChange(
                          index,
                          "ticketCount",
                          Number(e.target.value)
                        )
                      }
                      className="w-full border border-gray-300 p-2 rounded"
                      min="0"
                      required
                    />
                  </div>
                  {formData.tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketField(index)}
                      className="ml-2 text-red-600 hover:text-red-800 p-2"
                      title="Remove ticket type"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTicketField}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Ticket Type
            </button>
            {formErrors.tickets && (
              <p className="text-red-500 text-sm mt-1">{formErrors.tickets}</p>
            )}
          </div>

          {/* Event Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Image</label>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <label
                  htmlFor="event-image-upload"
                  className="cursor-pointer group"
                >
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-purple-400 group-hover:bg-purple-50 transition-all">
                    {eventImagePreview ? (
                      <img
                        src={eventImagePreview}
                        alt="Event Preview"
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
                      {eventImageFile ? "Change Image" : formData.eventImage ? "Update Image" : "Upload Image"}
                    </span>
                  </div>
                </label>
                {eventImageFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    New image selected: {eventImageFile.name}
                  </p>
                )}
                {!eventImageFile && formData.eventImage && (
                  <p className="text-sm text-gray-600 mt-2">
                    Current image will be kept if no new image is selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={4}
              required
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Additional Details</label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </HostLayout>
  );
};

export default HostEditEventPage;