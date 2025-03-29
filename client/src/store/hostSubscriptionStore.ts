// src/store/hostSubscriptionStore.ts
import { create } from "zustand";
import { hostRepository } from "../repositories/hostRepository";

// Define an interface for host subscription data
export interface HostSubscription {
  id: string;
  subscriptionPlan: string; // Plan name or ID
  startDate: string;        // ISO date string
  endDate: string;          // ISO date string
  status: "Active" | "Expired";
  paymentId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string; // e.g., "Monthly", "6 Months", "Yearly"
  price: number;
}

interface HostSubscriptionState {
  subscription: HostSubscription | null;
  availablePlans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  getHostSubscription: () => Promise<HostSubscription | null>;
  getAvailablePlans: () => Promise<SubscriptionPlan[]>;
  // Additional methods such as renewSubscription could be added here
}

export const useHostSubscriptionStore = create<HostSubscriptionState>((set) => ({
    subscription: null,
    availablePlans: [],
    isLoading: false,
    error: null,
  
    getHostSubscription: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await hostRepository.getHostSubscription();
        // Assume the response has a "subscription" object
        set({ subscription: data.subscription, isLoading: false });
        return data.subscription;
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to load subscription details",
          isLoading: false,
        });
        return null;
      }
    },
  
    getAvailablePlans: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await hostRepository.getSubscriptionPlans();
        // Transform each plan so it includes a unique 'id'
        const plans = data.plans.map((plan: any) => ({
          id: plan._id.toString(),
          ...plan,
        }));
        set({ availablePlans: plans, isLoading: false });
        return plans;
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to load available plans",
          isLoading: false,
        });
        // Return an empty array on error
        return [];
      }
    },
}));
