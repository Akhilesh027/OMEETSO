import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../modules/users/models/User";
import { AdminUser } from "../modules/admin/models/AdminUser";
import { Message } from "../modules/chat/models/Message";
import { Conversation } from "../modules/chat/models/Conversation";

let io: Server | null = null;
const onlineUsers = new Map<string, Set<string>>();

export function isUserOnline(userId: string): boolean {
  if (!userId) return false;
  const sockets = onlineUsers.get(userId);
  return Boolean(sockets && sockets.size > 0);
}

export function getOnlineUserIds(): string[] {
  return Array.from(onlineUsers.keys());
}

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // JWT Authentication Middleware (User or Admin)
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;

      if (decoded.aud === "omeetso-admin" && decoded.adminId) {
        const admin = await AdminUser.findById(decoded.adminId).select("_id email role").lean();
        if (!admin) {
          return next(new Error("Admin user not found"));
        }
        (socket as any).isAdmin = true;
        (socket as any).adminId = admin._id.toString();
        return next();
      }

      if (decoded.userId) {
        const user = await User.findById(decoded.userId).select("_id name email").lean();
        if (!user) {
          return next(new Error("User not found"));
        }
        (socket as any).userId = user._id.toString();
        return next();
      }

      return next(new Error("Invalid token payload"));
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const isAdmin = (socket as any).isAdmin;
    const adminId = (socket as any).adminId;
    const userId = (socket as any).userId;

    if (isAdmin) {
      console.log(`[Socket] Admin connected: ${adminId}`);
      socket.join("admin:monitoring");

      socket.on("admin:join_monitoring", () => {
        socket.join("admin:monitoring");
      });

      socket.on("admin:leave_monitoring", () => {
        socket.leave("admin:monitoring");
      });

      socket.on("admin:inspect_conversation", ({ conversationId }: { conversationId: string }) => {
        if (conversationId) {
          socket.join(`conversation:${conversationId}`);
        }
      });
      return;
    }

    if (!userId) return;

    // Track User Online Presence
    const userSockets = onlineUsers.get(userId) || new Set<string>();
    const isFirstConnection = userSockets.size === 0;
    userSockets.add(socket.id);
    onlineUsers.set(userId, userSockets);

    // Join Personal User Room for direct notifications & messages
    socket.join(`user:${userId}`);

    // Send initial list of currently online user IDs to the connected client
    socket.emit("presence:initial", { onlineUserIds: Array.from(onlineUsers.keys()) });

    // If newly online, broadcast to all clients
    if (isFirstConnection) {
      io?.emit("presence:status", { userId, online: true, lastSeen: Date.now() });
    }

    // Client presence check query
    socket.on("presence:query", ({ userIds }: { userIds: string[] }, callback?: (res: any) => void) => {
      const response: Record<string, boolean> = {};
      if (Array.isArray(userIds)) {
        userIds.forEach((id) => {
          response[id] = isUserOnline(id);
        });
      }
      if (typeof callback === "function") {
        callback(response);
      }
      socket.emit("presence:query:result", response);
    });

    // Join Specific Conversation Room
    socket.on("conversation:join", ({ conversationId }: { conversationId: string }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("conversation:leave", ({ conversationId }: { conversationId: string }) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Typing Indicators (In-Memory Only)
    socket.on("typing:start", ({ conversationId, recipientId }: { conversationId: string; recipientId: string }) => {
      if (conversationId && recipientId) {
        io?.to(`user:${recipientId}`).emit("typing:start", { conversationId, userId });
      }
    });

    socket.on("typing:stop", ({ conversationId, recipientId }: { conversationId: string; recipientId: string }) => {
      if (conversationId && recipientId) {
        io?.to(`user:${recipientId}`).emit("typing:stop", { conversationId, userId });
      }
    });

    // Message Acknowledgment (Delivery Confirmation)
    socket.on("message:ack", async ({ messageId }: { messageId: string }) => {
      try {
        if (!messageId) return;
        const msg = await Message.findById(messageId);
        if (msg && msg.status === "SENT") {
          msg.status = "DELIVERED";
          msg.deliveredAt = new Date();
          await msg.save();

          io?.to(`user:${msg.senderId.toString()}`).emit("message:delivered", {
            messageId: msg._id.toString(),
            conversationId: msg.conversationId.toString(),
            deliveredAt: msg.deliveredAt
          });
        }
      } catch (e) {}
    });

    // Message Read Receipt
    socket.on("message:read", async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!conversationId) return;
        const conv = await Conversation.findById(conversationId);
        if (!conv) return;

        // Update unread count for this user to 0
        const updatedCounts = conv.unreadCounts.map((uc) => {
          if (uc.userId.toString() === userId) {
            return { userId: uc.userId, count: 0 };
          }
          return uc;
        });
        conv.unreadCounts = updatedCounts as any;
        await conv.save();

        // Mark all messages as read
        await Message.updateMany(
          { conversationId, senderId: { $ne: userId }, status: { $ne: "READ" } },
          { $set: { status: "READ", readAt: new Date() } }
        );

        // Notify other participants
        conv.participantIds.forEach((pId) => {
          if (pId.toString() !== userId) {
            io?.to(`user:${pId.toString()}`).emit("message:read", {
              conversationId,
              readByUserId: userId,
              readAt: new Date()
            });
          }
        });
      } catch (e) {}
    });

    socket.on("disconnect", () => {
      const currentSockets = onlineUsers.get(userId);
      if (currentSockets) {
        currentSockets.delete(socket.id);
        if (currentSockets.size === 0) {
          onlineUsers.delete(userId);
          io?.emit("presence:status", { userId, online: false, lastSeen: Date.now() });
        }
      }
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}
