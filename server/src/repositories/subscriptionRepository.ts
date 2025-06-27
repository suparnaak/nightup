import { injectable } from "inversify";
import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";
import { ISubscriptionRepository } from "./interfaces/ISubscriptionRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

@injectable()
export class SubscriptionRepository extends BaseRepository<ISubscriptionPlan> implements ISubscriptionRepository {
  constructor() {
    super(SubscriptionPlan);
  }

  async getSubscriptions(page: number = 1, limit: number = 10): Promise<{
    subscriptions: ISubscriptionPlan[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      SubscriptionPlan.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      SubscriptionPlan.countDocuments()
    ]);
    
    return {
      subscriptions,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
  }

 
  async createSubscription(
    payload: { name: string; duration: string; price: number }
  ): Promise<ISubscriptionPlan> {
    return await this.create(payload);
  }

  async updateSubscription(
    id: string,
    payload: { name?: string; duration?: string; price?: number }
  ): Promise<ISubscriptionPlan | null> {
    return await this.update(id, payload);
  }


  async deleteSubscription(id: string): Promise<void> {
    await this.delete(id);
  }
}