import { IWallet } from "../../models/wallet";

interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IWalletRepository {
    //getWallet(userId: string): Promise<IWallet | null>
    getWallet(userId: string, page?: number, limit?: number): Promise<{ wallet: IWallet | null, pagination: PaginationResult }>;
    updateWalletBalance(userId: string, amount: number, paymentId?: string, description?: string): Promise<IWallet>
    deductWalletBalance(
          userId: string,
          amount: number,
          paymentId: string,
          description: string
        ): Promise<IWallet>
}
