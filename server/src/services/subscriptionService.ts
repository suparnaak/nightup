import SubscriptionRepository  from "../repositories/subscriptionRepository";
import { ISubscriptionService } from "./interfaces/ISubscriptionService";
import { ISubscriptionPlan } from "../models/subscriptionPlan";

class SubscriptionService implements ISubscriptionService {
  async getSubscriptions(): Promise<ISubscriptionPlan[]> {
    return await SubscriptionRepository.getSubscriptions();
  }

  async createSubscription(payload: { name: string; duration: string; price: number }): Promise<ISubscriptionPlan> {
    return await SubscriptionRepository.createSubscription(payload);
  }

  async updateSubscription(
    id: string,
    payload: { name: string; duration: string; price: number }
  ): Promise<ISubscriptionPlan> {
    const subscription = await SubscriptionRepository.updateSubscription(id, payload);
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    return subscription;
  }

  async deleteSubscription(id: string): Promise<void> {
    await SubscriptionRepository.deleteSubscription(id);
  }
}

export default new SubscriptionService();
