import { ISubscription } from "../../models/subscription";
import { ISubscriptionPlan } from "../../models/subscriptionPlan";

export interface IHostSubscriptionRepository {
    getHostSubscription(hostId: string): Promise<ISubscription | null>
    getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null>
    getSubscriptionPlanById(planId: string): Promise<ISubscriptionPlan | null>
    createSubscription(payload: {
        host: string;
        subscriptionPlan: string;
        startDate: Date;
        endDate: Date;
        status: "Active" | "Expired";
        paymentId?: string;
      }): Promise<ISubscription>
      getSubscriptionById(subscriptionId: string): Promise<ISubscription | null>
      updateSubscription(
          subscriptionId: string,
          updateData: {
            subscriptionPlan: string;
            startDate: Date;
            endDate: Date;
            status: "Active" | "Expired";
            paymentId?: string;
          }
        ): Promise<ISubscription | null>

}