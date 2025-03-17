import { Types } from 'mongoose';
import { IEvent } from '../../services/interfaces/IEventService';

export interface IEventRepository {
  addEvent(eventData: IEvent): Promise<IEvent | null>;
  getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]>;
  getAllEvents(): Promise<IEvent[]>;
  
}
