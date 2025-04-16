
import mongoose, { Schema, Document, Types } from "mongoose";
import Host from "./host";
import { ISubscriptionPlan } from "./subscriptionPlan";

export interface ISubscription extends Document {
  host: Types.ObjectId;
  subscriptionPlan: Types.ObjectId | ISubscriptionPlan;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Expired";
  paymentId?: string;
  isUpgrade: boolean;
  upgradedFrom?: Types.ObjectId;
  proratedAmount?: number;
  originalAmount?: number;
  transactionType: "New" | "Renewal" | "Upgrade";
}

const subscriptionSchema: Schema = new Schema(
  {
    host: { type: Schema.Types.ObjectId, ref: "Host", required: true },
    subscriptionPlan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Expired"],
      default: "Active"
    },
    paymentId: { type: String },
    isUpgrade: { type: Boolean, default: false },
    upgradedFrom: { type: Schema.Types.ObjectId, ref: "Subscription" },
    proratedAmount: { type: Number },
    originalAmount: { type: Number },
    transactionType: {
      type: String,
      enum: ["New", "Renewal", "Upgrade"],
      default: "New"
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>("Subscription", subscriptionSchema);