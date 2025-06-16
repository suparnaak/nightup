
import { Types } from 'mongoose';
import { IEventDocument } from '../../models/events';

export interface IEventRepository {
  addEvent(eventData: Partial<IEventDocument>): Promise<IEventDocument>;
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
  editEvent(
    eventId: Types.ObjectId,
    eventData: Partial<IEventDocument>
  ): Promise<IEventDocument | null>;
  blockEvent(
    eventId: Types.ObjectId,
    reason: string
  ): Promise<IEventDocument | null>;
  getEventsForAdmin(
    page: number,
    limit: number
  ): Promise<{ events: IEventDocument[]; total: number }>;
  findByIdPopulated(eventId: string): Promise<IEventDocument | null>
}