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
//fetching all the events publically
  fetchAllEvents: async (page = 1, limit = 6, search = "", filters = {}) => {
    let url = `/events?page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url += `&${key}=${encodeURIComponent(value.toString())}`;
      }
    });

    const response = await axiosUserClient.get(url);
    return response.data;
  },
  //event's details
  fetchEventDetails: async (id: string) => {
    //console.log(id)
    const response = await axiosUserClient.get(`/event/${id}`);
    return response.data.event;
  },
 //fetchig based on city
  fetchEventsByCity: async (
    city: string,
    page = 1,
    limit = 6,
    search = "",
    filters = {}
  ) => {
    let url = `/events?city=${encodeURIComponent(
      city
    )}&page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url += `&${key}=${encodeURIComponent(value.toString())}`;
      }
    });

    const response = await axiosUserClient.get(url);
    return response.data;
  },
//editing event
  editEvent: async (id: string, eventData: any) => {
    const response = await axiosHostClient.put(`/events/edit/${id}`, eventData);
    return response.data;
  },

  // Delete event
  /* deleteEvent: async (id: string) => {
    const response = await axiosHostClient.delete(`/events/${id}`);
    return response.data;
  }, */
  blockEvent: async (id: string, reason: string) => {
    const response = await axiosHostClient.put(`/events/cancel/${id}`, { reason });
    return response.data.event;
  },
};

export default eventRepository;
