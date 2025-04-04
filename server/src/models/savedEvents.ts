// models/SavedEvent.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISavedEvent extends Document {
  user: mongoose.Types.ObjectId; // Reference to the user who saved the event
  event: mongoose.Types.ObjectId; // The unique id of the event (renamed to match usage)
  title: string;                 // Event title
  eventImage?: string;           // Optional image URL for the event
  date?: Date;                   // Optional event date
}

const savedEventSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true }, // Changed from eventId to event
    title: { type: String, required: true },
    eventImage: { type: String },
    date: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ISavedEvent>("SavedEvent", savedEventSchema);