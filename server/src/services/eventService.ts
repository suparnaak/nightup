import { Types } from 'mongoose';
import { IEventService, IEvent } from './interfaces/IEventService';
import EventRepository from '../repositories/eventRepository';

class EventService implements IEventService {

  async addEvent(eventData: IEvent): Promise<IEvent> {
    return await EventRepository.addEvent(eventData);
  }

  async getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]> {
    return await EventRepository.getEventsByHostId(hostId);
  }

  async getAllEvents(): Promise<IEvent[]> {
    return await EventRepository.getAllEvents();
  }
  

}

export default new EventService();
