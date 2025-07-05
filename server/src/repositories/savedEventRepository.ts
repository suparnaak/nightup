import { Types } from "mongoose";
import SavedEvent, { ISavedEvent } from "../models/savedEvents";
import { ISavedEventRepository } from "./interfaces/ISavedEventRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

export class SavedEventRepository extends BaseRepository<ISavedEvent> implements ISavedEventRepository {
  constructor() {
    super(SavedEvent);
  }

  async getSavedEvents(userId: string): Promise<ISavedEvent[]> {
    return await SavedEvent.find({ user: new Types.ObjectId(userId) })
      .populate('event', 'title eventImage date startTime endTime venueName venueCity')
      .exec();
  }

  async isEventSaved(userId: string, eventId: Types.ObjectId): Promise<boolean> {
    const existingEvent = await this.findOne({ 
      user: new Types.ObjectId(userId), 
      event: eventId 
    });
    return !!existingEvent;
  }

  async saveEvent(userId: string, eventId: Types.ObjectId, title: string): Promise<ISavedEvent> {
    const savedEvent = new SavedEvent({ 
      user: new Types.ObjectId(userId), 
      event: eventId, 
      title: title 
    });
    return await savedEvent.save();
  }

  async removeSavedEvent(userId: string, eventId: Types.ObjectId): Promise<boolean> {
    const result = await SavedEvent.findOneAndDelete({ 
      user: new Types.ObjectId(userId), 
      event: eventId 
    });
    return result !== null;
  }
}