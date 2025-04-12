import { ISavedEvent } from "../../models/savedEvents"

export interface ISavedEventService {
   getSavedEvents(userId: string): Promise<ISavedEvent[]>
   saveEvent(userId: string, eventId: string): Promise<boolean>
   removeSavedEvent(userId: string, eventId: string): Promise<boolean>
}
export interface SavedEventResponse {
   id: string;
   event: {
     _id: string;
     title: string;
     eventImage?: string;
     date?: string;
     startTime?: string;
     endTime?: string;
     venueName?: string;
     venueCity?: string;
   };
 } 