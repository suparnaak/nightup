import { Request, Response } from "express";
import { ICouponController } from "./interfaces/ICouponController";
import CouponService from "../services/couponService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { isRequired, isPositiveNumber, isFutureDate, isEndDateValid } from "../utils/validators";

class CouponController implements ICouponController {
  async getCoupons(req: Request, res: Response): Promise<void> {
    try {
      const coupons = await CouponService.getCoupons();
      console.log("coupons")
      console.log(coupons)
      const transformedCoupons = coupons.map(coupon => ({
        id: coupon._id.toString(),
        couponCode: coupon.couponCode,
        couponAmount: coupon.couponAmount,
        minimumAmount: coupon.minimumAmount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        couponQuantity: coupon.couponQuantity,
        usedCount: coupon.usedCount,
        status: coupon.status,
      }));
      console.log("transformed")
      console.log(transformedCoupons)
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        coupons: transformedCoupons,
      });
    } catch (error) {
      console.error("Get Coupons Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;
      console.log(payload);

      if (!isRequired(payload.couponCode)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_CODE,
        });
        return;
      }
      if (!isPositiveNumber(payload.couponAmount)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_DISCOUNT,
        });
        return;
      }
      if (!isPositiveNumber(payload.minimumAmount)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_MIN_AMOUNT,
        });
        return;
      }
      if (!isPositiveNumber(payload.couponQuantity)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_QUANTITY,
        });
        return;
      }
      if (!isFutureDate(payload.startDate)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_START_DATE,
        });
        return;
      }
      if (!isEndDateValid(payload.startDate, payload.endDate)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_END_DATE,
        });
        return;
      }

      const coupon = await CouponService.createCoupon({
        couponCode: payload.couponCode,
        couponAmount: Number(payload.couponAmount),
        minimumAmount: Number(payload.minimumAmount),
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        couponQuantity: Number(payload.couponQuantity),
      });

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.ADMIN.SUCCESS.COUPON_CREATED || "Coupon created successfully",
        coupon,
      });
    } catch (error) {
      console.error("Create Coupon Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async updateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payload = req.body;

      if (payload.couponCode !== undefined) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.COUPON_CODE_CANNOT_BE_UPDATED,
        });
        return;
      }
      if (payload.couponAmount !== undefined && !isPositiveNumber(payload.couponAmount)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_DISCOUNT,
        });
        return;
      }
      if (payload.minimumAmount !== undefined && !isPositiveNumber(payload.minimumAmount)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_MIN_AMOUNT,
        });
        return;
      }
      if (payload.couponQuantity !== undefined && !isPositiveNumber(payload.couponQuantity)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_QUANTITY,
        });
        return;
      }
      if (payload.startDate !== undefined && !isFutureDate(payload.startDate)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_START_DATE,
        });
        return;
      }
      if (
        payload.endDate !== undefined &&
        payload.startDate !== undefined &&
        !isEndDateValid(payload.startDate, payload.endDate)
      ) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_END_DATE,
        });
        return;
      }

      const coupon = await CouponService.updateCoupon(id, {
        couponAmount: payload.couponAmount !== undefined ? Number(payload.couponAmount) : undefined,
        minimumAmount: payload.minimumAmount !== undefined ? Number(payload.minimumAmount) : undefined,
        startDate: payload.startDate ? new Date(payload.startDate) : undefined,
        endDate: payload.endDate ? new Date(payload.endDate) : undefined,
        couponQuantity: payload.couponQuantity !== undefined ? Number(payload.couponQuantity) : undefined,
      });

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.ADMIN.SUCCESS.COUPON_UPDATED || "Coupon updated successfully",
        coupon,
      });
    } catch (error) {
      console.error("Update Coupon Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async deleteCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await CouponService.deleteCoupon(id);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.ADMIN.SUCCESS.COUPON_DELETED || "Coupon deleted successfully",
      });
    } catch (error) {
      console.error("Delete Coupon Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  async getAvailableCoupons(req: Request, res: Response): Promise<void> {
    try {
      
      const minAmtRaw = req.query.minimumAmount as string | undefined;
      console.log(req.query.minimumAmount)
      const minimumAmount = minAmtRaw !== undefined
        ? parseFloat(minAmtRaw)
        : undefined;

      const coupons = await CouponService.getAvailableCoupons(minimumAmount);

      const transformed = coupons.map(coupon => ({
        id: coupon._id.toString(),
        couponCode: coupon.couponCode,
        couponAmount: coupon.couponAmount,
        minimumAmount: coupon.minimumAmount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        status: coupon.status,
      }));
console.log(transformed)
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        coupons: transformed,
      });
    } catch (err: any) {
      console.error("Get Available Coupons Error:", err);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new CouponController();
