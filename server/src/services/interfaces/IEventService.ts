import { Types } from 'mongoose';

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
  artist: string;
  description: string;
  tickets: ITicket[];
  eventImage: string;
  additionalDetails?: string;
  isBlocked: boolean;
}

export interface IEventService {
  addEvent(eventData: IEvent): Promise<IEvent>;
  getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]>;
  getAllEvents(): Promise<IEvent[]>;

}
