import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAdminBroadcasts,
  createAdminBroadcast,
  deleteAdminBroadcast
} from "../controllers/notifications.controller";
import { authenticateUser } from "../../../middleware/authenticateUser";

export const notificationsRouter = Router();

notificationsRouter.get("/", authenticateUser, getNotifications);
notificationsRouter.patch("/read-all", authenticateUser, markAllNotificationsRead);
notificationsRouter.patch("/:notificationId/read", authenticateUser, markNotificationRead);

// Admin Broadcast endpoints
notificationsRouter.get("/broadcasts", getAdminBroadcasts);
notificationsRouter.post("/broadcasts", createAdminBroadcast);
notificationsRouter.delete("/broadcasts/:id", deleteAdminBroadcast);
