import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../config/di/types";
import { Request, Response } from "express";
import { ICouponController } from "./interfaces/ICouponController";
import { ICouponService } from "../services/interfaces/ICouponService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import {
  isRequired,
  isPositiveNumber,
  isFutureDate,
  isEndDateValid,
} from "../utils/validators";
import {
  CouponResponseDto,
  CreateCouponDto,
  UpdateCouponDto,
} from "../dtos/coupons/CouponDTO";
import {
  fromCreateDtoToModel,
  toCouponResponseDto,
} from "../mappers/CouponMapper";
interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

@injectable()
export class CouponController implements ICouponController {
  constructor(
    @inject(TYPES.CouponService)
    private couponService: ICouponService
  ) {}

  async getCoupons(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await this.couponService.getCoupons(page, limit);

      const transformedCoupons: CouponResponseDto[] = result.coupons.map(
        (coupon) => toCouponResponseDto(coupon)
      );
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        coupons: transformedCoupons,
        pagination: result.pagination,
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

      const createCouponDto: CreateCouponDto = {
        couponCode: payload.couponCode,
        couponAmount: Number(payload.couponAmount),
        minimumAmount: Number(payload.minimumAmount),
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        couponQuantity: Number(payload.couponQuantity),
      };

      const modelData = fromCreateDtoToModel(createCouponDto);
      const createdCoupon = await this.couponService.createCoupon(
        createCouponDto
      );

      const couponResponse: CouponResponseDto =
        toCouponResponseDto(createdCoupon);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message:
          MESSAGES.ADMIN.SUCCESS.COUPON_CREATED ||
          "Coupon created successfully",
        coupon: couponResponse,
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

      if (
        payload.couponAmount !== undefined &&
        !isPositiveNumber(payload.couponAmount)
      ) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_DISCOUNT,
        });
        return;
      }
      if (
        payload.minimumAmount !== undefined &&
        !isPositiveNumber(payload.minimumAmount)
      ) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_COUPON_MIN_AMOUNT,
        });
        return;
      }
      if (
        payload.couponQuantity !== undefined &&
        !isPositiveNumber(payload.couponQuantity)
      ) {
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

      const updateCouponDto: UpdateCouponDto = {};

      if (payload.couponAmount !== undefined) {
        updateCouponDto.couponAmount = Number(payload.couponAmount);
      }
      if (payload.minimumAmount !== undefined) {
        updateCouponDto.minimumAmount = Number(payload.minimumAmount);
      }
      if (payload.startDate !== undefined) {
        updateCouponDto.startDate = new Date(payload.startDate);
      }
      if (payload.endDate !== undefined) {
        updateCouponDto.endDate = new Date(payload.endDate);
      }
      if (payload.couponQuantity !== undefined) {
        updateCouponDto.couponQuantity = Number(payload.couponQuantity);
      }

      const updatedCoupon = await this.couponService.updateCoupon(
        id,
        updateCouponDto
      );

      const couponResponse: CouponResponseDto =
        toCouponResponseDto(updatedCoupon);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message:
          MESSAGES.ADMIN.SUCCESS.COUPON_UPDATED ||
          "Coupon updated successfully",
        coupon: couponResponse,
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
      await this.couponService.deleteCoupon(id);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message:
          MESSAGES.ADMIN.SUCCESS.COUPON_DELETED ||
          "Coupon deleted successfully",
      });
    } catch (error) {
      console.error("Delete Coupon Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  async getAvailableCoupons(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }

      const userId = req.user.userId;
      const minAmtRaw = req.query.minimumAmount as string | undefined;
      console.log(req.query.minimumAmount);

      const minimumAmount =
        minAmtRaw !== undefined ? parseFloat(minAmtRaw) : undefined;

      const coupons = await this.couponService.getAvailableCoupons(
        userId,
        minimumAmount
      );

      const transformedCoupons: CouponResponseDto[] = coupons.map((coupon) =>
        toCouponResponseDto(coupon)
      );

      console.log(transformedCoupons);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        coupons: transformedCoupons,
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
