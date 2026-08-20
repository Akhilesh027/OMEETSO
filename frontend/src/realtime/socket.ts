import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/api";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinConversation(conversationId: string): void {
  socket?.emit("conversation:join", { conversationId });
}

export function leaveConversation(conversationId: string): void {
  socket?.emit("conversation:leave", { conversationId });
}

export function emitTypingStart(conversationId: string, recipientId: string): void {
  socket?.emit("typing:start", { conversationId, recipientId });
}

export function emitTypingStop(conversationId: string, recipientId: string): void {
  socket?.emit("typing:stop", { conversationId, recipientId });
}

export function emitMessageAck(messageId: string): void {
  socket?.emit("message:ack", { messageId });
}

export function emitMessageRead(conversationId: string): void {
  socket?.emit("message:read", { conversationId });
}
