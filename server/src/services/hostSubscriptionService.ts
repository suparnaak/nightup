import HostSubscriptionRepository from "../repositories/hostSubscriptionRepository";
import { ISubscription } from "../models/subscription";
import { ISubscriptionPlan } from "../models/subscriptionPlan";
import { IHostSubscriptionService } from "./interfaces/IHostSubscriptionService";
import Razorpay from "razorpay";
import * as PaymentService from "./paymentService";
import { MESSAGES } from "../utils/constants";

class HostSubscriptionService implements IHostSubscriptionService {
  async getHostSubscription(hostId: string): Promise<ISubscription | null> {
    return await HostSubscriptionRepository.getHostSubscription(hostId);
  }

  async getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null> {
    return await HostSubscriptionRepository.getAvailableSubscriptions();
  }

  async createOrder(
    hostId: string,
    planId: string,
    amount: number
  ): Promise<{ id: string }> {
    console.log("service create order");
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

  async verifyPayment(
    hostId: string,
    paymentData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      planId: string;
    }
  ): Promise<boolean> {
    const verified = await PaymentService.verifyPayment(paymentData);
    if (verified) {
      const plan = await HostSubscriptionRepository.getSubscriptionPlanById(
        paymentData.planId
      );
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

  //upgrade plan
  async createUpgradeOrder(
    hostId: string,
    planId: string,
    amount: number,
    currentSubscriptionId: string
  ): Promise<{ id: string }> {
    const subscription = await HostSubscriptionRepository.getSubscriptionById(
      currentSubscriptionId
    );

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.host.toString() !== hostId) {
      throw new Error("Unauthorized: This subscription does not belong to you");
    }

    const newPlan = await HostSubscriptionRepository.getSubscriptionPlanById(
      planId
    );
    if (!newPlan) {
      throw new Error("Invalid subscription plan");
    }

    const shortHostId = hostId.slice(0, 6);
    const shortPlanId = planId.slice(0, 6);
    const timestamp = Date.now().toString().slice(-4);

    const receipt = `upgrade_${shortHostId}_${shortPlanId}_${timestamp}`;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt,
      notes: {
        type: "upgrade",
        currentSubscriptionId,
      },
    };

    const order = await PaymentService.createOrder(options);
    return order;
  }
  async verifyUpgradePayment(
    hostId: string,
    paymentData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
      planId: string;
      currentSubscriptionId: string;
      proratedAmount?: number;
    }
  ): Promise<{
    success: boolean;
    subscription?: ISubscription;
  }> {
    const signatureData = {
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_signature: paymentData.razorpay_signature,
    };

    const verified = await PaymentService.verifyPayment(signatureData);

    if (!verified) {
      return { success: false };
    }

    const currentSubscription =
      await HostSubscriptionRepository.getSubscriptionById(
        paymentData.currentSubscriptionId
      );

    if (!currentSubscription) {
      throw new Error(MESSAGES.HOST.ERROR.INVALID_SUBSCRIPTION);
    }

    if (currentSubscription.host.toString() !== hostId) {
      throw new Error(MESSAGES.HOST.ERROR.UNAUTHORISED_SUBSCRIPTION);
    }

    const newPlan = await HostSubscriptionRepository.getSubscriptionPlanById(
      paymentData.planId
    );
    if (!newPlan) {
      throw new Error(MESSAGES.HOST.ERROR.INVALID_SUBSCRIPTION);
    }

    let months = 1;
    if (newPlan.duration === "6 Months") months = 6;
    if (newPlan.duration === "Yearly") months = 12;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    let subscriptionPlanId: string;

    const subscriptionPlan = currentSubscription.subscriptionPlan as unknown;

    if (typeof subscriptionPlan === "object" && subscriptionPlan !== null) {
      const planObject = subscriptionPlan as { _id?: { toString(): string } };
      if (planObject._id && typeof planObject._id.toString === "function") {
        subscriptionPlanId = planObject._id.toString();
      } else {
        const mongooseDoc = subscriptionPlan as {
          id?: string;
          toString(): string;
        };
        subscriptionPlanId = mongooseDoc.id || mongooseDoc.toString();
      }
    } else {
      subscriptionPlanId = String(subscriptionPlan);
    }

    await HostSubscriptionRepository.updateSubscription(
      paymentData.currentSubscriptionId,
      {
        status: "Expired",
        endDate: startDate,
        subscriptionPlan: subscriptionPlanId,
        startDate: new Date(currentSubscription.startDate),
      }
    );

    const originalAmount = newPlan.price;

    const newSubscription = await HostSubscriptionRepository.createSubscription(
      {
        host: hostId,
        subscriptionPlan: paymentData.planId,
        startDate,
        endDate,
        status: "Active",
        paymentId: paymentData.razorpay_payment_id,
        isUpgrade: true,
        upgradedFrom: paymentData.currentSubscriptionId,
        proratedAmount: paymentData.proratedAmount || 0,
        originalAmount,
        transactionType: "Upgrade",
      }
    );

    if (!newSubscription) {
      throw new Error(MESSAGES.HOST.ERROR.SUBSCRIPTION_FAILED);
    }

    return {
      success: true,
      subscription: newSubscription,
    };
  }
}

export default new HostSubscriptionService();
