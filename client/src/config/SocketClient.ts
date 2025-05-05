import { io as socketIO } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

// socket instance is created
export const io = socketIO(SOCKET_URL, {
  autoConnect: true,
 
});


io.on('connect', () => {
  console.log('Socket connected with ID:', io.id);
});

io.on('disconnect', () => {
  console.log('Socket disconnected');
});

io.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});