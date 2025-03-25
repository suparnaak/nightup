import mongoose, { Schema, Document,  Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  googleId: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  otp: string;
  otpExpiry?: Date; 
  role?: 'user' | 'host' | 'admin';
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, default: "" },
    password: { type: String, required: false },
    googleId: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    otp: { type: String, default: '' },
    otpExpiry: { type: Date }, 
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
