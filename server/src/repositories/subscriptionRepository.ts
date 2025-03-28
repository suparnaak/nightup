import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";
import { ISubscriptionRepository } from "./interfaces/ISubscriptionRepository";

export const subscriptionRepository: ISubscriptionRepository = {
  getSubscriptions: async (): Promise<ISubscriptionPlan[]> => {
    return await SubscriptionPlan.find().sort({ createdAt: -1 });
  },
  createSubscription: async (payload: { name: string; duration: string; price: number }): Promise<ISubscriptionPlan> => {
    const subscription = new SubscriptionPlan(payload);
    return await subscription.save();
  },
  updateSubscription: async (
    id: string,
    payload: { name?: string; duration?: string; price?: number }
  ): Promise<ISubscriptionPlan | null> => {
    return await SubscriptionPlan.findByIdAndUpdate(id, payload, { new: true });
  },
  deleteSubscription: async (id: string): Promise<void> => {
    await SubscriptionPlan.findByIdAndDelete(id);
  },
};

export default subscriptionRepository;
