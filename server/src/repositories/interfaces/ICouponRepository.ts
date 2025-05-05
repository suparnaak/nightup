/* import { ICoupon } from "../../models/coupon"

export interface ICouponRepository {
    getCoupons(): Promise<ICoupon[]>
    createCoupon(payload: {
        couponCode: string;
        couponAmount: number;
        minimumAmount: number;
        startDate: Date;
        endDate: Date;
        couponQuantity: number;
      }): Promise<ICoupon>
      updateCoupon(
        id: string,
        payload: Partial<{
          couponAmount: number;
          minimumAmount: number;
          startDate: Date;
          endDate: Date;
          couponQuantity: number;
        }>
      ): Promise<ICoupon | null>
      deleteCoupon(id: string): Promise<void>
      getAvailableCoupons(
          userId: string,
          minimumAmount?: number
        ): Promise<ICoupon[]>
}
 */
import { Types } from "mongoose";
import { ICoupon } from "../../models/coupon";
import { IBaseRepository } from "../baseRepository/IBaseRepository";

export interface ICouponRepository extends IBaseRepository<ICoupon> {
  /** Get all coupons, newest-first */
  getCoupons(): Promise<ICoupon[]>;

  /**
   * Create a new coupon.
   * Override generic create to require full payload.
   */
  createCoupon(payload: {
    couponCode: string;
    couponAmount: number;
    minimumAmount: number;
    startDate: Date;
    endDate: Date;
    couponQuantity: number;
  }): Promise<ICoupon>;

  /** Update an existing coupon */
  updateCoupon(
    id: string,
    payload: Partial<{
      couponAmount: number;
      minimumAmount: number;
      startDate: Date;
      endDate: Date;
      couponQuantity: number;
    }>
  ): Promise<ICoupon | null>;

  /** Delete a coupon */
  deleteCoupon(id: string): Promise<void>;

  /**
   * Only coupons that are active, unblocked, not expired,
   * still have quantity left, and not used by the user.
   */
  getAvailableCoupons(
    userId: string,
    minimumAmount?: number
  ): Promise<ICoupon[]>;
}
