import React, { useEffect, useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HostLayout from "../../layouts/HostLayout";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { useEventStore } from "../../store/eventStore";

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
  category: string;
  artist: string;
  description: string;
  additionalDetails: string;
  eventImage: string;
}

const HostEditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventDetails, editEvent } = useEventStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
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
    category: "",
    artist: "",
    description: "",
    additionalDetails: "",
    eventImage: "",
  });

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
        // Pre-fill form data with fetched event details.
        setFormData({
          title: fetchedEvent.title,
          // Format date as yyyy-mm-dd for the date input.
          date: new Date(fetchedEvent.date).toISOString().split("T")[0],
          // Format time as HH:MM in 24-hour format.
          startTime: new Date(fetchedEvent.startTime).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" }),
          endTime: new Date(fetchedEvent.endTime).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" }),
          venueName: fetchedEvent.venueName,
          venueCity: fetchedEvent.venueCity,
          venueState: fetchedEvent.venueState,
          venueZip: fetchedEvent.venueZip,
          venueCapacity: fetchedEvent.venueCapacity,
          category: fetchedEvent.category,
          artist: fetchedEvent.artist,
          description: fetchedEvent.description,
          additionalDetails: fetchedEvent.additionalDetails || "",
          eventImage: fetchedEvent.eventImage || "",
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "venueCapacity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Convert string dates to Date objects
      const processedData = {
        ...formData,
        date: new Date(formData.date),
        startTime: new Date(`${formData.date}T${formData.startTime}`),
        endTime: new Date(`${formData.date}T${formData.endTime}`)
      };
      
      await editEvent(id!, processedData);
      toast.success("Event updated successfully!");
      navigate("/host/events");
    } catch (err: any) {
      toast.error("Failed to update event.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <HostLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">Edit Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
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
            </div>
          </div>

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
          </div>

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
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Venue Capacity</label>
            <input
              type="number"
              name="venueCapacity"
              value={formData.venueCapacity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

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
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Event Image URL</label>
            <input
              type="text"
              name="eventImage"
              value={formData.eventImage}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

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
          </div>

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

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
            >
              {submitting ? "Updating..." : "Update Event"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </HostLayout>
  );
};

export default HostEditEventPage;
