import axiosHostClient from "../api/axiosHostClient";

export const hostRepository = {
  //profile related
  getHostProfile: async () => {
    const response = await axiosHostClient.get(`/profile`);
    return response.data;
  },

  updateHostProfile: async (profileData: FormData) => {
    const response = await axiosHostClient.patch("/profile/update", profileData);
    return response.data;
  },
  //subscription related
  getHostSubscription: async () => {
    const response = await axiosHostClient.get("/subscription");
    return response.data;
  },
  getSubscriptionPlans: async () => {
    const response = await axiosHostClient.get("/available-subscription");
    return response.data;
  },
  //razor pay
  createSubscriptionOrder: async (planId: string, amount: number) => {
    const response = await axiosHostClient.post('/subscriptions/create-order', {
      planId,
      amount
    });
    return response.data;
  },
  verifySubscriptionPayment: async (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    planId: string;
  }) => {
    const response = await axiosHostClient.post('/subscriptions/verify-payment', paymentData);
    return response.data;
  },
  createUpgradeOrder: async (planId: string, amount: number, currentSubscriptionId: string) => {
    const response = await axiosHostClient.post('/subscriptions/create-upgrade-order', {
      planId,
      amount,
      currentSubscriptionId
    });
    return response.data;
  },
  verifyUpgradePayment: async (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    planId: string;
    currentSubscriptionId: string;
  }) => {
    console.log("Sending verification request to server:", paymentData);
    const response = await axiosHostClient.post('/subscriptions/verify-upgrade', paymentData);
    return response.data;
  }
};

export default hostRepository;
