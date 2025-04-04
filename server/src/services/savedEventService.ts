import SavedEventRepository from "../repositories/savedEventRepository";
import { ISavedEventService } from "./interfaces/ISavedEventService";
import EventRepository from "../repositories/eventRepository";
import { ISavedEvent } from "../models/savedEvents"
import { Types } from "mongoose";

class SavedEventService implements ISavedEventService {
  async getSavedEvents(userId: string): Promise<ISavedEvent[]> {
    return await SavedEventRepository.getSavedEvents(userId);
  }

  async saveEvent(userId: string, eventId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid Event ID");
    }
    const eventObjectId = new Types.ObjectId(eventId);

    const existingEvent = await SavedEventRepository.isEventSaved(userId, eventObjectId);
    if (existingEvent) {
      return false; // Event already saved
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
