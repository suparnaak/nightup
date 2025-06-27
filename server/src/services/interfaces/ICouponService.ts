import { ICoupon } from "../../models/coupon";
export interface ICouponService {
     getCoupons(page?: number, limit?: number): Promise<{
    coupons: ICoupon[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;
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
      ): Promise<ICoupon>


      deleteCoupon(id: string): Promise<void>

      getAvailableCoupons(
        userId: string,
        minimumAmount?: number
      ): Promise<ICoupon[]>


}