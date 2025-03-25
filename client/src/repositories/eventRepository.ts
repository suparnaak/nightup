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
};

export default eventRepository;
