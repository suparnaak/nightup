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
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface EventStore {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  selectedCity: string | null;
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
  selectedCity:null,

//add events
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

  //all events - host specific
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

  //all events - not host specific
  fetchAllEvents: async () => {
    try {
      set({ isLoading: true, error: null });
      const events = await eventRepository.fetchAllEvents(); 
      set({ events, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch all events',
      });
    }
  },
  fetchEventsByCity: async (city: string) => {
    try {
      set({ isLoading: true, error: null });
      const events = await eventRepository.fetchEventsByCity(city);
      set({ events, isLoading: false });
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
      //console.log(id)
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
  // Edit event
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

  // Delete event
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
    set({ selectedCity: city });
  },
}));
