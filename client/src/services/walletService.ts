import axiosUserClient from "../api/axiosUserClient";

export const walletRepository = {
  // Fetch the wallet details

  getWallet: async (page = 1, limit = 10) => {
    const response = await axiosUserClient.get(`/wallet?page=${page}&limit=${limit}`);
    return response.data;
  },
  // Creating payment order for adding money to the wallet
  createWalletOrder: async (amount: number) => {
    const response = await axiosUserClient.post("/wallet/create-order", { amount });
    return response.data; 
  },
  // Verify the payment for adding money to the wallet
  verifyWalletPayment: async (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    amount: number;
  }) => {
    const response = await axiosUserClient.post("/wallet/verify-payment", paymentData);
    return response.data; 
}
}

