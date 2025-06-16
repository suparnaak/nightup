import { create } from "zustand";
import { adminRepository } from "../services/adminService";
import { userRepository } from "../services/userService";
import { Coupon } from "../types/couponTypes";

interface CouponState {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  getCoupons: (page?: number, limit?: number) => Promise<Coupon[]>;
  getAvailableCoupons: (totalAmount?: number) => Promise<Coupon[]>; // for users while booking
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
  pagination: {
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 10,
  },

  getCoupons: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getCoupons(page, limit);
      console.log("Raw API response:", data);

      if (data.success && Array.isArray(data.coupons)) {
        set({
          coupons: data.coupons,
          pagination: data.pagination,
          isLoading: false,
        });
        return data.coupons;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("getCoupons error details:", error);
      set({
        error: error.message || "Failed to load coupons",
        isLoading: false,
      });
      throw error;
    }
  },

  createCoupon: async (payload: {
    couponCode: string;
    couponAmount: number;
    minimumAmount: number;
    startDate: string;
    endDate: string;
    couponQuantity: number;
  }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.createCoupon(payload);
      console.log("Create coupon response:", response);

      if (response.success) {
        await get().getCoupons();
        set({ isLoading: false });
        return response;
      } else {
        throw new Error(response.message || "Failed to create coupon");
      }
    } catch (error: any) {
      console.error("Create coupon error:", error);
      set({
        error: error.message || "Failed to create coupon",
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
  //for users while booking
  getAvailableCoupons: async (totalAmount?: number) => {
    console.log("amount", totalAmount);
    set({ isLoading: true, error: null });
    try {
      const data = await userRepository.getAvailableCoupons(totalAmount);
      console.log("Public coupons:", data);

      set({ coupons: data, isLoading: false });
      return data;
    } catch (error: any) {
      console.error("getAvailableCoupons error:", error);
      set({
        error: error.message || "Failed to fetch available coupons",
        isLoading: false,
      });
      throw error;
    }
  },
}));
