import { Types } from "mongoose"
import { ISavedEvent } from "../../models/savedEvents"

export interface ISavedEventRepository {
  getSavedEvents(userId: string): Promise<ISavedEvent[]>
  isEventSaved(userId: string, eventId: Types.ObjectId): Promise<boolean>
  saveEvent(userId: string, eventId: Types.ObjectId, title: string): Promise<ISavedEvent>
  removeSavedEvent(userId: string, eventId: Types.ObjectId): Promise<boolean>
}
