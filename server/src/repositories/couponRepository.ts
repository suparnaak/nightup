import { Types } from "mongoose";
import Coupon, { ICoupon } from "../models/coupon";
import Booking from "../models/booking";
import { ICouponRepository } from "./interfaces/ICouponRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

export class CouponRepository
  extends BaseRepository<ICoupon>
  implements ICouponRepository
{
  constructor() {
    super(Coupon);
  }

 async getCoupons(page: number = 1, limit: number = 10): Promise<{
    coupons: ICoupon[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const [coupons, total] = await Promise.all([
      this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.model.countDocuments()
    ]);

    return {
      coupons,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
  }

  async createCoupon(
    payload: {
      couponCode: string;
      couponAmount: number;
      minimumAmount: number;
      startDate: Date;
      endDate: Date;
      couponQuantity: number;
    }
  ): Promise<ICoupon> {
    return this.create(payload);
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
    return this.update(id, payload);
  }

  async deleteCoupon(id: string): Promise<void> {
    await this.delete(id);
  }

  async getAvailableCoupons(
    userId: string,
    minimumAmount?: number
  ): Promise<ICoupon[]> {
    const now = new Date();
    const filter: any = {
      status: "active",
      isBlocked: false,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $expr: { $gt: ["$couponQuantity", "$usedCount"] }
    };
    if (minimumAmount !== undefined) {
      filter.minimumAmount = { $lte: minimumAmount };
    }

    const coupons = await this.model.find(filter).sort({ createdAt: -1 });
    const available: ICoupon[] = [];
    for (const coupon of coupons) {
      const used = await Booking.exists({
        userId: new Types.ObjectId(userId),
        couponId: coupon._id,
        status: { $in: ["pending", "confirmed"] }
      });
      if (!used) available.push(coupon);
    }
    return available;
  }
}


