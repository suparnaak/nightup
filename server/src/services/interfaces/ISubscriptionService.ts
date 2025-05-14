import { ISubscriptionPlan } from "../../models/subscriptionPlan";

export interface ISubscriptionService {
  //getSubscriptions(): Promise<ISubscriptionPlan[]>;
  getSubscriptions(page?: number, limit?: number): Promise<{
    subscriptions: ISubscriptionPlan[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;
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
