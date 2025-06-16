import { create } from "zustand";
import { adminRepository } from "../services/adminService";
import { SubscriptionPlan } from "../types/subcriptionPlanTypes";

interface SubscriptionState {
  subscriptions: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  getSubscriptions: (page?: number, limit?: number) => Promise<SubscriptionPlan[]>;
  createSubscription: (payload: {
    name: string;
    duration: string;
    price: number;
  }) => Promise<any>;
  updateSubscription: (
    id: string,
    payload: { name: string; duration: string; price: number }
  ) => Promise<any>;
  deleteSubscription: (id: string) => Promise<any>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 10
  },

   getSubscriptions: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getSubscriptions(page, limit);
      const subscriptions = data.subscriptions.map((sub: any) => ({
        id: sub._id.toString(),
        ...sub,
      }));
      set({ 
        subscriptions, 
        pagination: data.pagination,
        isLoading: false 
      });
      return subscriptions;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load subscriptions",
        isLoading: false,
      });
      throw error;
    }
  },

  createSubscription: async (payload: { name: string; duration: string; price: number }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.createSubscription(payload);
      await get().getSubscriptions();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create subscription",
        isLoading: false,
      });
      throw error;
    }
  },

  updateSubscription: async (
    id: string,
    payload: { name: string; duration: string; price: number }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.updateSubscription(id, payload);
      await get().getSubscriptions();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update subscription",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSubscription: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.deleteSubscription(id);
      await get().getSubscriptions();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete subscription",
        isLoading: false,
      });
      throw error;
    }
  },
}));
