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
  documentStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}
/* export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string; // e.g., "Monthly", "6 Months", "Yearly"
  price: number;
} */
interface AdminState {
  hosts: Host[];
  users: User[];
  //subscriptions: SubscriptionPlan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  //getHosts: () => Promise<Host[]>;
  getHosts: (page?: number, limit?: number) => Promise<{ hosts: Host[], pagination: any }>;
  clearHosts: () => void;
  verifyDocument: (payload: {
    hostId: string;
    action: "approve" | "reject";
  }) => Promise<any>;
  hostToggleStatus: (hostId: string, newStatus: boolean) => Promise<any>;
  getUsers: (page?: number, limit?: number) => Promise<{ users: User[], pagination: any }>;
  userToggleStatus: (userId: string, newStatus: boolean) => Promise<any>;
  /* getSubscriptions: () => Promise<SubscriptionPlan[]>;
  createSubscription: (payload: { name: string; duration: string; price: number }) => Promise<any>;
  updateSubscription: (id: string, payload: { name: string; duration: string; price: number }) => Promise<any>;
  deleteSubscription: (id: string) => Promise<any>; */
}

export const useAdminStore = create<AdminState>((set, get) => ({
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

  /* getHosts: async () => {
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
 */
  getHosts: async (page: number = 1, limit: number = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getHosts(page, limit);
      const transformedHosts = data.hosts.map((host: any) => ({
        id: host._id.toString(),
        ...host,
      }));
      set({ 
        hosts: transformedHosts, 
        isLoading: false,
        pagination: data.pagination
      });
      return { hosts: transformedHosts, pagination: data.pagination };
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
      //await get().getHosts();
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

  /* getUsers: async () => {
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
  }, */
  getUsers: async (page: number = 1, limit: number = 10) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getUsers(page, limit);
      const transformedUsers = data.users.map((user: any) => ({
        id: user._id.toString(),
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
      //await get().getUsers();
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
  /* getSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminRepository.getSubscriptions();
      // Transform subscriptions if necessary; assuming data.subscriptions is the array.
      const subscriptions = data.subscriptions.map((sub: any) => ({
        id: sub._id.toString(),
        ...sub,
      }));
      set({ subscriptions, isLoading: false });
      return subscriptions;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to load subscriptions",
        isLoading: false,
      });
      throw error;
    }
  },

  createSubscription: async (payload: { name: string; duration: string; price: number }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.createSubscription(payload);
      await get().getSubscriptions();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create subscription",
        isLoading: false,
      });
      throw error;
    }
  },

  updateSubscription: async (
    id: string,
    payload: { name: string; duration: string; price: number }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.updateSubscription(id, payload);
      await get().getSubscriptions();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update subscription",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSubscription: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminRepository.deleteSubscription(id);
      await get().getSubscriptions();
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete subscription",
        isLoading: false,
      });
      throw error;
    }
  }, */
}));

//export default adminRepository;
