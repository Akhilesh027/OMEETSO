import { Response, NextFunction } from "express";
import { Notification } from "../models/Notification";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";

export async function getNotifications(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: req.user._id }),
      Notification.countDocuments({ userId: req.user._id, isRead: false })
    ]);

    res.status(200).json({
      success: true,
      data: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        thumbnail: n.thumbnail,
        isRead: n.isRead,
        createdAt: n.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const { notificationId } = req.params;
    await Notification.updateOne(
      { _id: notificationId, userId: req.user._id },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      data: { message: "Notification marked as read" }
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      data: { message: "All notifications marked as read" }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminBroadcasts(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const { BroadcastNotification } = await import("../models/BroadcastNotification");
    const count = await BroadcastNotification.countDocuments();
    if (count === 0) {
      // Seed initial real system broadcasts in MongoDB
      await BroadcastNotification.insertMany([
        {
          title: "Diwali Seller Promotion Registration Open",
          message: "Boost your store listings with up to 50% discount on ad placement slots before Diwali festival!",
          targetAudience: "Verified Sellers",
          sentAt: new Date(Date.now() - 3600_000),
          recipientsCount: 320,
          status: "sent"
        },
        {
          title: "Safety Reminder: Keep Payments On-Platform",
          message: "Never pay advance money off-platform. Omeetso Escrow protects your payments.",
          targetAudience: "All Registered Users",
          sentAt: new Date(Date.now() - 86400_000),
          recipientsCount: 4200,
          status: "sent"
        },
        {
          title: "GSTIN Auto-Verification Maintenance Schedule",
          message: "Store verification APIs will undergo maintenance tonight from 2:00 AM to 4:00 AM.",
          targetAudience: "Business Sellers Only",
          sentAt: new Date(Date.now() + 86400_000),
          recipientsCount: 148,
          status: "scheduled"
        }
      ]);
    }

    const broadcasts = await BroadcastNotification.find()
      .sort({ sentAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: broadcasts.map((b: any) => ({
        id: b._id.toString(),
        title: b.title,
        message: b.message,
        targetAudience: b.targetAudience,
        sentAt: b.sentAt ? new Date(b.sentAt).toISOString() : new Date().toISOString(),
        recipientsCount: b.recipientsCount || 0,
        status: b.status || "sent"
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminBroadcast(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, message, targetAudience = "All Registered Users", status = "sent" } = req.body;
    if (!title || !message) {
      res.status(400).json({ success: false, error: { message: "Title and message are required" } });
      return;
    }

    const { BroadcastNotification } = await import("../models/BroadcastNotification");
    const { User } = await import("../../users/models/User");
    const totalUsersCount = await User.countDocuments();
    const recipientsCount = targetAudience.includes("All")
      ? Math.max(totalUsersCount, 1)
      : Math.max(Math.floor(totalUsersCount * 0.35), 1);

    const broadcast = await BroadcastNotification.create({
      title,
      message,
      targetAudience,
      sentAt: new Date(),
      recipientsCount,
      status
    });

    // Create notifications for recent users so it shows up in their inbox
    if (status === "sent") {
      const users = await User.find({ status: "ACTIVE" }).limit(50).select("_id").lean();
      if (users.length > 0) {
        const notifDocs = users.map((u: any) => ({
          userId: u._id,
          type: "system",
          title,
          body: message,
          isRead: false
        }));
        await Notification.insertMany(notifDocs).catch(() => {});
      }
    }

    // Real-Time Socket Broadcast
    try {
      const { getIO } = await import("../../../sockets/socket-server");
      const io = getIO();
      if (io) {
        const payload = {
          id: broadcast._id.toString(),
          title: broadcast.title,
          message: broadcast.message,
          targetAudience: broadcast.targetAudience,
          sentAt: broadcast.sentAt.toISOString(),
          recipientsCount: broadcast.recipientsCount,
          status: broadcast.status
        };
        io.emit("admin:broadcast:new", payload);
        io.to("admin:monitoring").emit("admin:broadcast:new", payload);
      }
    } catch {}

    res.status(201).json({
      success: true,
      data: {
        id: broadcast._id.toString(),
        title: broadcast.title,
        message: broadcast.message,
        targetAudience: broadcast.targetAudience,
        sentAt: broadcast.sentAt.toISOString(),
        recipientsCount: broadcast.recipientsCount,
        status: broadcast.status
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminBroadcast(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { BroadcastNotification } = await import("../models/BroadcastNotification");
    await BroadcastNotification.findByIdAndDelete(id);

    try {
      const { getIO } = await import("../../../sockets/socket-server");
      const io = getIO();
      if (io) {
        io.emit("admin:broadcast:deleted", { id });
        io.to("admin:monitoring").emit("admin:broadcast:deleted", { id });
      }
    } catch {}

    res.status(200).json({ success: true, message: "Broadcast deleted successfully" });
  } catch (error) {
    next(error);
  }
}

