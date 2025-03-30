import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  duration: string; 
  price: number;
}

const subscriptionPlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscriptionPlan>("SubscriptionPlan", subscriptionPlanSchema);
