import { create } from "zustand";
import { adminRepository } from "../services/adminService";

export interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: { month: string; amount: number }[];
  planRevenue: { planName: string; amount: number }[];
  transactionTypes: { type: string; count: number; amount: number }[];
  recentTransactions: Array<{
    id: string;
    hostName: string;
    planName: string;
    amount: number;
    date: string;
    type: string;
  }>;
}

interface AdminRevenueState {
  revenueData: RevenueData | null;
  isLoading: boolean;
  error: string | null;
  getRevenueData: (period?: string) => Promise<RevenueData | null>;
  generateRevenueReport: (period?: string) => Promise<string>; 
}

export const useAdminRevenueStore = create<AdminRevenueState>((set) => ({
  revenueData: null,
  isLoading: false,
  error: null,

  getRevenueData: async (period = "year") => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getRevenueData(period);
      set({ revenueData: data, isLoading: false });
      return data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load revenue data",
        isLoading: false,
      });
      return null;
    }
  },

  generateRevenueReport: async (period = "year") => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.generateRevenueReport(period);
      set({ isLoading: false });
      return data.reportUrl;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to generate report",
        isLoading: false,
      });
      throw error;
    }
  },
}));