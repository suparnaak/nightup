import axiosUserClient from "../api/axiosUserClient";

export const notificationRepository = {
  list: async () => {
    const res = await axiosUserClient.get("/notifications");
    return res.data.notifications;        
  },

  countUnread: async () => {
    const res = await axiosUserClient.get("/notifications/count");
    return res.data.count;
  },

  markRead: async (id: string) => {
    await axiosUserClient.put(`/notifications/${id}/read`);
  },
};
