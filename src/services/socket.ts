import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://backend-tncs.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("[Socket] Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket] Disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("[Socket] Connection error:", error.message);
});

socket.on("user_advisor_error", (data) => {
  console.error("[Socket] User advisor error:", data);
});

export default socket;
