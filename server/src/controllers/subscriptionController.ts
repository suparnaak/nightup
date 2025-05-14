import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { Request, Response } from "express";
import { ISubscriptionController } from "./interfaces/ISubscriptionController";
import { ISubscriptionService } from '../services/interfaces/ISubscriptionService';
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { isRequired,isValidDuration  } from "../utils/validators";

const validDurations = ["Monthly", "6 Months", "Yearly"];

@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject(TYPES.SubscriptionService)
    private subscriptionService: ISubscriptionService
  ){}
  /* async getSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const subscriptions = await this.subscriptionService.getSubscriptions();
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
  } */
 async getSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const result = await this.subscriptionService.getSubscriptions(page, limit);
      
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        subscriptions: result.subscriptions,
        pagination: result.pagination
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

      const subscription = await this.subscriptionService.createSubscription({
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

      const subscription = await this.subscriptionService.updateSubscription(id, {
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
      await this.subscriptionService.deleteSubscription(id);
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

//export default new SubscriptionController();
