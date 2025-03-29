// src/services/hostSubscriptionService.ts
import HostSubscriptionRepository from "../repositories/hostSubscriptionRepository";
import { ISubscription } from "../models/subscription";
import { ISubscriptionPlan} from "../models/subscriptionPlan"

class HostSubscriptionService {
  async getHostSubscription(hostId: string): Promise<ISubscription | null> {
    // Retrieve the most recent subscription for the host
    /* const subscription =  */ return await HostSubscriptionRepository.getHostSubscription(hostId);
    //return subscription;
  }
  async getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null> {
    // Retrieve the most recent subscription for the host
    /* const subscriptionPlans = await HostSubscriptionRepository.getAvailableSubscriptions();
    return subscriptionPlans; */
    return await HostSubscriptionRepository.getAvailableSubscriptions()
  }
}

export default new HostSubscriptionService();
