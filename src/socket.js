import { io } from "socket.io-client";


const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.MODE === "production"
    ? "https://chat-app-backend-1-1.onrender.com"
    : "http://localhost:5000");

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true 
});
/*
export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
  } else {
      console.log("Socket connected:", socket.id);
      socket.emit("setup", userId);
  }
};

*/