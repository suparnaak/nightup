import 'reflect-metadata';
import { injectable,inject } from 'inversify';
import TYPES from '../config/di/types';
import { Request, Response } from "express";
import {IHostSubscriptionService } from '../services/interfaces/IHostSubscriptionService'
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { IHostSubscriptionController } from "./interfaces/IHostSubscriptionController";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

@injectable()
export class HostSubscriptionController implements IHostSubscriptionController{
  constructor(
    @inject(TYPES.HostSubscriptionService)
    private hostSubscriptionService:IHostSubscriptionService
  ){}
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
      const subscription = await this.hostSubscriptionService.getHostSubscription(hostId);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        subscription, 
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
      const plans = await this.hostSubscriptionService.getAvailableSubscriptions();
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
  //subscriptionorder creation
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId, amount } = req.body;
      console.log(req.body)
      if (!req.user?.userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const order = await this.hostSubscriptionService.createOrder(req.user.userId, planId, amount);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        orderId: order.id,
      });
    } catch (error) {
      console.error("Create Order Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  //payment verification
  async verifyPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const paymentData = req.body; 
      const verified = await this.hostSubscriptionService.verifyPayment(req.user.userId, paymentData);
      if (verified) {
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          message: MESSAGES.HOST.SUCCESS.SUBSCRIPTION_CREATED,
        });
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.PAYMENT_FAILED,
        });
      }
    } catch (error) {
      console.error("Verify Payment Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
//upgrade
async createUpgradeOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { planId, amount, currentSubscriptionId } = req.body;
    console.log("body",req.body)
    if (!req.user?.userId) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
      });
      return;
    }
    
    if (!planId || !amount || !currentSubscriptionId) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.HOST.ERROR.MISSING_SUBSCRIPTION_FIELDS,
      });
      return;
    }
    
    const order = await this.hostSubscriptionService.createUpgradeOrder(
      req.user.userId,
      planId,
      amount,
      currentSubscriptionId
    );
    
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Create Upgrade Order Error:", error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
    });
  }
}

  async verifyUpgradePayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
            console.log("incoming",req.body)
      const { 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature, 
        planId, 
        currentSubscriptionId,
        proratedAmount 
      } = req.body;
      
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planId || !currentSubscriptionId) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.PAYMENT_FAILED,
        });
        return;
      }
      const prorated = typeof proratedAmount === "number"
        ? proratedAmount
        : Number(proratedAmount) || 0;
      const paymentData = {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        planId,
        currentSubscriptionId,
        proratedAmount: prorated
      };
      
      const result = await this.hostSubscriptionService.verifyUpgradePayment(req.user.userId, paymentData);
      
      if (result.success) {
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          message:MESSAGES.HOST.SUCCESS.SUBSCRIPTION_UPGRADED,
          subscription: result.subscription,
        });
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.PAYMENT_FAILED,
        });
      }
    } catch (error) {
      console.error("Verify Upgrade Payment Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

//export default new HostSubscriptionController();
