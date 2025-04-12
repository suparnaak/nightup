import { Request, Response } from "express";
import WalletService from "../services/walletService";
import { STATUS_CODES, MESSAGES } from "../utils/constants";
import { IWalletController } from "./interfaces/IWalletController";
interface AuthRequest extends Request {
    user?: {
      userId?: string;
      type?: string;
    };
  }
class WalletController implements IWalletController {
  async getWallet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const wallet = await WalletService.getWallet(userId);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        wallet,
      });
    } catch (error) {
      console.error("Get Wallet Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { amount } = req.body;
      console.log(amount)
      if (!amount || amount <= 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.USER.ERROR.AMOUNT_INVALID,
        });
        return;
      }
      const order = await WalletService.createOrder(userId, amount);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        orderId: order.id,
      });
    } catch (error) {
      console.error("Create Wallet Order Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async verifyPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
        console.log("verification service")
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const paymentData = req.body;
      const success = await WalletService.verifyPayment(userId, paymentData);
      if (success) {
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          message: MESSAGES.USER.SUCCESS.WALLET_UPDATED,
        });
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.PAYMENT_FAILED,
        });
      }
    } catch (error) {
      console.error("Verify Wallet Payment Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new WalletController();
