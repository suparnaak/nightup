import HostSubscriptionRepository from "../repositories/hostSubscriptionRepository";
import { ISubscription } from "../models/subscription";
import { ISubscriptionPlan} from "../models/subscriptionPlan"
import { IHostSubscriptionService } from "./interfaces/IHostSubscriptionService";
import Razorpay from "razorpay";
import * as PaymentService from "./paymentService";

class HostSubscriptionService implements IHostSubscriptionService {

  async getHostSubscription(hostId: string): Promise<ISubscription | null> {
    
    return await HostSubscriptionRepository.getHostSubscription(hostId);
    
  }

  async getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null> {
    
    return await HostSubscriptionRepository.getAvailableSubscriptions()
  }

  async createOrder(hostId: string, planId: string, amount: number): Promise<{ id: string }> {
    console.log("service create order")
    const shortHostId = hostId.slice(0, 6);
    const shortPlanId = planId.slice(0, 6);
    const timestamp = Date.now().toString().slice(-4);
    
    const receipt = `rcpt_${shortHostId}_${shortPlanId}_${timestamp}`;
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt,
    };
    const order = await PaymentService.createOrder(options);
    return order;
  }

  async verifyPayment(hostId: string, paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    planId: string;
  }): Promise<boolean> {
    const verified = await PaymentService.verifyPayment(paymentData);
    if (verified) {

      const plan = await HostSubscriptionRepository.getSubscriptionPlanById(paymentData.planId);
      if (!plan) {
        throw new Error("Subscription plan not found");
      }
      let months = 1;
      if (plan.duration === "6 Months") months = 6;
      if (plan.duration === "Yearly") months = 12;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);

      await HostSubscriptionRepository.createSubscription({
        host: hostId,
        subscriptionPlan: paymentData.planId,
        startDate,
        endDate,
        status: "Active",
        paymentId: paymentData.razorpay_payment_id,
      });
      return true;
    } else {
      return false;
    }
  }
}

export default new HostSubscriptionService();
