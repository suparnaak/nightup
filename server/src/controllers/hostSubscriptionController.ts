import { Request, Response } from "express";
import HostSubscriptionService from "../services/hostSubscriptionService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { IHostSubscriptionController } from "./interfaces/IHostSubscriptionController";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class HostSubscriptionController implements IHostSubscriptionController{
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
      const order = await HostSubscriptionService.createOrder(req.user.userId, planId, amount);
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
      const verified = await HostSubscriptionService.verifyPayment(req.user.userId, paymentData);
      if (verified) {
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          message: MESSAGES.ADMIN.SUCCESS.SUBSCRIPTION_CREATED || "Subscription created successfully",
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
        message: "Missing required fields: planId, amount, or currentSubscriptionId",
      });
      return;
    }
    
    const order = await HostSubscriptionService.createUpgradeOrder(
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
    
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId, currentSubscriptionId } = req.body;
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planId || !currentSubscriptionId) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Missing required payment verification data",
      });
      return;
    }
    
    const paymentData = {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
      currentSubscriptionId
    };
    
    const result = await HostSubscriptionService.verifyUpgradePayment(req.user.userId, paymentData);
    
    if (result.success) {
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: "Subscription upgraded successfully",
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

export default new HostSubscriptionController();
