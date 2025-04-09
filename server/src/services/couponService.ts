import CouponRepository from "../repositories/couponRepository";
import { ICoupon } from "../models/coupon";
import { ICouponService } from "./interfaces/ICouponService";

class CouponService implements ICouponService {
  async getCoupons(): Promise<ICoupon[]> {
    return await CouponRepository.getCoupons();
  }

  async createCoupon(payload: {
    couponCode: string;
    couponAmount: number;
    minimumAmount: number;
    startDate: Date;
    endDate: Date;
    couponQuantity: number;
  }): Promise<ICoupon> {
    return await CouponRepository.createCoupon(payload);
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
    const coupon = await CouponRepository.updateCoupon(id, payload);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    return coupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    await CouponRepository.deleteCoupon(id);
  }

  async getAvailableCoupons(
    userId: string,
    minimumAmount?: number
  ): Promise<ICoupon[]> {
    return await CouponRepository.getAvailableCoupons(userId, minimumAmount);
  }
}

export default new CouponService();
