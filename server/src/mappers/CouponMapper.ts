import { ICoupon } from "../models/coupon";
import { CouponResponseDto, CreateCouponDto, UpdateCouponDto,  } from "../dtos/coupons/CouponDTO";


export function toCouponResponseDto(coupon: ICoupon): CouponResponseDto {
  return {
    id: coupon._id.toString(),
    couponCode: coupon.couponCode,
    couponAmount: coupon.couponAmount,
    minimumAmount: coupon.minimumAmount,
    startDate: coupon.startDate,
    endDate: coupon.endDate,
    couponQuantity: coupon.couponQuantity,
    usedCount: coupon.usedCount,
    status: coupon.status,
    isBlocked: coupon.isBlocked,
    createdAt: coupon.createdAt!,
    updatedAt: coupon.updatedAt!,
  };
}


export function fromCreateDtoToModel(
  dto: CreateCouponDto
): Partial<ICoupon> {
  return {
    couponCode: dto.couponCode,
    couponAmount: dto.couponAmount,
    minimumAmount: dto.minimumAmount,
    startDate: dto.startDate,
    endDate: dto.endDate,
    couponQuantity: dto.couponQuantity,
    usedCount: 0, 
    
  };
}


export function fromUpdateDtoToModel(
  dto: UpdateCouponDto
): Partial<ICoupon> {
  const updatePayload: Partial<ICoupon> = {};

  if (dto.couponAmount !== undefined) {
    updatePayload.couponAmount = dto.couponAmount;
  }
  if (dto.minimumAmount !== undefined) {
    updatePayload.minimumAmount = dto.minimumAmount;
  }
  if (dto.startDate !== undefined) {
    updatePayload.startDate = dto.startDate;
  }
  if (dto.endDate !== undefined) {
    updatePayload.endDate = dto.endDate;
  }
  if (dto.couponQuantity !== undefined) {
    updatePayload.couponQuantity = dto.couponQuantity;
  }

  return updatePayload;
}
