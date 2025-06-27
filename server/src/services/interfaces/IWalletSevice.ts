import { IWallet } from "../../models/wallet";
interface PaginationResult {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  

export interface IWalletService {
    getWallet(userId: string, page?: number, limit?: number): Promise<{ wallet: IWallet | null, pagination: PaginationResult }>;
    createOrder(userId: string, amount: number): Promise<{ id: string }>
    verifyPayment(userId: string, paymentData: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; amount: number;}): Promise<boolean>

}
