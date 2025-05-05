/* import Subscription, { ISubscription } from "../models/subscription";
import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";
import { IHostSubscriptionRepository } from "./interfaces/IHostSubscriptionRepository";

export class HostSubscriptionRepository implements IHostSubscriptionRepository {
  async getHostSubscription(hostId: string): Promise<ISubscription | null> {
    //return await Subscription.findOne({ host: hostId }).sort({ createdAt: -1 });
    return await Subscription.findOne({ host: hostId })
      .sort({ createdAt: -1 })
      .populate("subscriptionPlan");
  
  }
  async getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null> {
    const subscriptionPlans = await SubscriptionPlan.find().sort({ createdAt: -1 }).lean();
    return subscriptionPlans as ISubscriptionPlan[]
  }
  async getSubscriptionPlanById(planId: string): Promise<ISubscriptionPlan | null> {
    return await SubscriptionPlan.findById(planId).lean();
  }
 
    async createSubscription(payload: {
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
    }): Promise<ISubscription> {
      const newSubscription = new Subscription({
        host: payload.host,
        subscriptionPlan: payload.subscriptionPlan,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: payload.status,
        paymentId: payload.paymentId,
        isUpgrade: payload.isUpgrade || false,
        upgradedFrom: payload.upgradedFrom,
        proratedAmount: payload.proratedAmount,
        originalAmount: payload.originalAmount,
        transactionType: payload.transactionType || "New"
      });
      return await newSubscription.save();
    }
  async getSubscriptionById(subscriptionId: string): Promise<ISubscription | null> {
    return await Subscription.findById(subscriptionId)
      .populate("subscriptionPlan")
      .lean();
  }
  async updateSubscription(
    subscriptionId: string,
    updateData: {
      subscriptionPlan: string;
      startDate: Date;
      endDate: Date;
      status: "Active" | "Expired";
      paymentId?: string;
    }
  ): Promise<ISubscription | null> {
    return await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        subscriptionPlan: updateData.subscriptionPlan,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
        status: updateData.status,
        paymentId: updateData.paymentId
      },
      { new: true }
    ).populate("subscriptionPlan");
  }
}

//export default new HostSubscriptionRepository();
 */
/* import { Types } from "mongoose";
import Subscription, { ISubscription } from "../models/subscription";
import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";
import { IHostSubscriptionRepository } from "./interfaces/IHostSubscriptionRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

export class HostSubscriptionRepository
  extends BaseRepository<ISubscription>
  implements IHostSubscriptionRepository
{
  constructor() {
    super(Subscription);
  }

  async getHostSubscription(hostId: string): Promise<ISubscription | null> {
    return this.model
      .findOne({ host: hostId })
      .sort({ createdAt: -1 })
      .populate("subscriptionPlan")
      .lean() as Promise<ISubscription | null>;
  }

  async getAvailableSubscriptions(): Promise<ISubscriptionPlan[]> {
    return this.model.db
      .model<ISubscriptionPlan>("SubscriptionPlan")
      .find()
      .sort({ createdAt: -1 })
      .lean();
  }

  async getSubscriptionPlanById(
    planId: string
  ): Promise<ISubscriptionPlan | null> {
    return this.model.db
      .model<ISubscriptionPlan>("SubscriptionPlan")
      .findById(planId)
      .lean();
  }

  async createSubscription(
    payload: {
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
    }
  ): Promise<ISubscription> {
    return super.create(payload as any);
  }

  async getSubscriptionById(
    subscriptionId: string
  ): Promise<ISubscription | null> {
    return this.model
      .findById(subscriptionId)
      .populate("subscriptionPlan")
      .lean() as Promise<ISubscription | null>;
  }

  async updateSubscription(
    subscriptionId: string,
    updateData: {
      subscriptionPlan: string;
      startDate: Date;
      endDate: Date;
      status: "Active" | "Expired";
      paymentId?: string;
    }
  ): Promise<ISubscription | null> {
    return this.model
      .findByIdAndUpdate(subscriptionId, updateData, { new: true })
      .populate("subscriptionPlan")
      .lean() as Promise<ISubscription | null>;
  }
} */
  import { BaseRepository } from "./baseRepository/baseRepository";
  import Subscription, { ISubscription } from "../models/subscription";
  import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";
  import { IHostSubscriptionRepository } from "./interfaces/IHostSubscriptionRepository";
  import { Types } from "mongoose";
  
  export class HostSubscriptionRepository extends BaseRepository<ISubscription> implements IHostSubscriptionRepository {
    constructor() {
      super(Subscription);
    }
  
    async getHostSubscription(hostId: string): Promise<ISubscription | null> {
      return await this.model.findOne({ host: hostId })
        .sort({ createdAt: -1 })
        .populate("subscriptionPlan");
    }
  
    async getAvailableSubscriptions(): Promise<ISubscriptionPlan[] | null> {
      const subscriptionPlans = await SubscriptionPlan.find().sort({ createdAt: -1 }).lean();
      return subscriptionPlans as ISubscriptionPlan[];
    }
  
    async getSubscriptionPlanById(planId: string): Promise<ISubscriptionPlan | null> {
      return await SubscriptionPlan.findById(planId).lean();
    }
   
    async createSubscription(payload: {
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
    }): Promise<ISubscription> {
      return await this.create({
        host: new Types.ObjectId(payload.host),
        subscriptionPlan: new Types.ObjectId(payload.subscriptionPlan),
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: payload.status,
        paymentId: payload.paymentId,
        isUpgrade: payload.isUpgrade || false,
        upgradedFrom: payload.upgradedFrom ? new Types.ObjectId(payload.upgradedFrom) : undefined,
        proratedAmount: payload.proratedAmount,
        originalAmount: payload.originalAmount,
        transactionType: payload.transactionType || "New"
      });
    }
  
    async getSubscriptionById(subscriptionId: string): Promise<ISubscription | null> {
      const subscription = await this.findById(subscriptionId);
      if (subscription) {
        await subscription.populate("subscriptionPlan");
      }
      return subscription;
    }
  
    async updateSubscription(
      subscriptionId: string,
      updateData: {
        subscriptionPlan: string;
        startDate: Date;
        endDate: Date;
        status: "Active" | "Expired";
        paymentId?: string;
      }
    ): Promise<ISubscription | null> {
      const updatedSubscription = await this.update(subscriptionId, {
        subscriptionPlan: new Types.ObjectId(updateData.subscriptionPlan),
        startDate: updateData.startDate,
        endDate: updateData.endDate,
        status: updateData.status,
        paymentId: updateData.paymentId
      });
      
      if (updatedSubscription) {
        await updatedSubscription.populate("subscriptionPlan");
      }
      
      return updatedSubscription;
    }
  }