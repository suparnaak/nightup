
export interface CreateCouponDto {
  couponCode: string;
  couponAmount: number;
  minimumAmount: number;
  startDate: Date;
  endDate: Date;
  couponQuantity: number;
}


export interface UpdateCouponDto {
  couponAmount?: number;
  minimumAmount?: number;
  startDate?: Date;
  endDate?: Date;
  couponQuantity?: number;
}


export interface CouponResponseDto {
  id: string;
  couponCode: string;
  couponAmount: number;
  minimumAmount: number;
  startDate: Date;
  endDate: Date;
  couponQuantity: number;
  usedCount: number;
  status: "inactive" | "active" | "expired";
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
