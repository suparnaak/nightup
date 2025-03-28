import axiosAdminClient from "../api/axiosAdminClient";

export const adminRepository = {
  // list all the hosts
  getHosts: async () => {
    const response = await axiosAdminClient.get("/hosts");
    return response.data;
  },
  //document verification
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
  //block or unblock hosts
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
  //get all usrs
  getUsers: async () => {
    const response = await axiosAdminClient.get("/users");
    return response.data;
  },
  //block or unblock users
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
    //console.log(response)
    return response.data;
  },
};

export default adminRepository;
