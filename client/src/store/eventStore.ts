import { create } from 'zustand';
import { eventRepository } from '../repositories/eventRepository';

interface Ticket {
  _id: string;
  ticketType: string;
  ticketPrice: number;
  ticketCount: number;
}

interface Event {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  hostId: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  category: string;
  artist: string;
  description: string;
  tickets: Ticket[];
  eventImage: string;
  additionalDetails: string;
  isBlocked: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude] for geo location
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface EventFilters {
  category?: string;
  date?: string;
  venueCity?: string;
 
}

interface EventStore {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  selectedCity: string | null;
  
  //for pagination
  currentPage: number;
  limit: number;
  totalEvents: number;
  totalPages: number;
  searchTerm: string;
  filters: EventFilters;
  
  // pagination and search
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: EventFilters) => void;
  resetFilters: () => void;
  
  addEvent: (eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt' | '__v'>) => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchAllEvents: () => Promise<void>;
  fetchEventDetails: (id: string) => Promise<Event | null>;
  editEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  fetchEventsByCity: (city: string) => Promise<void>;
  setSelectedCity: (city: string) => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  selectedCity: null,
  
  currentPage: 1,
  limit: 10,
  totalEvents: 0,
  totalPages: 1,
  searchTerm: '',
  filters: {},
  
  setPage: (page: number) => set({ currentPage: page }),
  setLimit: (limit: number) => set({ limit }),
  setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }), 
  setFilters: (filters: EventFilters) => set({ filters, currentPage: 1 }),
  resetFilters: () => set({ filters: {}, searchTerm: '', currentPage: 1 }),

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
        error: error.response?.data?.message || 'Event creation failed. Please try again.',
      });
      throw error;
    }
  },

  fetchEvents: async () => {
    try {
      set({ isLoading: true, error: null });
      const events = await eventRepository.fetchEvents();
      set({ events, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch events',
      });
    }
  },

  fetchAllEvents: async () => {
    try {
      const { currentPage, limit, searchTerm, filters } = get();
      set({ isLoading: true, error: null });
      
      const data = await eventRepository.fetchAllEvents(currentPage, limit, searchTerm, filters);
      
      set({ 
        events: data.events,
        totalEvents: data.totalCount,
        totalPages: data.totalPages,
        isLoading: false 
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch all events',
      });
    }
  },
  
  fetchEventsByCity: async (city: string) => {
    try {
      const { currentPage, limit, searchTerm, filters } = get();
      set({ isLoading: true, error: null });
      
      const data = await eventRepository.fetchEventsByCity(city, currentPage, limit, searchTerm, filters);
      
      set({ 
        events: data.events,
        totalEvents: data.totalCount,
        totalPages: data.totalPages,
        isLoading: false 
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch events by city',
      });
    }
  },
  
  fetchEventDetails: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const event = await eventRepository.fetchEventDetails(id);
      set({ isLoading: false });
      return event;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch event details',
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

  deleteEvent: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await eventRepository.deleteEvent(id);
      const updatedEvents = get().events.filter((ev) => ev._id !== id);
      set({ events: updatedEvents, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Failed to delete event. Please try again.",
      });
      throw error;
    }
  },
  
  setSelectedCity: (city: string) => {
    set({ selectedCity: city, currentPage: 1 }); 
  },
}));