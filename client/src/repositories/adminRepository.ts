// src/repositories/adminRepository.ts
import axiosAdminClient from '../api/axiosAdminClient';

export const adminRepository = {
  // list all the hosts
  getHosts: async () => {
    const response = await axiosAdminClient.get('/hosts');
    return response.data; 
  },
  verifyDocument: async ({ hostId, action }: { hostId: string; action: "approve" | "reject" }) => {
    const response = await axiosAdminClient.post('/hosts/verify-document', { hostId, action });
    return response.data;
  },
//block or unblock hosts
hostToggleStatus: async ({ hostId, newStatus }: { hostId: string; newStatus: boolean }) => {
  const response = await axiosAdminClient.post('/hosts/toggle-block', { hostId, newStatus });
  return response.data;
},
};

export default adminRepository;
