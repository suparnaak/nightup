import { Types } from 'mongoose';
import { IEventDocument } from '../../models/events';

export interface ITicket {
  ticketType: string;
  ticketPrice: number;
  ticketCount: number;
}

export interface IEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  hostId: Types.ObjectId;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  category: string;
  categoryId:Types.ObjectId;
  artist: string;
  description: string;
  tickets: ITicket[];
  eventImage: string;
  additionalDetails?: string;
  isBlocked: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number]; 
  };
}

export interface IEventService {
  addEvent(eventData: IEvent): Promise<IEvent>;
  getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]>;
  getAllEvents(query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string,
    city?: string
  }): Promise<{ events: IEvent[], total: number }>
  //getEventsByCity(city: string): Promise<IEvent[]>
  getEventsByCity(city: string, query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string
  }): Promise<{ events: IEvent[], total: number }>
  getEventDetails(eventId: Types.ObjectId): Promise<IEvent | null>
  editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null>
  deleteEvent(eventId: Types.ObjectId, reason: string): Promise<IEventDocument>

}
