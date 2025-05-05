/* import { Types } from 'mongoose';
import { IEvent } from '../../services/interfaces/IEventService';
import { IEventDocument } from '../../models/events';

export interface IEventRepository {
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
  getEventById(eventId: Types.ObjectId): Promise<IEvent | null>
  getEventsByCity(city: string): Promise<IEvent[]>
  editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null>
  blockEvent(eventId: Types.ObjectId, reason: string): Promise<IEventDocument | null>
  getEventsForAdmin(
        page: number,
        limit: number
      ): Promise<{ events: IEvent[]; total: number }>
}
 */
import { Types } from 'mongoose';
import { IEvent } from '../../services/interfaces/IEventService';
import { IEventDocument } from '../../models/events';
import { IBaseRepository } from '../baseRepository/IBaseRepository';

export interface IEventRepository extends IBaseRepository<IEventDocument> {
  addEvent(eventData: IEvent): Promise<IEventDocument>;
  getEventsByHostId(hostId: Types.ObjectId): Promise<IEventDocument[]>;
  getAllEvents(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    date?: string;
    city?: string;
  }): Promise<{ events: IEventDocument[]; total: number }>;
  getEventsByCity(city: string): Promise<IEventDocument[]>;
  getEventById(eventId: Types.ObjectId): Promise<IEventDocument | null>;
  editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEventDocument | null>;
  blockEvent(eventId: Types.ObjectId, reason: string): Promise<IEventDocument | null>;
  getEventsForAdmin(
    page: number,
    limit: number
  ): Promise<{ events: IEventDocument[]; total: number }>;
}
