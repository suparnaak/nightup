import { ISubscriptionPlan } from "../../models/subscriptionPlan";

export interface ISubscriptionRepository {
  getSubscriptions(): Promise<ISubscriptionPlan[]>;
  createSubscription(payload: { name: string; duration: string; price: number }): Promise<ISubscriptionPlan>;
  updateSubscription(id: string, payload: { name?: string; duration?: string; price?: number }): Promise<ISubscriptionPlan | null>;
  deleteSubscription(id: string): Promise<void>;
}
