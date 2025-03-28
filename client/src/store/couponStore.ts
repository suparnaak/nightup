import { create } from "zustand";
import { adminRepository } from "../repositories/adminRepository";

export interface Coupon {
  id: string;
  couponCode: string;
  couponAmount: number;
  minimumAmount: number;
  startDate: string; 
  endDate: string;   
  couponQuantity: number;
  usedCount: number;
  status: "active" | "expired" | "pending";
}

interface CouponState {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  getCoupons: () => Promise<Coupon[]>;
  createCoupon: (payload: {
    couponAmount: number;
    minimumAmount: number;
    startDate: string;
    endDate: string;
    couponQuantity: number;
    couponCode: string;
  }) => Promise<any>;
  updateCoupon: (
    id: string,
    payload: {
      couponAmount?: number;
      minimumAmount?: number;
      startDate?: string;
      endDate?: string;
      couponQuantity?: number;
    }
  ) => Promise<any>;
  deleteCoupon: (id: string) => Promise<any>;
}

export const useCouponStore = create<CouponState>((set, get) => ({
  coupons: [],
  isLoading: false,
  error: null,

  getCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getCoupons();
      const coupons = data.coupons.map((coupon: any) => ({
        id: coupon._id.toString(),
        ...coupon,
      }));
      set({ coupons, isLoading: false });
      return coupons;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load coupons",
        isLoading: false,
      });
      throw error;
    }
  },

  createCoupon: async (payload: {
    couponAmount: number;
    minimumAmount: number;
    startDate: string;
    endDate: string;
    couponQuantity: number;
    couponCode: string;
  }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.createCoupon(payload);
      await get().getCoupons();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create coupon",
        isLoading: false,
      });
      throw error;
    }
  },

  updateCoupon: async (
    id: string,
    payload: {
      couponAmount?: number;
      minimumAmount?: number;
      startDate?: string;
      endDate?: string;
      couponQuantity?: number;
    }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.updateCoupon(id, payload);
      await get().getCoupons();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update coupon",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCoupon: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.deleteCoupon(id);
      await get().getCoupons();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete coupon",
        isLoading: false,
      });
      throw error;
    }
  },
}));

