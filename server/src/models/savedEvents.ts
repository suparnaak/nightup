import mongoose, { Schema, Document } from "mongoose";

export interface ISavedEvent extends Document {
  user: mongoose.Types.ObjectId;
  event: {
    _id: mongoose.Types.ObjectId;
    title: string;
    eventImage?: string;
    date?: Date;
    startTime?: Date;
    endTime?: Date;
    venueName?: string;
    venueCity?: string;
  };
}

const savedEventSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true }, 
    title: { type: String, required: true },
    eventImage: { type: String },
    date: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ISavedEvent>("SavedEvent", savedEventSchema);