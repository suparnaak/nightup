/* import Wallet, { IWallet } from "../models/wallet";
import { MESSAGES } from "../utils/constants";
import { IWalletRepository } from "./interfaces/IWalletRepository";

export class WalletRepository implements IWalletRepository {
  async getWallet(userId: string): Promise<IWallet | null> {
    return await Wallet.findOne({ user: userId });
  }

  async updateWalletBalance(
    userId: string,
    amount: number,
    paymentId?: string,
    description: string = "Wallet recharge"
  ): Promise<IWallet> {
    const rechargeAmount = Number(amount);
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        balance: rechargeAmount,
        transactions: [],
      });
    } else {
      wallet.balance += rechargeAmount;
    }
    wallet.transactions.push({
      amount: rechargeAmount,
      type: "credit",
      date: new Date(),
      description,
      paymentId,
    });
    return await wallet.save();
  }

  async deductWalletBalance(
    userId: string,
    amount: number,
    paymentId: string,
    description: string
  ): Promise<IWallet> {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.balance < amount) {
      throw new Error(MESSAGES.USER.ERROR.INSUFFICIENT_WALLET);
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      amount,
      type: "debit",
      date: new Date(),
      description,
      paymentId,
    });

    return await wallet.save();
  }
}

//export default new WalletRepository();
 */
import { Types } from "mongoose";
import Wallet, { IWallet } from "../models/wallet";
import { MESSAGES } from "../utils/constants";
import { IWalletRepository } from "./interfaces/IWalletRepository";
import { BaseRepository } from "./baseRepository/baseRepository";

export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {
  constructor() {
    super(Wallet);
  }

  async getWallet(userId: string): Promise<IWallet | null> {
    return await this.findOne({ user: new Types.ObjectId(userId) });
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
      // Create a new wallet
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
      // Update existing wallet
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