import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { ISubscriptionRepository } from '../repositories/interfaces/ISubscriptionRepository';
import { ISubscriptionService } from "./interfaces/ISubscriptionService";
import { ISubscriptionPlan } from "../models/subscriptionPlan";
import { MESSAGES } from "../utils/constants";

@injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject(TYPES.SubscriptionRepository)
    private subscriptionRepository: ISubscriptionRepository
  ){}
  /* async getSubscriptions(): Promise<ISubscriptionPlan[]> {
    return await this.subscriptionRepository.getSubscriptions();
  } */
 async getSubscriptions(page?: number, limit?: number): Promise<{
    subscriptions: ISubscriptionPlan[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }> {
    return await this.subscriptionRepository.getSubscriptions(page, limit);
  }

  async createSubscription(payload: { name: string; duration: string; price: number }): Promise<ISubscriptionPlan> {
    return await this.subscriptionRepository.createSubscription(payload);
  }

  async updateSubscription(
    id: string,
    payload: { name: string; duration: string; price: number }
  ): Promise<ISubscriptionPlan> {
    const subscription = await this.subscriptionRepository.updateSubscription(id, payload);
    if (!subscription) {
      throw new Error(MESSAGES.ADMIN.ERROR.NO_SUBSCRIPTION_FOUND);
    }
    return subscription;
  }

  async deleteSubscription(id: string): Promise<void> {
    await this.subscriptionRepository.deleteSubscription(id);
  }
}

//export default new SubscriptionService();
