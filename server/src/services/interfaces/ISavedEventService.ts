import { ISavedEvent } from "../../models/savedEvents"

export interface ISavedEventService {
   getSavedEvents(userId: string): Promise<ISavedEvent[]>
   saveEvent(userId: string, eventId: string): Promise<boolean>
   removeSavedEvent(userId: string, eventId: string): Promise<boolean>
}
