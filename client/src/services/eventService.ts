import axiosHostClient from "../api/axiosHostClient";
import axiosUserClient from "../api/axiosUserClient";
import axiosAdminClient from "../api/axiosAdminClient";

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
    return {
      events: response.data.events,
      totalCount: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    };
  },
  //event's details
  fetchEventDetails: async (id: string) => {
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
    return {
      events: response.data.events,
      totalCount: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    };
  },
//editing event
  editEvent: async (id: string, eventData: any) => {
    const response = await axiosHostClient.put(`/events/edit/${id}`, eventData);
    return response.data;
  },

  // cancel event

  blockEvent: async (id: string, reason: string) => {
    const response = await axiosHostClient.put(`/events/cancel/${id}`, { reason });
    return response.data.event;
  },
  fetchEventsForAdmin: async (
    page: number,
    limit: number,
    
  ) => {
    const response = await axiosAdminClient.get('/events', {
      params: {
        page,
        limit
      },
    });
  
    return response.data;
  },
  
};

export default eventRepository;
