import { Request, Response } from "express";

export interface ISubscriptionController {
  getSubscriptions(req: Request, res: Response): Promise<void>;
  createSubscription(req: Request, res: Response): Promise<void>;
  updateSubscription(req: Request, res: Response): Promise<void>;
  deleteSubscription(req: Request, res: Response): Promise<void>;
}
