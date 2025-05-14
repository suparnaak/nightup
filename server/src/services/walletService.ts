import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import TYPES from '../config/di/types';
import { IWalletRepository } from '../repositories/interfaces/IWalletRepository';
import { IPaymentService } from './interfaces/IPaymentService';
import { IWalletService } from "./interfaces/IWalletSevice";
import { IWallet } from "../models/wallet";
interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(TYPES.WalletRepository)
    private walletRepository: IWalletRepository,
    @inject(TYPES.PaymentService)
    private paymentService: IPaymentService
  ){}
  //async getWallet(userId: string):Promise<IWallet | null> {
    async getWallet(userId: string, page: number = 1, limit: number = 10): Promise<{ wallet: IWallet | null, pagination: PaginationResult }> {
      const result = await this.walletRepository.getWallet(userId, page, limit);
      return result;
    
  }

  async createOrder(userId: string, amount: number): Promise<{ id: string }> {
    
    const receipt = `wallet_${userId.slice(0,6)}_${Date.now()}`;
    
    const order = await this.paymentService.createOrder({
      amount: amount * 100,
      currency: "INR",
      receipt,
    });
    console.log(order)
    return order;
  }

  async verifyPayment(userId: string, paymentData: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; amount: number;}): Promise<boolean> {
    const isValid = this.paymentService.verifyPayment(paymentData);
    console.log("payment data")
    console.log(paymentData)
    if (isValid) {
     
      const rechargeAmount = paymentData.amount;
      await this.walletRepository.updateWalletBalance(userId, rechargeAmount, paymentData.razorpay_payment_id);
      return true;
    } else {
      return false;
    }
  }
}

//export default new WalletService();
