import { create } from "zustand";
import { eventRepository } from "../services/eventService";
import {  Event, EventFilters } from "../types/eventTypes";


interface EventStore {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  selectedCity: string | null;

  currentPage: number;
  limit: number;
  totalEvents: number;
  totalPages: number;
  searchTerm: string;
  filters: EventFilters;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: EventFilters) => void;
  resetFilters: () => void;

  addEvent: (
    eventData: Omit<Event, "_id" | "createdAt" | "updatedAt" | "__v">
  ) => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchAllEvents: (append?: boolean) => Promise<void>;
  fetchEventDetails: (id: string) => Promise<Event | null>;
  editEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string, reason: string) => Promise<void>;
  fetchEventsByCity: (city: string, append?: boolean) => Promise<void>;
  setSelectedCity: (city: string) => void;
  fetchEventsForAdmin: () => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  selectedCity: null,

  currentPage: 1,
  limit: 2,
  totalEvents: 0,
  totalPages: 1,
  searchTerm: "",
  filters: {},

  setPage: (page: number) => set({ currentPage: page }),
  setLimit: (limit: number) => set({ limit }),
  setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }),
  setFilters: (filters: EventFilters) => set({ filters, currentPage: 1 }),
  resetFilters: () => set({ filters: {}, searchTerm: "", currentPage: 1 }),

  addEvent: async (eventData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await eventRepository.addEvent(eventData);
      const updatedEvents = [...get().events, response];
      set({ events: updatedEvents, isLoading: false });
      return response;
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Event creation failed. Please try again.",
      });
      throw error;
    }
  },
//events for host
  fetchEvents: async () => {
    try {
      set({ isLoading: true, error: null });
      const events = await eventRepository.fetchEvents();
      set({ events, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch events",
      });
    }
  },

   fetchAllEvents: async (append = false) => {
  try {
    const { currentPage, limit, searchTerm, filters } = get();
    set({ isLoading: true, error: null });

    console.log('Fetching events with params:', {
      currentPage,
      limit,
      searchTerm,
      filters,
      append
    });

    const data = await eventRepository.fetchAllEvents(
      currentPage,
      limit,
      searchTerm,
      filters
    );
    
    console.log('Received events:', data);
    
    set({
      events: append ? [...get().events, ...data.events] : data.events,
      totalEvents: data.totalCount,
      totalPages: data.totalPages,
      isLoading: false,
    });
  } catch (error: any) {
    console.error('Error in fetchAllEvents:', error);
    set({
      isLoading: false,
      error: error.response?.data?.message || "Failed to fetch all events",
    });
  }
},


  fetchEventsByCity: async (city: string,append = false) => {
    try {
      const { currentPage, limit, searchTerm, filters } = get();
      set({ isLoading: true, error: null });

      const data = await eventRepository.fetchEventsByCity(
        city,
        currentPage,
        limit,
        searchTerm,
        filters
      );

      set({
        events: append ? [...get().events, ...data.events] : data.events,
        totalEvents: data.totalCount,
        totalPages: data.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message || "Failed to fetch events by city",
      });
    }
  },

  fetchEventDetails: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const event = await eventRepository.fetchEventDetails(id);
      set({ isLoading: false });
      console.log("event details",event)
      return event;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch event details",
      });
      return null;
    }
  },

  editEvent: async (id: string, eventData: Partial<Event>) => {
    try {
      set({ isLoading: true, error: null });
      const updatedEvent = await eventRepository.editEvent(id, eventData);
      const updatedEvents = get().events.map((ev) =>
        ev._id === id ? updatedEvent : ev
      );
      set({ events: updatedEvents, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Event update failed. Please try again.",
      });
      throw error;
    }
  },

  deleteEvent: async (id: string, reason: string) => {
    try {
      set({ isLoading: true, error: null });
      const updatedEvent = await eventRepository.blockEvent(id, reason);
      const updatedEvents = get().events.map((ev) =>
        ev._id === id ? updatedEvent : ev
      );
      set({ events: updatedEvents, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Failed to block event. Please try again.",
      });
      throw error;
    }
  },

  setSelectedCity: (city: string) => {
    set({ selectedCity: city, currentPage: 1 });
  },

  //events listing at admin
  fetchEventsForAdmin: async () => {
  try {
    const { currentPage, limit } = get();
    set({ isLoading: true, error: null });

    const data = await eventRepository.fetchEventsForAdmin(
      currentPage,
      limit
    );

    const events = data.events;
    const { total, totalPages } = data.pagination;

    set({
      events,
      totalEvents: total,       
      totalPages,                
      isLoading: false,
    });
  } catch (error: any) {
    set({
      isLoading: false,
      error: error.response?.data?.message || "Failed to fetch admin events",
    });
  }
},

}));
