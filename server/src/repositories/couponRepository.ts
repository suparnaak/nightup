import Coupon, { ICoupon } from "../models/coupon";
import { ICouponRepository } from "./interfaces/ICouponRepository";

class CouponRepository implements ICouponRepository {
  async getCoupons(): Promise<ICoupon[]> {
    return await Coupon.find().sort({ createdAt: -1 });
  }

  async createCoupon(payload: {
    couponCode: string;
    couponAmount: number;
    minimumAmount: number;
    startDate: Date;
    endDate: Date;
    couponQuantity: number;
  }): Promise<ICoupon> {
    const newCoupon = new Coupon(payload);
    return await newCoupon.save();
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
  ): Promise<ICoupon | null> {
    return await Coupon.findByIdAndUpdate(id, payload, { new: true });
  }

  async deleteCoupon(id: string): Promise<void> {
    await Coupon.findByIdAndDelete(id);
  }
}

export default new CouponRepository();
