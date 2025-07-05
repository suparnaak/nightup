import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBooking extends Document {
    _id: Types.ObjectId;
  
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  tickets: { ticketType: string; quantity: number; price: number }[];
  couponId?: Types.ObjectId | null;
  totalAmount: number;
  discountedAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentMethod: "razorpay" | "wallet";
  paymentStatus: "paid" | "pending" | "refunded";
  paymentId: string;
  ticketNumber: string;
  platformFee: number;
  cancellation?: {
    cancelledBy: "user" | "host";
    cancelledAt: Date;
    reason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    tickets: [
      {
        ticketType: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    totalAmount: { type: Number, required: true },
    discountedAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    platformFee:   { type: Number, required: true, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "refunded"],
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    cancellation: {
      cancelledBy: {
        type: String,
        enum: ["user", "host"],
      },
      cancelledAt: Date,
      reason: String,
    },
  },
  { timestamps: true }
);



export default mongoose.model<IBooking>("Booking", bookingSchema);
