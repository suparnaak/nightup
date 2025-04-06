import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBooking extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  tickets: { ticketType: string; quantity: number; price: number }[];
  couponId?: Types.ObjectId | null;
  totalAmount: number;
  discountedAmount: number;
  status: "pending" | "confirmed";
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  tickets: [
    {
      ticketType: String,
      quantity: Number,
      price: Number,
    },
  ],
  couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
  totalAmount: { type: Number, required: true },
  discountedAmount: { type: Number, required: true },
  status: { type: String, enum: ["pending","confirmed"], default: "pending" },
}, { timestamps: true });

export default mongoose.model<IBooking>("Booking", bookingSchema);
