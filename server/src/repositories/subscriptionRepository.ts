/* import "reflect-metadata";
import { injectable } from "inversify";
import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";
import { ISubscriptionRepository } from "./interfaces/ISubscriptionRepository";

@injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
 
  async getSubscriptions(): Promise<ISubscriptionPlan[]> {
    return SubscriptionPlan.find().sort({ createdAt: -1 });
  }

  
  async createSubscription(
    payload: { name: string; duration: string; price: number }
  ): Promise<ISubscriptionPlan> {
    const subscription = new SubscriptionPlan(payload);
    return subscription.save();
  }

  
  async updateSubscription(
    id: string,
    payload: { name?: string; duration?: string; price?: number }
  ): Promise<ISubscriptionPlan | null> {
    return SubscriptionPlan.findByIdAndUpdate(id, payload, { new: true });
  }

  async deleteSubscription(id: string): Promise<void> {
    await SubscriptionPlan.findByIdAndDelete(id);
  }
}
 */
import "reflect-metadata";
import { injectable } from "inversify";
import SubscriptionPlan, { ISubscriptionPlan } from "../models/subscriptionPlan";
import { ISubscriptionRepository } from "./interfaces/ISubscriptionRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

@injectable()
export class SubscriptionRepository extends BaseRepository<ISubscriptionPlan> implements ISubscriptionRepository {
  constructor() {
    super(SubscriptionPlan);
  }

  
  async getSubscriptions(): Promise<ISubscriptionPlan[]> {
    return await SubscriptionPlan.find().sort({ createdAt: -1 });
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