import { Request, Response } from "express";

export interface IHostSubscriptionController {
    getHostSubscription(req: Request, res: Response): Promise<void>
    getAvailableSubscriptions(req: Request, res: Response): Promise<void>
    createOrder(req: Request, res: Response): Promise<void>
    verifyPayment(req: Request, res: Response): Promise<void>
    createUpgradeOrder(req: Request, res: Response): Promise<void>
    verifyUpgradePayment(req: Request, res: Response): Promise<void>
}
