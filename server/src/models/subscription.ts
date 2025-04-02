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

/* subscriptionSchema.post("save", async function (doc: ISubscription) {
  try {
    const now = new Date();
    const newStatus: "Active" | "Expired" = now > doc.endDate ? "Expired" : "Active";
    await Host.findByIdAndUpdate(doc.host, { subStatus: newStatus });
  } catch (error) {
    console.error("Post-save hook error updating host subStatus:", error);
  }
}); */

export default mongoose.model<ISubscription>("Subscription", subscriptionSchema);
