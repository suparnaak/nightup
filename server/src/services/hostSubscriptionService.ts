import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { IHostSubscriptionRepository } from '../repositories/interfaces/IHostSubscriptionRepository';
import { ISubscription } from "../models/subscription";
import { ISubscriptionPlan } from "../models/subscriptionPlan";
import { IHostSubscriptionService } from "./interfaces/IHostSubscriptionService";
import Razorpay from "razorpay";
import { IPaymentService } from './interfaces/IPaymentService';
import { MESSAGES } from "../utils/constants";

@injectable()
export class HostSubscriptionService implements IHostSubscriptionService {
  constructor(
    @inject(TYPES.HostSubscriptionRepository)
    private hostSubscriptionRepository: IHostSubscriptionRepository,
    @inject(TYPES.PaymentService)
    private paymentService: IPaymentService
  ){}
  async getHostSubscription(hostId: string): Promise<ISubscription | null> {
    return await this.hostSubscriptionRepository.getHostSubscription(hostId);
  }

  async getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null> {
    return await this.hostSubscriptionRepository.getAvailableSubscriptions();
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
    const order = await this.paymentService.createOrder(options);
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
    const verified = await this.paymentService.verifyPayment(paymentData);
    if (verified) {
      const plan = await this.hostSubscriptionRepository.getSubscriptionPlanById(
        paymentData.planId
      );
      if (!plan) {
        throw new Error(MESSAGES.HOST.ERROR.NO_SUBSCRIPTION_PLAN);
      }
      let months = 1;
      if (plan.duration === "6 Months") months = 6;
      if (plan.duration === "Yearly") months = 12;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);

      await this.hostSubscriptionRepository.createSubscription({
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
    const subscription = await this.hostSubscriptionRepository.getSubscriptionById(
      currentSubscriptionId
    );

    if (!subscription) {
      throw new Error(MESSAGES.HOST.ERROR.NO_SUBSCRIPTION_PLAN);
    }

    if (subscription.host.toString() !== hostId) {
      throw new Error(MESSAGES.HOST.ERROR.NOT_YOUR_SUBSCRIPTION_PLAN);
    }

    const newPlan = await this.hostSubscriptionRepository.getSubscriptionPlanById(
      planId
    );
    if (!newPlan) {
      throw new Error(MESSAGES.HOST.ERROR.NO_SUBSCRIPTION_PLAN);
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

    const order = await this.paymentService.createOrder(options);
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

    const verified = await this.paymentService.verifyPayment(signatureData);

    if (!verified) {
      return { success: false };
    }

    const currentSubscription =
      await this.hostSubscriptionRepository.getSubscriptionById(
        paymentData.currentSubscriptionId
      );

    if (!currentSubscription) {
      throw new Error(MESSAGES.HOST.ERROR.INVALID_SUBSCRIPTION);
    }

    if (currentSubscription.host.toString() !== hostId) {
      throw new Error(MESSAGES.HOST.ERROR.UNAUTHORISED_SUBSCRIPTION);
    }

    const newPlan = await this.hostSubscriptionRepository.getSubscriptionPlanById(
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

    await this.hostSubscriptionRepository.updateSubscription(
      paymentData.currentSubscriptionId,
      {
        status: "Expired",
        endDate: startDate,
        subscriptionPlan: subscriptionPlanId,
        startDate: new Date(currentSubscription.startDate),
      }
    );

    const originalAmount = newPlan.price;

    const newSubscription = await this.hostSubscriptionRepository.createSubscription(
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

