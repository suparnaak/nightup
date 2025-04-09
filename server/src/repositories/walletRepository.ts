  import Wallet, { IWallet } from "../models/wallet";
  import { IWalletRepository } from "./interfaces/IWalletRepository";

  class WalletRepository implements IWalletRepository {
    async getWallet(userId: string): Promise<IWallet | null> {
      return await Wallet.findOne({ user: userId });
    }

    async updateWalletBalance(userId: string, amount: number, paymentId?: string): Promise<IWallet> {

      const rechargeAmount = Number(amount);
      let wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        wallet = new Wallet({ user: userId, balance: rechargeAmount, transactions: [] });
      } else {
        wallet.balance += rechargeAmount;
      }
      wallet.transactions.push({
        amount: rechargeAmount,
        type: "credit",
        date: new Date(),
        description: "Wallet recharge",
        paymentId, 
      });
      return await wallet.save();
    }

    async deductWalletBalance(
      userId: string,
      amount: number,
      description: string
    ): Promise<IWallet> {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }
    
      wallet.balance -= amount;
      wallet.transactions.push({
        amount,
        type: "debit",
        date: new Date(),
        description,
      });
    
      return await wallet.save();
    }

  }

  export default new WalletRepository();
