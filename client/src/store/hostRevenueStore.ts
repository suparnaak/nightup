import { create } from "zustand";
import hostRepository from "../repositories/hostRepository";

export interface HostRevenueData {
  totalRevenue: number;
  monthlyRevenue: { month: string; amount: number }[];
  eventRevenue: { eventId: string; eventName: string; amount: number; ticketsSold: number }[];
  paymentMethods: { type: string; count: number; amount: number }[];
  recentTransactions: Array<{
    userName: string;
    eventName: string;
    ticketNumber: string;
    amount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    date: string;
  }>;
  cancellations: Array<{
    cancelledBy: string;
    count: number;
    amount: number;
  }>;
  ticketTypes: Array<{
    ticketType: string;
    quantity: number;
    revenue: number;
  }>;
}

interface HostRevenueState {
  revenueData: HostRevenueData | null;
  isLoading: boolean;
  error: string | null;
  getHostRevenueData: (period?: string) => Promise<HostRevenueData | null>;
  generateHostRevenueReport: (period?: string) => Promise<boolean>;
}

export const useHostRevenueStore = create<HostRevenueState>((set) => ({
  revenueData: null,
  isLoading: false,
  error: null,

  getHostRevenueData: async (period = "month") => {
    set({ isLoading: true, error: null });
    try {
      const data = await hostRepository.getHostRevenueData(period);
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

  generateHostRevenueReport: async (period = "month") => {
    set({ isLoading: true, error: null });
    try {
      await hostRepository.generateHostRevenueReport(period);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to generate report",
        isLoading: false,
      });
      return false;
    }
  },
}));