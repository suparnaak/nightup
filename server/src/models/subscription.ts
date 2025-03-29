// src/models/subscription.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import Host from "./host";

export interface ISubscription extends Document {
  host: Types.ObjectId;                 // Reference to the host who subscribed
  subscriptionPlan: Types.ObjectId;     // Reference to the plan from admin's SubscriptionPlan model
  startDate: Date;                      // When the subscription starts (after payment)
  endDate: Date;                        // When the subscription expires
  status: "Active" | "Expired";         // Subscription status
  paymentId?: string;                   // Optional: Payment ID from Razorpay
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
  },
  { timestamps: true }
);

// Remove the pre-save middleware and add a post-save middleware.
// This middleware runs after a subscription is saved.
// It checks the current date and then updates the corresponding host's subStatus.
subscriptionSchema.post("save", async function (doc: ISubscription) {
  try {
    const now = new Date();
    const newStatus: "Active" | "Expired" = now > doc.endDate ? "Expired" : "Active";
    await Host.findByIdAndUpdate(doc.host, { subStatus: newStatus });
  } catch (error) {
    console.error("Post-save hook error updating host subStatus:", error);
  }
});

export default mongoose.model<ISubscription>("Subscription", subscriptionSchema);
