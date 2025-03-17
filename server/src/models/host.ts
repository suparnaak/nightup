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
  subStatus: boolean;
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
    subStatus: { type: Boolean, default: false },
    otp: { type: String, default: '' },
    otpExpiry: { type: Date },
    
  },
  { timestamps: true }
);

export default mongoose.model<IHost>("Host", hostSchema);
