import { create } from "zustand";
import { adminRepository } from "../services/adminService";
import hostRepository from "../services/hostService";
import { userRepository } from "../services/userService";
import { Pagination } from "../types/commonTypes";
import { Category } from "../types/categoryTypes";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;

  getCategories: (page?: number, limit?: number) => Promise<{
    categories: Category[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  }>;
  getHostCategories: () => Promise<Category[]>;
  getUserCategories: () => Promise<Category[]>;
  createCategory: (payload: {
    name: string;
    description: string;
  }) => Promise<Category>;

  updateCategory: (
    id: string,
    payload: { name: string; description: string }
  ) => Promise<Category>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    limit: 10
  },
//getting all the categoris for admin
  getCategories: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getCategories(page, limit);
      if (data.success && Array.isArray(data.categories)) {
        set({ 
          categories: data.categories, 
          pagination: data.pagination || {
            total: data.categories.length,
            page,
            totalPages: 1,
            limit
          },
          isLoading: false 
        });
        return {
          categories: data.categories,
          pagination: data.pagination || {
            total: data.categories.length,
            page,
            totalPages: 1, 
            limit
          }
        };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("getCategories error:", err);
      set({
        error: err.message || "Failed to load categories",
        isLoading: false,
      });
      throw err;
    }
  },
  //get all the categories for host
  getHostCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const cats = await hostRepository.getCategories();
      set({ categories: cats, isLoading: false });
      return cats;
    } catch (err: any) {
      console.error("getHostCategories error:", err);
      set({ error: err.message || "Failed to load categories", isLoading: false });
      throw err;
    }
  },
  //getting all the categories for user
  getUserCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const cats = await userRepository.getCategories();
      set({ categories: cats, isLoading: false });
      return cats;
    } catch (err: any) {
      console.error("getHostCategories error:", err);
      set({ error: err.message || "Failed to load categories", isLoading: false });
      throw err;
    }
  },
  //creating a new category-admin
  createCategory: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.createCategory(payload);
      if (data.success && data.category) {
        await get().getCategories();
        set({ isLoading: false });
        return data.category;
      } else {
        throw new Error(data.message || "Failed to create category");
      }
    } catch (err: any) {
      console.error("createCategory error:", err);
      set({
        error: err.message || "Failed to create category",
        isLoading: false,
      });
      throw err;
    }
  },
//update a ctegory - admin
  updateCategory: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      console.log(id)
      console.log(payload)
      const data = await adminRepository.updateCategory(id, payload);
      if (data.success && data.category) {
        await get().getCategories();
        set({ isLoading: false });
        return data.category;
      } else {
        throw new Error(data.message || "Failed to update category");
      }
    } catch (err: any) {
      console.error("updateCategory error:", err);
      set({
        error: err.message || "Failed to update category",
        isLoading: false,
      });
      throw err;
    }
  },
}));
