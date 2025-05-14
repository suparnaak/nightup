import { create } from "zustand";
import { walletRepository } from "../services/walletService";

export interface Transaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description?: string;
  paymentId?: string;
  date: string;
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}

interface WalletState {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getWallet: (page?: number, limit?: number) => Promise<Wallet | null>;
  createWalletOrder: (amount: number) => Promise<string>;
  verifyWalletPayment: (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    amount: number;
  }) => Promise<boolean>;
}

export const useWalletStore = create<WalletState>((set,get) => ({
  wallet: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  /* getWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await walletRepository.getWallet();
      set({ wallet: data.wallet, isLoading: false });
      return data.wallet;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load wallet details",
        isLoading: false,
      });
      return null;
    }
  }, */
  setPage: (page: number) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        page
      }
    }));
    get().getWallet(page, get().pagination.limit);
  },
  
  setLimit: (limit: number) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        limit
      }
    }));
    get().getWallet(1, limit); // Reset to first page when changing limit
  },

  getWallet: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await walletRepository.getWallet(page, limit);
      set({ 
        wallet: data.wallet, 
        isLoading: false,
        pagination: {
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit,
          totalPages: data.pagination.totalPages
        }
      });
      return data.wallet;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load wallet details",
        isLoading: false,
      });
      return null;
    }
  },

  createWalletOrder: async (amount: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await walletRepository.createWalletOrder(amount);
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

  verifyWalletPayment: async (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    amount: number;
  }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await walletRepository.verifyWalletPayment(paymentData);
      if (data.success) {
        
        await useWalletStore.getState().getWallet();
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
}));

export default useWalletStore;
