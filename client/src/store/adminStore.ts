import { create } from "zustand";
import { adminRepository } from "../services/adminService";
import {  User, Host } from "../types/adminTypes";

interface AdminState {
  hosts: Host[];
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  getHosts: (page?: number, limit?: number) => Promise<{ hosts: Host[], pagination: any }>;
  clearHosts: () => void;
  verifyDocument: (payload: {
    hostId: string;
    action: "approve" | "reject";
  }) => Promise<any>;
  hostToggleStatus: (hostId: string, newStatus: boolean) => Promise<any>;
  getUsers: (page?: number, limit?: number) => Promise<{ users: User[], pagination: any }>;
  userToggleStatus: (userId: string, newStatus: boolean) => Promise<any>;
  
}

export const useAdminStore = create<AdminState>((set) => ({
  hosts: [],
  users: [],
  subscriptions: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },

  
  getHosts: async (page: number = 1, limit: number = 10) => {
  set({ isLoading: true, error: null });

  try {
    const data = await adminRepository.getHosts(page, limit);
    console.log(data.pagination)
    const transformedHosts: Host[] = data.hosts.map((host: any) => ({
      id:               host.id,
      name:             host.name,
      email:            host.email,
      phone:            host.phone,
      isVerified:       host.isVerified,
      isBlocked:        host.isBlocked,
      createdAt:        host.createdAt,
      hostType:         host.hostType,

      subscriptionPlan: host.currentPlan?.name ?? "None",
      subStatus:        host.currentPlan?.status ?? "Not Subscribed",

      documentUrl:      host.documentUrl,
      documentStatus:   host.documentStatus,
      rejectionReason:  host.rejectionReason,
    }));

    set({
      hosts:      transformedHosts,
      pagination: data.pagination,
      isLoading:  false
    });

    return { hosts: transformedHosts, pagination: data.pagination };

  } catch (error: any) {
    set({
      error:     error.response?.data?.message || "Failed to load hosts",
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
    set((state) => ({
      isLoading: false,
      hosts: state.hosts.map((h) => {
        if (h.id !== payload.hostId) return h;
        return {
          ...h,
          documentStatus: payload.action === "approve" ? "approved" : "rejected",
          ...(payload.rejectionReason && { rejectionReason: payload.rejectionReason }),
        };
      }),
    }));
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
      set((state) => ({
        isLoading: false,
        hosts: state.hosts.map((h) =>
          h.id === hostId
            ? { ...h, isBlocked: newStatus }
            : h
        ),
      }));
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update block status",
        isLoading: false,
      });
      throw error;
    }
  },


  getUsers: async (page: number = 1, limit: number = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getUsers(page, limit);
      console.log(data)
      const transformedUsers = data.users.map((user: any) => ({
        id: user.id,
        ...user,
      }));
      set({ 
        users: transformedUsers, 
        isLoading: false,
        pagination: data.pagination
      });
      return { users: transformedUsers, pagination: data.pagination };
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
      set((state) => ({
        isLoading: false,
        users: state.users.map((u) =>
          u.id === userId
            ? { ...u, isBlocked: newStatus }
            : u
        ),
      }));
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

