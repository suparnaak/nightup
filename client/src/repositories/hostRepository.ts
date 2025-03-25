import axiosHostClient from "../api/axiosHostClient";

export const hostRepository = {
  getHostProfile: async () => {
    const response = await axiosHostClient.get(`/profile`);
    return response.data;
  },

  updateHostProfile: async (profileData: FormData) => {
    const response = await axiosHostClient.post("/profile/update", profileData);
    return response.data;
  },
};

export default hostRepository;
