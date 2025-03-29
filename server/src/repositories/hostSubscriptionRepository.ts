// src/repositories/hostSubscriptionRepository.ts
import Subscription, { ISubscription } from "../models/subscription";
import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";

class HostSubscriptionRepository {
  async getHostSubscription(hostId: string): Promise<ISubscription | null> {
    // Query for the latest subscription record for the given host
    return await Subscription.findOne({ host: hostId }).sort({ createdAt: -1 });
  }
  async getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null> {
    // Query for the latest subscription record for the given host
    const subscriptionPlans = await SubscriptionPlan.find().sort({ createdAt: -1 }).lean();
    return subscriptionPlans as ISubscriptionPlan[]
  }
}

export default new HostSubscriptionRepository();
