import Subscription, { ISubscription } from "../models/subscription";
import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";
import { IHostSubscriptionRepository } from "./interfaces/IHostSubscriptionRepository";

class HostSubscriptionRepository implements IHostSubscriptionRepository {
  async getHostSubscription(hostId: string): Promise<ISubscription | null> {
    //return await Subscription.findOne({ host: hostId }).sort({ createdAt: -1 });
    return await Subscription.findOne({ host: hostId })
      .sort({ createdAt: -1 })
      .populate("subscriptionPlan");
  
  }
  async getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null> {
    const subscriptionPlans = await SubscriptionPlan.find().sort({ createdAt: -1 }).lean();
    return subscriptionPlans as ISubscriptionPlan[]
  }
  async getSubscriptionPlanById(planId: string): Promise<ISubscriptionPlan | null> {
    return await SubscriptionPlan.findById(planId).lean();
  }
  async createSubscription(payload: {
    host: string;
    subscriptionPlan: string;
    startDate: Date;
    endDate: Date;
    status: "Active" | "Expired";
    paymentId?: string;
  }): Promise<ISubscription> {
    const newSubscription = new Subscription({
      host: payload.host,
      subscriptionPlan: payload.subscriptionPlan,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status,
      paymentId: payload.paymentId,
    });
    return await newSubscription.save();
  }
}

export default new HostSubscriptionRepository();
