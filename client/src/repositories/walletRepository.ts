// src/repositories/walletRepository.ts
import axiosUserClient from "../api/axiosUserClient";

export const walletRepository = {
  // Fetch the user's wallet details (balance and transactions)
  getWallet: async () => {
    const response = await axiosUserClient.get("/wallet");
    return response.data; // assuming the response contains { wallet: { ... } }
  },
  // Create a payment order for adding money to the wallet
  createWalletOrder: async (amount: number) => {
    const response = await axiosUserClient.post("/wallet/create-order", { amount });
    return response.data; // assuming the response contains { orderId: string }
  },
  // Verify the payment made for adding money to the wallet
  verifyWalletPayment: async (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    amount: number;
  }) => {
    const response = await axiosUserClient.post("/wallet/verify-payment", paymentData);
    return response.data; // assuming the response contains { success: boolean }
}
}
//export default walletRepository;
