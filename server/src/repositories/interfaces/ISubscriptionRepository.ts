import { ISubscriptionPlan } from "../../models/subscriptionPlan";

export interface ISubscriptionRepository {
  getSubscriptions(page?: number, limit?: number): Promise<{
    subscriptions: ISubscriptionPlan[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;
  createSubscription(payload: { name: string; duration: string; price: number }): Promise<ISubscriptionPlan>;
  updateSubscription(id: string, payload: { name?: string; duration?: string; price?: number }): Promise<ISubscriptionPlan | null>;
  deleteSubscription(id: string): Promise<void>;
}
