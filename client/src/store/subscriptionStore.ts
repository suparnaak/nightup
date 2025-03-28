import { create } from "zustand";
import { adminRepository } from "../repositories/adminRepository";

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string; 
  price: number;
}

interface SubscriptionState {
  subscriptions: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  getSubscriptions: () => Promise<SubscriptionPlan[]>;
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

  getSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getSubscriptions();
      const subscriptions = data.subscriptions.map((sub: any) => ({
        id: sub._id.toString(),
        ...sub,
      }));
      set({ subscriptions, isLoading: false });
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
