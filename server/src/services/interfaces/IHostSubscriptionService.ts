import { ISubscription } from "../../models/subscription";
import { ISubscriptionPlan } from "../../models/subscriptionPlan";
export interface IHostSubscriptionService {
    getHostSubscription(hostId: string): Promise<ISubscription | null>
    getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null>
    createOrder(hostId: string, planId: string, amount: number): Promise<{ id: string }>
    verifyPayment(hostId: string, paymentData: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
        planId: string;
      }): Promise<boolean>
      createUpgradeOrder(
        hostId: string,
        planId: string,
        amount: number,
        currentSubscriptionId: string
      ): Promise<{ id: string }>
      verifyUpgradePayment(
        hostId: string,
        paymentData: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
          planId: string;
          currentSubscriptionId: string;
        }
      ): Promise<{ 
        success: boolean;
        subscription?: ISubscription;
      }>

}