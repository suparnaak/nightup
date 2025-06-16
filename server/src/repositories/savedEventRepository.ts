/* import { Types } from "mongoose";
import SavedEvent, { ISavedEvent } from "../models/savedEvents"
import { ISavedEventRepository } from "./interfaces/ISavedEventRepository";

export class SavedEventRepository implements ISavedEventRepository {
  async getSavedEvents(userId: string): Promise<ISavedEvent[]> {
  
    return await SavedEvent.find({ user: userId })
    .populate('event', 'title eventImage date startTime endTime venueName venueCity')
    .exec();
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

//export default new SavedEventRepository(); */
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
    console.log("repository isevent saved", eventId);
    const existingEvent = await this.findOne({ 
      user: new Types.ObjectId(userId), 
      event: eventId 
    });
    return !!existingEvent;
  }

  async saveEvent(userId: string, eventId: Types.ObjectId, title: string): Promise<ISavedEvent> {
    console.log("event id repository", eventId);
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
    console.log("repository", result);
    return result !== null;
  }
}