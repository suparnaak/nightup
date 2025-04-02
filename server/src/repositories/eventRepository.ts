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
      // Get current date with time set to beginning of day
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Find events that are not blocked and whose date is today or in the future
      const events = await Event.find({ 
        isBlocked: false,
        $or: [
          { date: { $gt: today } }, // Future dates
          { 
            date: today, // Today's date
            endTime: { $gte: now } // End time hasn't passed yet
          }
        ]
      })
        .sort({ date: 1, startTime: 1 }) // Sort by date then by start time
        .lean();
  
      return events as IEvent[];
    } catch (error) {
      console.error('Error fetching all events:', error);
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
   // New method: Edit event
   async editEvent(eventId: Types.ObjectId, eventData: Partial<IEvent>): Promise<IEvent | null> {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });
      return updatedEvent as IEvent | null;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  // New method: Delete event
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
