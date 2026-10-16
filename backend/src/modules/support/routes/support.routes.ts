import { Router } from "express";
import {
  createTicket,
  getMyTickets,
  getTicketById,
  updateTicketStatus,
  getTicketMessages,
  addTicketMessage,
  getAdminSupportTickets,
  adminReplyTicket,
  adminGetTicketMessages
} from "../controllers/support.controller";
import { authenticateUser } from "../../../middleware/authenticateUser";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import { requirePermission } from "../../../middleware/requirePermission";

export const supportRouter = Router();

const optionalAuthUser = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  return authenticateUser(req, res, () => {
    next();
  });
};

supportRouter.post("/tickets", optionalAuthUser, createTicket);
supportRouter.get("/tickets", authenticateUser, getMyTickets);
supportRouter.get("/tickets/:ticketId", authenticateUser, getTicketById);
supportRouter.patch("/tickets/:ticketId/status", authenticateUser, updateTicketStatus);
supportRouter.get("/tickets/:ticketId/messages", authenticateUser, getTicketMessages);
supportRouter.post("/tickets/:ticketId/messages", authenticateUser, addTicketMessage);

supportRouter.get("/admin/tickets", authenticateAdmin, requirePermission("support.view"), getAdminSupportTickets);
supportRouter.get("/admin/tickets/:ticketId/messages", authenticateAdmin, requirePermission("support.view"), adminGetTicketMessages);
supportRouter.post("/admin/tickets/:ticketId/reply", authenticateAdmin, requirePermission("support.manage"), adminReplyTicket);

