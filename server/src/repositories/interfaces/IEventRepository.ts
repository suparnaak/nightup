import { Types } from 'mongoose';
import { IEvent } from '../../services/interfaces/IEventService';

export interface IEventRepository {
  addEvent(eventData: IEvent): Promise<IEvent | null>;
  getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]>;
  getAllEvents(query: {
    page?: number,
    limit?: number,
    search?: string,
    category?: string,
    date?: string,
    city?: string
  }): Promise<{ events: IEvent[], total: number }>
  getEventById(eventId: Types.ObjectId): Promise<IEvent | null>
  getEventsByCity(city: string): Promise<IEvent[]>
  editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null>
  deleteEvent(eventId: Types.ObjectId): Promise<void>
}
