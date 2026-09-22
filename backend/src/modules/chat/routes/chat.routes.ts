import { Router } from "express";
import {
  startConversation,
  getConversations,
  getConversationById,
  getMessages,
  sendMessage,
  createOffer,
  updateOfferStatus,
  getOfferById,
  markConversationAsRead
} from "../controllers/chat.controller";
import { authenticateUser } from "../../../middleware/authenticateUser";

export const chatRouter = Router();

chatRouter.post("/conversations", authenticateUser, startConversation);
chatRouter.get("/conversations", authenticateUser, getConversations);
chatRouter.get("/conversations/:conversationId", authenticateUser, getConversationById);
chatRouter.post("/conversations/:conversationId/read", authenticateUser, markConversationAsRead);
chatRouter.get("/conversations/:conversationId/messages", authenticateUser, getMessages);
chatRouter.post("/conversations/:conversationId/messages", authenticateUser, sendMessage);
chatRouter.post("/conversations/:conversationId/offers", authenticateUser, createOffer);
chatRouter.get("/offers/:offerId", authenticateUser, getOfferById);
chatRouter.patch("/offers/:offerId/status", authenticateUser, updateOfferStatus);

