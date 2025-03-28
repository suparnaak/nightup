import { Request, Response } from "express";
import { ISubscriptionController } from "./interfaces/ISubscriptionController";
import SubscriptionService from "../services/subscriptionService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { isRequired,isValidDuration  } from "../utils/validators";

const validDurations = ["Monthly", "6 Months", "Yearly"];

class SubscriptionController implements ISubscriptionController {
  async getSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const subscriptions = await SubscriptionService.getSubscriptions();
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        subscriptions,
      });
    } catch (error) {
      console.error("Get Subscriptions Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;
      
      if (!isRequired(payload.name)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_SUBSCRIPTION_NAME,
        });
        return;
      }
      if (!isRequired(payload.duration) || !isValidDuration(payload.duration)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_SUBSCRIPTION_DURATION,
        });
        return;
      }
      if (!isRequired(payload.price) || Number(payload.price) <= 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_SUBSCRIPTION_PRICE,
        });
        return;
      }

      const subscription = await SubscriptionService.createSubscription({
        name: payload.name,
        duration: payload.duration,
        price: Number(payload.price),
      });
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.ADMIN.SUCCESS.SUBSCRIPTION_CREATED || "Subscription created successfully",
        subscription,
      });
    } catch (error) {
      console.error("Create Subscription Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payload = req.body;

      if (payload.name !== undefined && !isRequired(payload.name)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_SUBSCRIPTION_NAME,
        });
        return;
      }
      if (payload.duration !== undefined && !validDurations.includes(payload.duration)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_SUBSCRIPTION_DURATION,
        });
        return;
      }
      if (payload.price !== undefined && Number(payload.price) <= 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ADMIN.ERROR.INVALID_SUBSCRIPTION_PRICE,
        });
        return;
      }

      const subscription = await SubscriptionService.updateSubscription(id, {
        name: payload.name,
        duration: payload.duration,
        price: Number(payload.price),
      });
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.ADMIN.SUCCESS.SUBSCRIPTION_UPDATED || "Subscription updated successfully",
        subscription,
      });
    } catch (error) {
      console.error("Update Subscription Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async deleteSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await SubscriptionService.deleteSubscription(id);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: MESSAGES.ADMIN.SUCCESS.SUBSCRIPTION_DELETED || "Subscription deleted successfully",
      });
    } catch (error) {
      console.error("Delete Subscription Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new SubscriptionController();
