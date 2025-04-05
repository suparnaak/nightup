import { Types } from 'mongoose';
import { IEvent } from '../../services/interfaces/IEventService';

export interface IEventRepository {
  addEvent(eventData: IEvent): Promise<IEvent | null>;
  getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]>;
  getAllEvents(): Promise<IEvent[]>;
  getEventById(eventId: Types.ObjectId): Promise<IEvent | null>
  getEventsByCity(city: string): Promise<IEvent[]>
  editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null>
  deleteEvent(eventId: Types.ObjectId): Promise<void>
}
