  import Wallet, { IWallet } from "../models/wallet";
  import { IWalletRepository } from "./interfaces/IWalletRepository";

  class WalletRepository implements IWalletRepository {
    async getWallet(userId: string): Promise<IWallet | null> {
      return await Wallet.findOne({ user: userId });
    }

    async updateWalletBalance(userId: string, amount: number, paymentId?: string): Promise<IWallet> {
      // Convert the amount to a number explicitly
      const rechargeAmount = Number(amount);
      let wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        // Create a new wallet if none exists
        wallet = new Wallet({ user: userId, balance: rechargeAmount, transactions: [] });
      } else {
        // Add the amount to the current balance
        wallet.balance += rechargeAmount;
      }
      // Record the transaction (credit) including paymentId if provided
      wallet.transactions.push({
        amount: rechargeAmount,
        type: "credit",
        date: new Date(),
        description: "Wallet recharge",
        paymentId, // this will be undefined if not provided
      });
      return await wallet.save();
    }
  }

  export default new WalletRepository();
