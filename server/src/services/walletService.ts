import WalletRepository from "../repositories/walletRepository";
import * as PaymentService from "./paymentService"
import { IWalletService } from "./interfaces/IWalletSevice";
import { IWallet } from "../models/wallet";

class WalletService implements IWalletService {
  async getWallet(userId: string):Promise<IWallet | null> {
    return await WalletRepository.getWallet(userId);
  }

  async createOrder(userId: string, amount: number): Promise<{ id: string }> {
    // Create a receipt using userId and current timestamp (you can customize this)
    const receipt = `wallet_${userId.slice(0,6)}_${Date.now()}`;
    // Call PaymentService.createOrder – note: amount should be in paise here.
    const order = await PaymentService.createOrder({
      amount: amount * 100,
      currency: "INR",
      receipt,
    });
    console.log(order)
    return order;
  }

  async verifyPayment(userId: string, paymentData: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; amount: number;}): Promise<boolean> {
    const isValid = PaymentService.verifyPayment(paymentData);
    console.log("payment data")
    console.log(paymentData)
    if (isValid) {
     
      const rechargeAmount = paymentData.amount;
      await WalletRepository.updateWalletBalance(userId, rechargeAmount, paymentData.razorpay_payment_id);
      return true;
    } else {
      return false;
    }
  }
}

export default new WalletService();
