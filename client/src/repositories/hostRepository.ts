import axiosHostClient from '../api/axiosHostClient';

export const hostRepository = {
  // Fetch the host profile by host ID
  getHostProfile: async () => {
    const response = await axiosHostClient.get(`/profile`);
    return response.data;
  },
  

  // Update the host profile using a FormData object
  updateHostProfile: async (profileData: FormData) => {
    const response = await axiosHostClient.post('/profile/update', profileData);
    return response.data; // Expected to return an object like { hostProfile, message }
  },
};

export default hostRepository;
