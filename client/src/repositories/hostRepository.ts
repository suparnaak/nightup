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
};

export default hostRepository;
