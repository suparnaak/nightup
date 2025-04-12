import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  role?: 'user' | 'host' | 'admin';
}

const adminSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: "" }, 
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", adminSchema);
