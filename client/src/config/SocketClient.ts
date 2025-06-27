import { io as createSocket, Socket } from "socket.io-client";
import { useNotificationStore } from "../store/notificationStore";
import { useAuthStore } from "../store/authStore";

const SOCKET_URL = import.meta.env.VITE_API_URL;

// io instance
export const io: Socket = createSocket(SOCKET_URL, {
  autoConnect: true,
});

io.on("connect", () => {
  console.log("Socket connected with ID:", io.id);

  const auth = useAuthStore.getState();
  const user = auth.user;
  if (user?.role === "user") {
    const userId = user.id;
    io.emit("joinUserRoom", userId);
    console.log(`Joined notification room: user-${userId}`);

    useNotificationStore.getState().fetchUnreadCount();
  }
});

io.on("eventNotification", (payload) => {
  console.log("Received eventNotification:", payload);
  useNotificationStore.getState().addNotification(payload);
});

io.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

io.on("connect_error", (err) => {
  console.error("Socket connection error:", err);
});
