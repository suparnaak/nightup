import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { ICouponRepository } from '../repositories/interfaces/ICouponRepository';
import { ICoupon } from "../models/coupon";
import { ICouponService } from "./interfaces/ICouponService";

@injectable()
export class CouponService implements ICouponService {
  constructor(
    @inject(TYPES.CouponRepository)
    private couponRepository:ICouponRepository
  ){}

 async getCoupons(page?: number, limit?: number): Promise<{
    coupons: ICoupon[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }> {
    return await this.couponRepository.getCoupons(page, limit);
  }

  async createCoupon(payload: {
    couponCode: string;
    couponAmount: number;
    minimumAmount: number;
    startDate: Date;
    endDate: Date;
    couponQuantity: number;
  }): Promise<ICoupon> {
    return await this.couponRepository.createCoupon(payload);
  }

  async updateCoupon(
    id: string,
    payload: Partial<{
      couponAmount: number;
      minimumAmount: number;
      startDate: Date;
      endDate: Date;
      couponQuantity: number;
    }>
  ): Promise<ICoupon> {
    const coupon = await this.couponRepository.updateCoupon(id, payload);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    return coupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    await this.couponRepository.deleteCoupon(id);
  }

  async getAvailableCoupons(
    userId: string,
    minimumAmount?: number
  ): Promise<ICoupon[]> {
    return await this.couponRepository.getAvailableCoupons(userId, minimumAmount);
  }
}

