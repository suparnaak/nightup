import { ISubscriptionPlan } from "../../models/subscriptionPlan";

export interface ISubscriptionService {
  getSubscriptions(): Promise<ISubscriptionPlan[]>;
  createSubscription(payload: {
    name: string;
    duration: string;
    price: number;
  }): Promise<ISubscriptionPlan>;
  updateSubscription(
    id: string,
    payload: { name: string; duration: string; price: number }
  ): Promise<ISubscriptionPlan>;
  deleteSubscription(id: string): Promise<void>;
}
