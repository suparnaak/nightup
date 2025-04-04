import { Types } from "mongoose";
import SavedEvent, { ISavedEvent } from "../models/savedEvents"
import { ISavedEventRepository } from "./interfaces/ISavedEventRepository";

class SavedEventRepository implements ISavedEventRepository {
  async getSavedEvents(userId: string): Promise<ISavedEvent[]> {
    return await SavedEvent.find({ user: userId });
  }

  async isEventSaved(userId: string, eventId: Types.ObjectId): Promise<boolean> {
    console.log("repository isevent saved",eventId)
    const existingEvent = await SavedEvent.findOne({ user: userId, event: eventId });
    return !!existingEvent;
  }

  async saveEvent(userId: string, eventId: Types.ObjectId, title: string): Promise<ISavedEvent> {
    console.log("event id repository",eventId)
    const savedEvent = new SavedEvent({ user: userId, event: eventId, title: title });
    return await savedEvent.save();
  }

  async removeSavedEvent(userId: string, eventId: Types.ObjectId): Promise<boolean> {
    const result = await SavedEvent.findOneAndDelete({ user: userId, event: eventId });
    console.log("repository",result)
    return result !== null;
  }
}

export default new SavedEventRepository();