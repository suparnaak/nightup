// src/models/coupon.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  couponCode: string;
  couponAmount: number;
  minimumAmount: number;
  startDate: Date;
  endDate: Date;
  couponQuantity: number;
  usedCount: number;
  status: "inactive" | "active" | "expired";
  isBlocked: boolean;    // new field
}

const couponSchema: Schema = new Schema(
  {
    couponCode: { type: String, required: true, unique: true },
    couponAmount: { type: Number, required: true },
    minimumAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    couponQuantity: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["inactive", "active", "expired"],
      default: function (this: ICoupon) {
        const now = new Date();
        if (now < this.startDate) return "inactive";
        if (now > this.endDate) return "expired";
        return "active";
      },
    },
    isBlocked: { type: Boolean, default: false },  // added here
  },
  { timestamps: true }
);

// Pre-find middleware to update coupon status when retrieving coupons.
// This will update status before returning documents
couponSchema.pre("find", async function() {
  const now = new Date();
  
  // Activate coupons whose startDate has arrived
  await mongoose.model("Coupon").updateMany(
    { status: "inactive", startDate: { $lte: now } },
    { status: "active" }
  );
  
  // Expire coupons whose endDate has passed
  await mongoose.model("Coupon").updateMany(
    { status: "active", endDate: { $lte: now } },
    { status: "expired" }
  );
});

export default mongoose.model<ICoupon>("Coupon", couponSchema);
