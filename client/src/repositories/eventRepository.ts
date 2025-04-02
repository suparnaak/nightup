import axiosHostClient from "../api/axiosHostClient";
import axiosUserClient from "../api/axiosUserClient";

export const eventRepository = {
  addEvent: async (eventData: any) => {
    const response = await axiosHostClient.post("/events/add", eventData);
    return response.data;
  },

  fetchEvents: async () => {
    const response = await axiosHostClient.get("/events");
    return response.data.events;
  },
  fetchAllEvents: async () => {
    const response = await axiosUserClient.get("/events");
    return response.data.events;
  },
  fetchEventDetails: async (id: string) => {
    //console.log(id)
    const response = await axiosUserClient.get(`/event/${id}`);
    return response.data.event;
  },
  editEvent: async (id: string, eventData: any) => {
    const response = await axiosHostClient.put(`/events/edit/${id}`, eventData);
    return response.data;
  },

  // New method: Delete event
  deleteEvent: async (id: string) => {
    const response = await axiosHostClient.delete(`/events/${id}`);
    return response.data;
  },
};

export default eventRepository;
