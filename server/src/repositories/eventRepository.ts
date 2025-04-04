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
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const events = await Event.find({ 
        isBlocked: false,
        $or: [
          { date: { $gt: today } }, 
          { 
            date: today, 
            endTime: { $gte: now } 
          }
        ]
      })
        .sort({ date: 1, startTime: 1 }) 
        .lean();
  
      return events as IEvent[];
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  }
  async getEventsByCity(city: string): Promise<IEvent[]> {
    try {
      // Filter events where venueCity matches the provided city (case-insensitive)
      const events = await Event.find({
        isBlocked: false,
        venueCity: { $regex: new RegExp(city, "i") }
      })
      .sort({ date: 1, startTime: 1 })
      .lean();
      return events as IEvent[];
    } catch (error) {
      console.error("Error fetching events by city:", error);
      throw error;
    }
  }
  async getEventById(eventId: Types.ObjectId): Promise<IEvent | null> {
    try {
      const event = await Event.findById(eventId)
        .populate("hostId", "name email") 
        .lean();
      return event as IEvent | null;
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw error;
    }
  }
   async editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null> {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });
      return updatedEvent as IEvent | null;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  // Delete event
  async deleteEvent(eventId: Types.ObjectId): Promise<void> {
    try {
      await Event.findByIdAndDelete(eventId);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }
}

export default new EventRepository();
