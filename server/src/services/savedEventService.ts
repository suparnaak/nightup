import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { ISavedEventRepository } from '../repositories/interfaces/ISavedEventRepository';
import { ISavedEventService, SavedEventResponse} from "./interfaces/ISavedEventService";
import { IEventRepository } from '../repositories/interfaces/IEventRepository';
import { ISavedEvent } from "../models/savedEvents"
import { Types } from "mongoose";
import { MESSAGES } from "../utils/constants";

@injectable()
export class SavedEventService implements ISavedEventService {
  constructor(
    @inject(TYPES.SavedEventRepository)
  private savedEventRepository: ISavedEventRepository,
  @inject(TYPES.EventRepository)
  private eventRepository: IEventRepository
  ){}
  async getSavedEvents(userId: string): Promise<ISavedEvent[]> {
    return await this.savedEventRepository.getSavedEvents(userId);
 
  }

  async saveEvent(userId: string, eventId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error(MESSAGES.USER.ERROR.EVENT_ID_MISSING);
    }
    const eventObjectId = new Types.ObjectId(eventId);

    const existingEvent = await this.savedEventRepository.isEventSaved(userId, eventObjectId);
    if (existingEvent) {
      return false; 
    }

    const event = await this.eventRepository.getEventById(eventObjectId);
    if (!event) {
      throw new Error(MESSAGES.USER.ERROR.EVENT_ID_MISSING);
    }

    await this.savedEventRepository.saveEvent(userId, eventObjectId, event.title);
    return true;
  }

  async removeSavedEvent(userId: string, eventId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error(MESSAGES.USER.ERROR.EVENT_ID_MISSING);
    }
    const eventObjectId = new Types.ObjectId(eventId);
    console.log("service event obj id",eventObjectId)
    return await this.savedEventRepository.removeSavedEvent(userId, eventObjectId);
  }
}

