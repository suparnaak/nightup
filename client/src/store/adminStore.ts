// src/store/adminStore.ts
import { create } from 'zustand';
import { adminRepository } from '../repositories/adminRepository';

export interface Host {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostType: string;
  subscriptionPlan: string;
  subStatus: string;
  documentUrl: string;
  isVerified: boolean;
  adminVerified: boolean;
  isBlocked: boolean;
  createdAt: string | number | Date;
}

interface AdminState {
  hosts: Host[];
  isLoading: boolean;
  error: string | null;
  getHosts: () => Promise<Host[]>;
  clearHosts: () => void;
  verifyDocument: (payload: { hostId: string; action: "approve" | "reject" }) => Promise<any>;
  hostToggleStatus: (hostId: string, newStatus: boolean) => Promise<any>;
}

export const useAdminStore = create<AdminState>((set,get) => ({
  hosts: [],
  isLoading: false,
  error: null,
  getHosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getHosts();
      
      const transformedHosts = data.hosts.map((host: any) => ({ //to change objid(_id) to id
        id: host._id.toString(),
        ...host,
      }));
      set({ hosts: transformedHosts, isLoading: false });
      return transformedHosts;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load hosts",
        isLoading: false,
      });
      throw error;
    }
  },
  clearHosts: () => set({ hosts: [] }),
  //approve or reject doc
  verifyDocument: async ({ hostId, action }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.verifyDocument({ hostId, action });
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update document verification",
        isLoading: false,
      });
      throw error;
    }
  },
//block or unblock host
hostToggleStatus: async (hostId: string, newStatus: boolean) => {
  set({ isLoading: true, error: null });
  try {
    const response = await adminRepository.hostToggleStatus({ hostId, newStatus });
    await get().getHosts();
    set({ isLoading: false });
    return response;
  } catch (error: any) {
    set({
      error: error.response?.data?.message || "Failed to update block status",
      isLoading: false,
    });
    throw error;
  }
},
}));
