import { Types } from 'mongoose';
import { IEventRepository } from './interfaces/IEventRepository';
import { IEvent } from '../services/interfaces/IEventService';
import Event from '../models/events'; 

class EventRepository implements IEventRepository {

  // Add an event
  async addEvent(eventData: IEvent): Promise<IEvent> {
    const event = new Event(eventData);
    return await event.save();
  }

  //list events - host specific
  async getEventsByHostId(hostId: Types.ObjectId): Promise<IEvent[]> {
    try {
      const events = await Event.find({ hostId }).sort({ date: -1 }).lean();
      return events as IEvent[];
    } catch (error) {
      console.error('Error fetching events by hostId:', error);
      throw error;
    }
  }
  //list events - not host specific
  async getAllEvents(): Promise<IEvent[]> {
    try {
      const events = await Event.find({ isBlocked: false }).sort({ date: -1 }).lean();
      return events as IEvent[];
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  }
  

}

export default new EventRepository();
