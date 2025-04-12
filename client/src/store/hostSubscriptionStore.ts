import { create } from "zustand";
import { hostRepository } from "../repositories/hostRepository";

export interface HostSubscription {
  id?: string;      // For backward compatibility
  _id: string;      // Match actual MongoDB document structure
  subscriptionPlan: SubscriptionPlan; 
  startDate: string;        
  endDate: string;          
  status: "Active" | "Expired";
  paymentId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string; 
  price: number;
}

interface HostSubscriptionState {
  subscription: HostSubscription | null;
  availablePlans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  getHostSubscription: () => Promise<HostSubscription | null>;
  getAvailablePlans: () => Promise<SubscriptionPlan[]>;
  createSubscriptionOrder: (planId: string, amount: number) => Promise<string>;
  verifySubscriptionPayment: (paymentData: any, planId: string) => Promise<boolean>;
  createUpgradeOrder: (planId: string, amount: number, currentSubscriptionId: string) => Promise<string>;
  verifyUpgradePayment: (
    paymentData: any,
    planId: string,
    currentSubscriptionId: string
  ) => Promise<boolean>;
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
        return [];
      }
    },
    createSubscriptionOrder: async (planId, amount) => {
      set({ isLoading: true, error: null });
      try {
        const data = await hostRepository.createSubscriptionOrder(planId, amount);
        set({ isLoading: false });
        return data.orderId;
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to create payment order",
          isLoading: false,
        });
        throw error;
      }
    },
    verifySubscriptionPayment: async (paymentData, planId) => {
      set({ isLoading: true, error: null });
      try {
        const data = await hostRepository.verifySubscriptionPayment({
          ...paymentData,
          planId
        });
        
        if (data.success) {
          await hostRepository.getHostSubscription().then(data => {
            set({ subscription: data.subscription });
          });
        }
        
        set({ isLoading: false });
        return data.success;
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to verify payment",
          isLoading: false,
        });
        return false;
      }
    },
    createUpgradeOrder: async (planId, amount, currentSubscriptionId) => {
      set({ isLoading: true, error: null });
      try {
        const data = await hostRepository.createUpgradeOrder(planId, amount, currentSubscriptionId);
        set({ isLoading: false });
        return data.orderId;
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to create upgrade order",
          isLoading: false,
        });
        throw error;
      }
    },
    verifyUpgradePayment: async (paymentData, planId, currentSubscriptionId) => {
      set({ isLoading: true, error: null });
      try {
        console.log("Verifying upgrade payment with:", {
          ...paymentData,
          planId,
          currentSubscriptionId
        });
        
        const data = await hostRepository.verifyUpgradePayment({
          ...paymentData,
          planId,
          currentSubscriptionId
        });
        
        if (data.success) {
          await hostRepository.getHostSubscription().then(data => {
            set({ subscription: data.subscription });
          });
        }
        
        set({ isLoading: false });
        return data.success;
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to verify upgrade payment",
          isLoading: false,
        });
        return false;
      }
    }
  }));