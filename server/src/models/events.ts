import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEventDocument extends Document {
  title: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  hostId: Types.ObjectId; 
  venueName: string;
  venueCity: string;
  venueState: string;
  venueZip: string;
  venueCapacity: number;
  category: string;
  artist: string;
  description: string;
  tickets: {
    ticketType: string;
    ticketPrice: number;
    ticketCount: number;
  }[];
  eventImage: string; 
  additionalDetails?: string;
  isBlocked: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number]; 
  };
}

const eventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    date: { type: Date, required: true },
    hostId: { type: Schema.Types.ObjectId, ref: "Host", required: true },
    venueName: { type: String, required: true },
    venueCity: { type: String, required: true },
    venueState: { type: String, required: true },
    venueZip: { type: String, required: true },
    venueCapacity: { type: Number, required: true },
    category: { type: String, required: true },
    artist: { type: String, required: true },
    description: { type: String, required: true },
    tickets: [
      {
        ticketType: { type: String, required: true },
        ticketPrice: { type: Number, required: true },
        ticketCount: { type: Number, required: true },
      },
    ],
    eventImage: { type: String },
    additionalDetails: { type: String },
    isBlocked: { type: Boolean, default: false },
    
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
  },
  { timestamps: true }
);


eventSchema.index({ location: "2dsphere" });

export default mongoose.model<IEventDocument>("Event", eventSchema);
