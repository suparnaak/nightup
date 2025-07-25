import { Types } from "mongoose";
import Wallet, { IWallet } from "../models/wallet";
import { MESSAGES } from "../utils/constants";
import { IWalletRepository } from "./interfaces/IWalletRepository";
import { BaseRepository } from "./baseRepository/baseRepository";
interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {
  constructor() {
    super(Wallet);
  }

    async getWallet(userId: string, page: number = 1, limit: number = 10): Promise<{ wallet: IWallet | null, pagination: PaginationResult }> {
      const walletDoc = await this.findOne({ user: new Types.ObjectId(userId) });
      
      if (!walletDoc) {
        return { 
          wallet: null, 
          pagination: { total: 0, page, limit, totalPages: 0 } 
        };
      }
      
      const totalTransactions = walletDoc.transactions.length;
      
      const totalPages = Math.ceil(totalTransactions / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, totalTransactions);
      
      const wallet = {
        ...walletDoc.toObject(),
        transactions: walletDoc.transactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(startIndex, endIndex)
      };
      
      return {
        wallet,
        pagination: {
          total: totalTransactions,
          page,
          limit,
          totalPages
        }
      };
    }

  async updateWalletBalance(
    userId: string, 
    amount: number, 
    paymentId?: string, 
    description: string = "Wallet recharge"
  ): Promise<IWallet> {
    const rechargeAmount = Number(amount);
    let wallet = await this.findOne({ user: new Types.ObjectId(userId) });
    
    if (!wallet) {
      wallet = await this.create({ 
        user: new Types.ObjectId(userId), 
        balance: rechargeAmount, 
        transactions: [{
          amount: rechargeAmount,
          type: "credit",
          date: new Date(),
          description,
          paymentId,
        }] 
      });
    } else {
      wallet.balance += rechargeAmount;
      wallet.transactions.push({
        amount: rechargeAmount,
        type: "credit",
        date: new Date(),
        description,
        paymentId,
      });
      
      await wallet.save();
    }
    
    return wallet;
  }

  async deductWalletBalance(
    userId: string,
    amount: number,
    paymentId: string,
    description: string
  ): Promise<IWallet> {
    const wallet = await this.findOne({ user: new Types.ObjectId(userId) });
    
    if (!wallet || wallet.balance < amount) {
      throw new Error(MESSAGES.USER.ERROR.INSUFFICIENT_WALLET);
    }
    
    wallet.balance -= amount;
    wallet.transactions.push({
      amount,
      type: "debit",
      date: new Date(),
      description,
      paymentId
    });
    
    return await wallet.save();
  }
}