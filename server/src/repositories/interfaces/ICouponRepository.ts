import { ICoupon } from "../../models/coupon"

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
