import axiosAdminClient from "../api/axiosAdminClient";

export const adminRepository = {
  // list all the hosts
  getHosts: async () => {
    const response = await axiosAdminClient.get("/hosts");
    return response.data;
  },
  // document verification
  verifyDocument: async ({
    hostId,
    action,
    rejectionReason,
  }: {
    hostId: string;
    action: "approve" | "reject";
    rejectionReason?: string;
  }) => {
    const response = await axiosAdminClient.post("/hosts/verify-document", {
      hostId,
      action,
      rejectionReason,
    });
    return response.data;
  },
  // block or unblock hosts
  hostToggleStatus: async ({
    hostId,
    newStatus,
  }: {
    hostId: string;
    newStatus: boolean;
  }) => {
    const response = await axiosAdminClient.post("/hosts/toggle-block", {
      hostId,
      newStatus,
    });
    return response.data;
  },
  // get all users
  getUsers: async () => {
    const response = await axiosAdminClient.get("/users");
    return response.data;
  },
  // block or unblock users
  userToggleStatus: async ({
    userId,
    newStatus,
  }: {
    userId: string;
    newStatus: boolean;
  }) => {
    const response = await axiosAdminClient.post("/users/toggle-block", {
      userId,
      newStatus,
    });
    return response.data;
  },
  // subscription management
  getSubscriptions: async () => {
    const response = await axiosAdminClient.get("/subscriptions");
    return response.data;
  },
  createSubscription: async (payload: {
    name: string;
    duration: string;
    price: number;
  }) => {
    const response = await axiosAdminClient.post("/subscriptions", payload);
    return response.data;
  },
  updateSubscription: async (
    id: string,
    payload: { name: string; duration: string; price: number }
  ) => {
    const response = await axiosAdminClient.put(`/subscriptions/${id}`, payload);
    return response.data;
  },
  deleteSubscription: async (id: string) => {
    const response = await axiosAdminClient.delete(`/subscriptions/${id}`);
    return response.data;
  },
  // coupon management
  getCoupons: async () => {
    const response = await axiosAdminClient.get("/coupons");
    return response.data; // This should be the { success, coupons } object
  },
  createCoupon: async (payload: {
    couponCode: string;
    couponAmount: number;
    minimumAmount: number;
    startDate: string;
    endDate: string;
    couponQuantity: number;
  }) => {
    const response = await axiosAdminClient.post("/coupons", payload);
    return response.data;
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
    const response = await axiosAdminClient.put(`/coupons/${id}`, payload);
    return response.data;
  },
  deleteCoupon: async (id: string) => {
    const response = await axiosAdminClient.delete(`/coupons/${id}`);
    return response.data;
  },
  //category management
  getCategories: async () => {
    const response = await axiosAdminClient.get("/event-types");
    return response.data;
  },
  createCategory: async (payload: {
    name: string;
    description: string;
  }) => {
    const response = await axiosAdminClient.post("/event-types", payload);
    return response.data;
  },
  updateCategory: async (
    id: string,
    payload: {
      name: string;
      description: string;
    }
  ) => {
    const response = await axiosAdminClient.put(
      `/event-types/${id}`,
      payload
    );
    return response.data;
  },
  getRevenueData: async (period = "year") => {
    const { data } = await axiosAdminClient.get(`/revenue?period=${period}`);
    return data;
  },

  generateRevenueReport: async (period = "year") => {
    const { data } = await axiosAdminClient.get(`/revenue/report?period=${period}`, {
      responseType: 'blob'
    });
    // Create a URL for the blob data to download
    const blob = new Blob([data], { type: 'application/pdf' });
    const reportUrl = URL.createObjectURL(blob);
    return { reportUrl };
  },
};

export default adminRepository;
