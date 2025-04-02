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
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface EventStore {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  addEvent: (eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt' | '__v'>) => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchAllEvents: () => Promise<void>;
  fetchEventDetails: (id: string) => Promise<Event | null>;
  editEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

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
  // New method: Edit event
  editEvent: async (id: string, eventData: Partial<Event>) => {
    try {
      set({ isLoading: true, error: null });
      const updatedEvent = await eventRepository.editEvent(id, eventData);
      // Update local state: Replace the edited event in the events array
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

  // New method: Delete event
  deleteEvent: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await eventRepository.deleteEvent(id);
      // Remove the deleted event from the state
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
}));
