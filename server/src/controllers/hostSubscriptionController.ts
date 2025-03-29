// src/controllers/HostSubscriptionController.ts
import { Request, Response } from "express";
import HostSubscriptionService from "../services/hostSubscriptionService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class HostSubscriptionController {
  async getHostSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostId = req.user?.userId;
      if (!hostId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const subscription = await HostSubscriptionService.getHostSubscription(hostId);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        subscription, // may be null if no subscription exists
      });
    } catch (error) {
      console.error("Get Host Subscription Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async getAvailableSubscriptions(req: AuthRequest, res: Response): Promise<void> {
    try {
        const hostId = req.user?.userId;
        console.log(hostId)
      if (!hostId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const plans = await HostSubscriptionService.getAvailableSubscriptions();
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        plans,
      });
    } catch (error) {
      console.error("Get Available Subscriptions Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  // ... other methods if needed
}

export default new HostSubscriptionController();
