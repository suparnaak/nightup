/* import mongoose from "mongoose";

const eventTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    
  },
  {
    timestamps: true, 
  }
);

export const EventType = mongoose.model("EventType", eventTypeSchema);
 */
import mongoose, { Document, Schema } from "mongoose";

// Step 1: Define the interface
export interface IEventTypeDocument extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Step 2: Define the schema
const eventTypeSchema: Schema<IEventTypeDocument> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Step 3: Export the model
export const EventType = mongoose.model<IEventTypeDocument>("EventType", eventTypeSchema);
