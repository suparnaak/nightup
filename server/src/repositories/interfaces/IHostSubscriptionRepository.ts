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
      isUpgrade?: boolean;   
      upgradedFrom?: string;
      proratedAmount?: number;
      originalAmount?: number;
      transactionType?: "New" | "Renewal" | "Upgrade";
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
       /*  import { IBaseRepository } from "../baseRepository/IBaseRepository";
        import { ISubscription } from "../../models/subscription";
        import { ISubscriptionPlan } from "../../models/subscriptionPlan";
        
        export interface IHostSubscriptionRepository extends IBaseRepository<ISubscription> {
          getHostSubscription(hostId: string): Promise<ISubscription | null>;
          getAvailableSubscriptions(): Promise<ISubscriptionPlan[]>;
          getSubscriptionPlanById(planId: string): Promise<ISubscriptionPlan | null>;
          createSubscription(payload: {
            host: string;
            subscriptionPlan: string;
            startDate: Date;
            endDate: Date;
            status: "Active" | "Expired";
            paymentId?: string;
            isUpgrade?: boolean;
            upgradedFrom?: string;
            proratedAmount?: number;
            originalAmount?: number;
            transactionType?: "New" | "Renewal" | "Upgrade";
          }): Promise<ISubscription>;
          getSubscriptionById(subscriptionId: string): Promise<ISubscription | null>;
          updateSubscription(
            subscriptionId: string,
            updateData: {
              subscriptionPlan: string;
              startDate: Date;
              endDate: Date;
              status: "Active" | "Expired";
              paymentId?: string;
            }
          ): Promise<ISubscription | null>;
        } */