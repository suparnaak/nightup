import SavedEventRepository from "../repositories/savedEventRepository";
import { ISavedEventService, SavedEventResponse} from "./interfaces/ISavedEventService";
import EventRepository from "../repositories/eventRepository";
import { ISavedEvent } from "../models/savedEvents"
import { Types } from "mongoose";

class SavedEventService implements ISavedEventService {
  async getSavedEvents(userId: string): Promise<ISavedEvent[]> {
    return await SavedEventRepository.getSavedEvents(userId);
   /*  const savedEvents = await SavedEventRepository.getSavedEvents(userId);
    return savedEvents.map(savedEvent => ({
      id: savedEvent._id.toString(),
      event: {
        _id: savedEvent.event._id.toString(),
        title: savedEvent.event.title,
        eventImage: savedEvent.event.eventImage,
        date: savedEvent.event.date?.toISOString(),
        startTime: savedEvent.event.startTime?.toISOString(),
        endTime: savedEvent.event.endTime?.toISOString(),
        venueName: savedEvent.event.venueName,
        venueCity: savedEvent.event.venueCity,
      } 
    }));
    */
  }

  async saveEvent(userId: string, eventId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid Event ID");
    }
    const eventObjectId = new Types.ObjectId(eventId);

    const existingEvent = await SavedEventRepository.isEventSaved(userId, eventObjectId);
    if (existingEvent) {
      return false; 
    }

    const event = await EventRepository.getEventById(eventObjectId);
    if (!event) {
      throw new Error("Event not found");
    }

    await SavedEventRepository.saveEvent(userId, eventObjectId, event.title);
    return true;
  }

  async removeSavedEvent(userId: string, eventId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid Event ID");
    }
    const eventObjectId = new Types.ObjectId(eventId);
    console.log("service event obj id",eventObjectId)
    return await SavedEventRepository.removeSavedEvent(userId, eventObjectId);
  }
}

export default new SavedEventService();
