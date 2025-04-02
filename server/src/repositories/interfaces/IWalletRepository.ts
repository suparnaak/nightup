import { IWallet } from "../../models/wallet";

export interface IWalletRepository {
    getWallet(userId: string): Promise<IWallet | null>
    updateWalletBalance(userId: string, amount: number, paymentId?: string): Promise<IWallet>
}
