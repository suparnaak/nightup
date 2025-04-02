import { IWallet } from "../../models/wallet";

export interface IWalletService {
    getWallet(userId: string):Promise<IWallet | null>
    createOrder(userId: string, amount: number): Promise<{ id: string }>
    verifyPayment(userId: string, paymentData: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; amount: number;}): Promise<boolean>

}
