import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export let io: SocketIOServer;

const onlineUsers = new Map<string, string>(); 
const userSockets = new Map<string, string>(); 
const activeConversations = new Map<string, { eventId: string; otherId: string }>(); 

export const initializeSocket = (server: HttpServer): void => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinUserRoom", (userId: string) => {
      const room = `user-${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined user room: ${room}`);
    });

    socket.on("joinRoom", (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on("sendMessage", (data) => {
      io.to(data.room).emit("receiveMessage", data);
      console.log("Message sent to room", data.room, data);
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
    });

    // for online status
    socket.on("userOnline", (userId: string) => {
      console.log(`User ${userId} came online with socket ${socket.id}`);
      
      // track online status
      onlineUsers.set(userId, socket.id);
      userSockets.set(socket.id, userId);
      io.emit("userOnline", userId);
      console.log("Current online users:", Array.from(onlineUsers.keys()));
    });

    socket.on("userOffline", (userId: string) => {
      console.log(`User ${userId} going offline`);
      handleUserOffline(userId, socket.id);
    });

    socket.on("getOnlineUsers", () => {
      const onlineUserIds = Array.from(onlineUsers.keys());
      socket.emit("onlineUsers", onlineUserIds);
      console.log("Sent online users list:", onlineUserIds);
    });

  //conversations
    socket.on("joinConversation", (data: { userId: string; eventId: string; otherId: string }) => {
      console.log(`User ${data.userId} joined conversation ${data.eventId} with ${data.otherId}`);
      
      // active tracking
      activeConversations.set(data.userId, {
        eventId: data.eventId,
        otherId: data.otherId
      });
      
      // online notification
      const otherUserSocketId = onlineUsers.get(data.otherId);
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("conversationJoined", data);
      }
      
      console.log("Active conversations:", Array.from(activeConversations.entries()));
    });

    socket.on("leaveConversation", (data: { userId: string; eventId: string; otherId: string }) => {
      console.log(`User ${data.userId} left conversation ${data.eventId} with ${data.otherId}`);
      
      // remove from active conversations
      activeConversations.delete(data.userId);
      
      // notify that user left
      const otherUserSocketId = onlineUsers.get(data.otherId);
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("conversationLeft", data);
      }
      
      console.log("Active conversations:", Array.from(activeConversations.entries()));
    });

    //disconnect
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      
      const userId = userSockets.get(socket.id);
      if (userId) {
        handleUserOffline(userId, socket.id);
      }
    });
  });
};

// helper function - user going online
const handleUserOffline = (userId: string, socketId: string) => {
  onlineUsers.delete(userId);
  userSockets.delete(socketId);
  
  const activeConv = activeConversations.get(userId);
  if (activeConv) {
    activeConversations.delete(userId);
    
    const otherUserSocketId = onlineUsers.get(activeConv.otherId);
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("conversationLeft", {
        userId: userId,
        eventId: activeConv.eventId,
        otherId: activeConv.otherId
      });
    }
  }
  
  io.emit("userOffline", userId);
  
  console.log(`User ${userId} went offline`);
  console.log("Current online users:", Array.from(onlineUsers.keys()));
};

export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsers.keys());
};

export const getActiveConversations = (): Array<{ userId: string; eventId: string; otherId: string }> => {
  return Array.from(activeConversations.entries()).map(([userId, conv]) => ({
    userId,
    eventId: conv.eventId,
    otherId: conv.otherId
  }));
};

export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

export const isUserInConversation = (userId: string, eventId: string, otherId: string): boolean => {
  const activeConv = activeConversations.get(userId);
  return activeConv?.eventId === eventId && activeConv?.otherId === otherId;
};