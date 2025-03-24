import mongoose, { Schema, Document, Types } from "mongoose";

export interface IHost extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  hostType: string; 
  isVerified: boolean;
  isBlocked: boolean;
  documentUrl: string;
  subStatus: "Not Subscribed" | "Active" | "Expired";
  adminVerified: boolean;
  otp: string;
  otpExpiry?: Date;
  role?: 'user' | 'host' | 'admin';
}

const hostSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    hostType: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    documentUrl: { type: String, default: "" },
    adminVerified: { type: Boolean, default: false },
    subStatus: {
      type: String,
      enum: ["Not Subscribed", "Active", "Expired"],
      default: "Not Subscribed",
    },
    otp: { type: String, default: "" },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IHost>("Host", hostSchema);
