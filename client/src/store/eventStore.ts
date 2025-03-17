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
}));
