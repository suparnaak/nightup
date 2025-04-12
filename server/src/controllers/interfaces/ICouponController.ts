import { Request, Response } from "express";

export interface ICouponController {
    getCoupons(req: Request, res: Response): Promise<void>;
    createCoupon(req: Request, res: Response): Promise<void>;
    updateCoupon(req: Request, res: Response): Promise<void>;
    deleteCoupon(req: Request, res: Response): Promise<void>;
    getAvailableCoupons(req: Request, res: Response): Promise<void>
}
