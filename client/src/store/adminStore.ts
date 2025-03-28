// src/store/adminStore.ts
import { create } from "zustand";
import { adminRepository } from "../repositories/adminRepository";

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string | number | Date;
}

export interface User extends BaseUser {}

export interface Host extends BaseUser {
  hostType: string;
  subscriptionPlan: string;
  subStatus: string;
  documentUrl: string;
  // Replace adminVerified with documentStatus and optional rejectionReason
  documentStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

interface AdminState {
  hosts: Host[];
  users: User[];
  isLoading: boolean;
  error: string | null;
  getHosts: () => Promise<Host[]>;
  clearHosts: () => void;
  verifyDocument: (payload: {
    hostId: string;
    action: "approve" | "reject";
  }) => Promise<any>;
  hostToggleStatus: (hostId: string, newStatus: boolean) => Promise<any>;
  getUsers: () => Promise<User[]>;
  userToggleStatus: (userId: string, newStatus: boolean) => Promise<any>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  hosts: [],
  users: [],
  isLoading: false,
  error: null,

  getHosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getHosts();
      const transformedHosts = data.hosts.map((host: any) => ({
        id: host._id.toString(),
        ...host,
      }));
      set({ hosts: transformedHosts, isLoading: false });
      return transformedHosts;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load hosts",
        isLoading: false,
      });
      throw error;
    }
  },

  clearHosts: () => set({ hosts: [] }),

  verifyDocument: async (payload: {
    hostId: string;
    action: "approve" | "reject";
    rejectionReason?: string;
  }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.verifyDocument(payload);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update document verification",
        isLoading: false,
      });
      throw error;
    }
  },

  hostToggleStatus: async (hostId: string, newStatus: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.hostToggleStatus({
        hostId,
        newStatus,
      });
      await get().getHosts();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update block status",
        isLoading: false,
      });
      throw error;
    }
  },

  getUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getUsers();
      const transformedUsers = data.users.map((user: any) => ({
        id: user._id.toString(),
        ...user,
      }));
      set({ users: transformedUsers, isLoading: false });
      return transformedUsers;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load users",
        isLoading: false,
      });
      throw error;
    }
  },

  userToggleStatus: async (userId: string, newStatus: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.userToggleStatus({
        userId,
        newStatus,
      });
      await get().getUsers();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to update user block status",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default adminRepository;
