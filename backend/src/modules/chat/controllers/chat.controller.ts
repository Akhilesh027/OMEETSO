import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { Offer } from "../models/Offer";
import { Listing } from "../../listings/models/Listing";
import { Store } from "../../stores/models/Store";
import { Job } from "../../jobs/models/Job";
import { User } from "../../users/models/User";
import { Notification } from "../../notifications/models/Notification";
import { evaluateChatSafety } from "../../safety/utils/chatSafetyFilter";
import { SafetyReport } from "../../safety/models/SafetyReport";
import { SafetyPriority } from "../../../contracts";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { getIO } from "../../../sockets/socket-server";

export async function startConversation(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const { contextType = "LISTING", contextId, listingId, storeId, jobId, recipientId, applicantId } = req.body;
    let targetId = contextId || listingId || storeId || jobId;

    if (!targetId) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "contextId/listingId/storeId/jobId required" } });
      return;
    }

    let buyerId = req.user._id;
    let sellerId: any = recipientId || applicantId;
    let refListingId: any;
    let refStoreId: any;
    let refJobId: any;
    let entityContextId: mongoose.Types.ObjectId | undefined;

    const normalizedContext = (contextType || "LISTING").toUpperCase();

    if (normalizedContext === "STORE") {
      const isOid = mongoose.Types.ObjectId.isValid(targetId);
      const store = isOid ? await Store.findById(targetId) : await Store.findOne({ $or: [{ slug: targetId }, { id: targetId }] });
      if (store) {
        sellerId = (store as any).userId || (store as any).sellerId || (store as any).ownerId || sellerId;
        refStoreId = store._id;
        entityContextId = store._id;
      } else if (isOid) {
        entityContextId = new mongoose.Types.ObjectId(targetId);
      }
    } else if (normalizedContext === "JOB") {
      const isOid = mongoose.Types.ObjectId.isValid(targetId);
      const cleanTargetId = typeof targetId === "string" && targetId.startsWith("JOB-") ? targetId.replace("JOB-", "") : targetId;
      let job = isOid ? await Job.findById(targetId) : await Job.findOne({
        $or: [
          { slug: targetId },
          { id: targetId },
          { id: cleanTargetId },
          { id: `JOB-${cleanTargetId}` }
        ]
      });
      if (!job && isOid) {
        job = await Job.findById(targetId);
      }
      if (!job) {
        job = await Job.findOne();
      }
      if (job) {
        refJobId = job._id;
        entityContextId = job._id;

        if (req.user._id.toString() === job.employerId?.toString()) {
          sellerId = job.employerId;
          buyerId = recipientId || applicantId || req.user._id;
        } else {
          buyerId = req.user._id;
          sellerId = recipientId || applicantId || job.employerId;
        }
      } else if (isOid) {
        entityContextId = new mongoose.Types.ObjectId(targetId);
      }
    } else {
      const isOid = mongoose.Types.ObjectId.isValid(targetId);
      let listing = isOid ? await Listing.findById(targetId) : await Listing.findOne({ $or: [{ id: targetId }, { slug: targetId }] });
      if (!listing) {
        listing = await Listing.findOne();
      }
      if (listing) {
        sellerId = (listing as any).sellerId || (listing as any).userId || sellerId;
        refListingId = listing._id;
        entityContextId = listing._id;
      } else if (isOid) {
        entityContextId = new mongoose.Types.ObjectId(targetId);
      }
    }

    // Ensure entityContextId is a valid ObjectId
    if (!entityContextId) {
      entityContextId = mongoose.Types.ObjectId.isValid(targetId) ? new mongoose.Types.ObjectId(targetId) : new mongoose.Types.ObjectId();
    }

    // Ensure sellerId is a valid ObjectId
    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      const otherUser = await User.findOne({ _id: { $ne: buyerId } }).select("_id");
      if (otherUser) {
        sellerId = otherUser._id;
      } else {
        sellerId = buyerId;
      }
    }

    const bId = new mongoose.Types.ObjectId(buyerId.toString());
    const sId = new mongoose.Types.ObjectId(sellerId.toString());
    const participants = bId.equals(sId) ? [bId] : [bId, sId];

    let conversation = await Conversation.findOne({
      $or: [
        { buyerId: bId, sellerId: sId, contextType: normalizedContext, contextId: entityContextId },
        { buyerId: sId, sellerId: bId, contextType: normalizedContext, contextId: entityContextId },
        { participantIds: { $all: participants }, contextType: normalizedContext, contextId: entityContextId },
        ...(refJobId ? [{ jobId: refJobId, participantIds: { $in: [bId] } }] : []),
        ...(refStoreId ? [{ storeId: refStoreId, participantIds: { $in: [bId] } }] : []),
        ...(refListingId ? [{ listingId: refListingId, participantIds: { $in: [bId] } }] : [])
      ]
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participantIds: participants,
        buyerId: bId,
        sellerId: sId,
        contextType: normalizedContext,
        contextId: entityContextId,
        listingId: refListingId,
        storeId: refStoreId,
        jobId: refJobId,
        unreadCounts: [
          { userId: bId, count: 0 },
          ...(bId.equals(sId) ? [] : [{ userId: sId, count: 0 }])
        ],
        status: "ACTIVE"
      });

      if (refListingId) {
        await Listing.findByIdAndUpdate(refListingId, { $inc: { "analytics.chats": 1 } }).catch(() => {});
      }
    }

    const populated = await Conversation.findById(conversation._id)
      .populate("listingId", "title priceInPaise images")
      .populate("storeId", "name logo")
      .populate("jobId", "title companyName companyLogo salary")
      .populate("participantIds", "profile.name profile.avatar email")
      .lean();

    const participantsList = Array.isArray((populated as any)?.participantIds) ? (populated as any).participantIds : [];
    const otherParticipant = participantsList.find((p: any) => {
      const pid = p?._id ? p._id.toString() : (p ? p.toString() : "");
      return pid && pid !== bId.toString();
    }) || participantsList[0];

    res.status(200).json({
      success: true,
      data: formatConversationItem(populated, bId)
    });
  } catch (error) {
    next(error);
  }
}

function formatSalaryText(salary: any): string {
  if (!salary) return "Salary: Negotiable";
  if (salary.salaryDisclosed === false) return "Salary: Negotiable";
  const min = typeof salary.minSalary === "number" ? salary.minSalary : 0;
  const max = typeof salary.maxSalary === "number" ? salary.maxSalary : 0;
  const period = salary.salaryPeriod || "monthly";
  const periodLabel = period === "yearly" ? "year" : period === "hourly" ? "hour" : period === "daily" ? "day" : "month";
  if (min > 0 && max > 0 && min !== max) {
    return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")} / ${periodLabel}`;
  }
  if (max > 0) {
    return `₹${max.toLocaleString("en-IN")} / ${periodLabel}`;
  }
  if (min > 0) {
    return `₹${min.toLocaleString("en-IN")} / ${periodLabel}`;
  }
  return "Salary: Negotiable";
}

function formatConversationItem(c: any, userId: any) {
  const participants = Array.isArray(c.participantIds) ? c.participantIds : [];
  const otherParticipant = participants.find((p: any) => {
    const pid = p?._id ? p._id.toString() : (p ? p.toString() : "");
    return pid && pid !== userId.toString();
  }) || participants[0];

  const userUnreadObj = c.unreadCounts?.find((u: any) => {
    const uid = u?.userId?._id ? u.userId._id.toString() : (u?.userId ? u.userId.toString() : "");
    return uid === userId.toString();
  });

  const isJob = c.contextType === "JOB" || !!c.jobId;
  const isStore = c.contextType === "STORE" || !!c.storeId;

  let title = "Marketplace Conversation";
  let image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
  let priceInPaise = 0;
  let salaryText = "";

  if (isJob) {
    title = c.jobId?.title ? `${c.jobId.title}${c.jobId.companyName ? ` (${c.jobId.companyName})` : ""}` : (c.listingTitle || "Job Opportunity");
    image = c.jobId?.companyLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400";
    salaryText = formatSalaryText(c.jobId?.salary);
    priceInPaise = 0;
  } else if (isStore) {
    title = c.storeId?.name || c.listingTitle || "Store Conversation";
    image = c.storeId?.logo || "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=400";
    priceInPaise = 0;
  } else {
    title = c.listingId?.title || c.listingTitle || "Product Listing";
    image = c.listingId?.images?.[0] || c.listingImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
    priceInPaise = c.listingId?.priceInPaise || 0;
  }

  return {
    id: c._id.toString(),
    contextType: isJob ? "JOB" : isStore ? "STORE" : "LISTING",
    contextId: c.contextId?.toString(),
    listingId: c.listingId?._id?.toString() || c.jobId?._id?.toString() || c.storeId?._id?.toString(),
    listingTitle: title,
    listingPriceInPaise: priceInPaise,
    salaryText: salaryText,
    listingImage: image,
    otherParty: {
      id: otherParticipant?._id ? otherParticipant._id.toString() : (otherParticipant ? otherParticipant.toString() : userId.toString()),
      name: otherParticipant?.profile?.name || otherParticipant?.email || "Omeetso User",
      avatar: otherParticipant?.profile?.avatar
    },
    lastMessagePreview: c.lastMessagePreview || "No messages yet",
    lastMessageType: c.lastMessageType || "TEXT",
    lastMessageAt: c.lastMessageAt || c.createdAt,
    unreadCount: userUnreadObj?.count || 0
  };
}

export async function getConversationById(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const conversationId = String(req.params.conversationId);
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const userId = req.user._id;
    const c: any = await Conversation.findById(conversationId)
      .populate("listingId", "title priceInPaise images status")
      .populate("storeId", "name logo cover")
      .populate("jobId", "title companyName companyLogo salary")
      .populate("participantIds", "profile.name profile.avatar email")
      .lean();

    if (!c) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const participants = Array.isArray(c.participantIds) ? c.participantIds : [];
    const isParticipant = participants.some((p: any) => {
      const pid = p?._id ? p._id.toString() : (p ? p.toString() : "");
      return pid === userId.toString();
    });
    if (!isParticipant) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatConversationItem(c, userId)
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversations(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const userId = req.user._id;
    const conversations = await Conversation.find({
      participantIds: userId,
      status: "ACTIVE"
    })
      .populate("listingId", "title priceInPaise images status")
      .populate("storeId", "name logo cover")
      .populate("jobId", "title companyName companyLogo salary")
      .populate("participantIds", "profile.name profile.avatar email")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    const items = conversations.map((c: any) => formatConversationItem(c, userId));

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const conversationId = String(req.params.conversationId);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const isParticipant = conversation.participantIds.some((id) => id.toString() === req.user!._id.toString());
    if (!isParticipant) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied to conversation messages" } });
      return;
    }

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 30));
    const before = req.query.before as string;

    const query: Record<string, any> = { conversationId: conversation._id };
    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("offerId")
      .lean();

    const hasMore = messages.length > limit;
    const itemsRaw = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? itemsRaw[itemsRaw.length - 1]._id.toString() : null;

    const items = itemsRaw.reverse().map((m: any) => ({
      id: m._id.toString(),
      clientMessageId: m.clientMessageId,
      conversationId: m.conversationId.toString(),
      senderId: m.senderId.toString(),
      type: m.type || "TEXT",
      text: m.text,
      imageUrl: m.imageUrl,
      offer: m.offerId
        ? {
            id: m.offerId._id.toString(),
            amountInPaise: m.offerId.amountInPaise,
            originalPriceInPaise: m.offerId.originalPriceInPaise,
            status: m.offerId.status,
            createdByUserId: m.offerId.createdByUserId?.toString(),
            expiresAt: m.offerId.expiresAt
          }
        : undefined,
      status: m.status || "SENT",
      sentAt: m.sentAt || m.createdAt,
      createdAt: m.createdAt
    }));

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const conversationId = String(req.params.conversationId);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }
    const { clientMessageId, type = "TEXT", text, imageUrl } = req.body;

    if (!clientMessageId) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "clientMessageId required" } });
      return;
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const isParticipant = conversation.participantIds.some((id) => id.toString() === req.user!._id.toString());
    if (!isParticipant) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
      return;
    }

    const recipientIds = conversation.participantIds.filter((id) => id.toString() !== req.user!._id.toString());

    let message: any;
    try {
      message = await Message.create({
        conversationId: conversation._id,
        clientMessageId,
        senderId: req.user._id,
        recipientIds,
        type: type.toUpperCase(),
        text,
        imageUrl,
        status: "SENT",
        sentAt: new Date()
      });
    } catch (err: any) {
      if (err.code === 11000) {
        message = await Message.findOne({
          conversationId: conversation._id,
          senderId: req.user._id,
          clientMessageId
        });
      } else {
        throw err;
      }
    }

    // Evaluate Chat Safety Filter Rules
    const safetyResult = evaluateChatSafety(text);
    if (safetyResult.isFlagged) {
      (conversation as any).isFlagged = true;
      (conversation as any).flagReason = safetyResult.reasons.join(", ");

      try {
        await SafetyReport.create({
          reporterId: req.user._id,
          targetType: "MESSAGE",
          targetId: message._id.toString(),
          category: safetyResult.category || "fraud",
          description: `Auto-Flagged Chat Rule Trigger: ${safetyResult.reasons.join("; ")} | Text: "${text}"`,
          priority: safetyResult.severity === "CRITICAL" ? SafetyPriority.CRITICAL : SafetyPriority.HIGH,
          status: "OPEN"
        });
      } catch (err) {}
    }

    const previewText = text || (imageUrl ? "📷 Photo" : "Message");
    const updatedUnread = (conversation.unreadCounts || []).map((uc) => {
      if (uc.userId.toString() !== req.user!._id.toString()) {
        return { userId: uc.userId, count: (uc.count || 0) + 1 };
      }
      return uc;
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      $set: {
        lastMessageId: message._id,
        lastMessagePreview: previewText,
        lastMessageType: type.toUpperCase() as any,
        lastMessageAt: message.createdAt,
        lastSenderId: req.user._id,
        unreadCounts: updatedUnread,
      }
    });

    const msgPayload = {
      id: message._id.toString(),
      clientMessageId: message.clientMessageId,
      conversationId: conversation._id.toString(),
      senderId: req.user._id.toString(),
      type: message.type,
      text: message.text,
      imageUrl: message.imageUrl,
      status: message.status,
      sentAt: message.sentAt,
      createdAt: message.createdAt,
      isFlagged: safetyResult.isFlagged,
      reasons: safetyResult.reasons
    };

    // Socket.IO Emit & Create Notifications for Recipients
    const io = getIO();
    for (const rId of recipientIds) {
      const notif = await Notification.create({
        userId: rId,
        type: "chat_message",
        title: `New message from ${req.user.profile?.name || req.user.phone || "Seller/Buyer"}`,
        body: text ? (text.length > 60 ? text.substring(0, 60) + "..." : text) : "Sent an attachment",
        link: `/chat/${conversation._id}`
      });

      if (io) {
        io.to(`user:${rId.toString()}`).emit("message:new", msgPayload);
        io.to(`user:${rId.toString()}`).emit("notification:new", notif);
      }
    }

    if (io) {
      const senderDisplayName = req.user.profile?.name || req.user.phone || req.user.email || "User";
      io.to(`conversation:${conversation._id.toString()}`).emit("message:new", msgPayload);
      io.to("admin:monitoring").emit("admin:message:new", {
        ...msgPayload,
        contextType: conversation.contextType,
        contextId: conversation.contextId,
        senderName: senderDisplayName
      });

      if (safetyResult.isFlagged) {
        io.to("admin:monitoring").emit("admin:flagged_message", {
          conversationId: conversation._id.toString(),
          messageId: message._id.toString(),
          senderName: senderDisplayName,
          reasons: safetyResult.reasons,
          severity: safetyResult.severity,
          text: text
        });
      }
    }

    res.status(201).json({
      success: true,
      data: msgPayload
    });
  } catch (error) {
    next(error);
  }
}

export async function createOffer(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const conversationId = String(req.params.conversationId);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const { amountInPaise, messageText } = req.body;

    const conversation = await Conversation.findById(conversationId).populate("listingId");
    if (!conversation) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Conversation not found" } });
      return;
    }

    const isParticipant = conversation.participantIds.some((id) => id.toString() === req.user!._id.toString());
    if (!isParticipant) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
      return;
    }

    let buyerId = conversation.buyerId;
    let sellerId = conversation.sellerId;

    if (!buyerId || !sellerId) {
      const otherId = conversation.participantIds.find((id) => id.toString() !== req.user!._id.toString()) || req.user._id;
      buyerId = buyerId || req.user._id;
      sellerId = sellerId || otherId;
    }

    const originalPrice = (conversation.listingId as any)?.priceInPaise || amountInPaise;

    const offer = await Offer.create({
      conversationId: conversation._id,
      listingId: conversation.listingId?._id || conversation.contextId,
      buyerId,
      sellerId,
      createdByUserId: req.user._id,
      amountInPaise,
      originalPriceInPaise: originalPrice,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    const recipientIds = conversation.participantIds.filter((id) => id.toString() !== req.user!._id.toString());

    const message = await Message.create({
      conversationId: conversation._id,
      clientMessageId: `offer_${offer._id.toString()}`,
      senderId: req.user._id,
      recipientIds,
      type: "OFFER",
      text: messageText || `Sent an offer of ₹${(amountInPaise / 100).toLocaleString("en-IN")}`,
      offerId: offer._id,
      status: "SENT"
    });

    conversation.lastMessageId = message._id;
    conversation.lastMessagePreview = `Offer: ₹${(amountInPaise / 100).toLocaleString("en-IN")}`;
    conversation.lastMessageType = "OFFER";
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const offerPayload = {
      id: offer._id.toString(),
      conversationId: conversation._id.toString(),
      amountInPaise: offer.amountInPaise,
      originalPriceInPaise: offer.originalPriceInPaise,
      status: offer.status,
      createdByUserId: req.user._id.toString(),
      expiresAt: offer.expiresAt,
      messageId: message._id.toString()
    };

    const io = getIO();
    for (const rId of recipientIds) {
      const notif = await Notification.create({
        userId: rId,
        type: "offer_received",
        title: `New Offer Received: ₹${(amountInPaise / 100).toLocaleString("en-IN")}`,
        body: messageText || `You received a price offer on listing/store conversation.`,
        link: `/chat/${conversation._id}`
      });

      if (io) {
        io.to(`user:${rId.toString()}`).emit("offer:new", offerPayload);
        io.to(`user:${rId.toString()}`).emit("notification:new", notif);
      }
    }

    res.status(201).json({
      success: true,
      data: offerPayload
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOfferStatus(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const offerId = String(req.params.offerId);

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Offer not found" } });
      return;
    }

    const { action } = req.body; // ACCEPT, DECLINE, CANCEL

    const offer = await Offer.findById(offerId);
    if (!offer) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Offer not found" } });
      return;
    }

    if (action === "ACCEPT") {
      if (offer.createdByUserId.toString() === req.user._id.toString()) {
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "You cannot accept your own offer" } });
        return;
      }
      offer.status = "ACCEPTED" as any;
    } else if (action === "DECLINE") {
      offer.status = "DECLINED" as any;
    } else if (action === "CANCEL") {
      offer.status = "CANCELLED" as any;
    }

    await offer.save();

    const targetUserId = offer.createdByUserId;

    // Create Notification
    const statusText = action === "ACCEPT" ? "accepted" : action.toLowerCase() + "d";
    const notif = await Notification.create({
      userId: targetUserId,
      type: "offer_status",
      title: `Offer ${action === "ACCEPT" ? "Accepted!" : statusText}`,
      body: `Your offer of ₹${(offer.amountInPaise / 100).toLocaleString("en-IN")} was ${statusText}.`,
      link: action === "ACCEPT" ? `/transaction/${offer._id}` : `/chat/${offer.conversationId}`
    });

    const io = getIO();
    if (io) {
      if (offer.buyerId) io.to(`user:${offer.buyerId.toString()}`).emit("offer:updated", offer);
      if (offer.sellerId) io.to(`user:${offer.sellerId.toString()}`).emit("offer:updated", offer);
      if (targetUserId) io.to(`user:${targetUserId.toString()}`).emit("notification:new", notif);
    }

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    next(error);
  }
}

export async function getOfferById(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const offerId = (Array.isArray(req.params.offerId) ? req.params.offerId[0] : req.params.offerId) as string;

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Offer not found" } });
      return;
    }

    const offer = await Offer.findById(offerId)
      .populate("listingId", "title priceInPaise images area")
      .populate("buyerId", "profile.name profile.avatar email")
      .populate("sellerId", "profile.name profile.avatar email")
      .lean();

    if (!offer) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Offer not found" } });
      return;
    }

    const conversation = await Conversation.findById(offer.conversationId);
    const isParticipant =
      (conversation && conversation.participantIds.some((pId) => pId.toString() === req.user!._id.toString())) ||
      offer.buyerId?._id?.toString() === req.user._id.toString() ||
      offer.sellerId?._id?.toString() === req.user._id.toString() ||
      (offer.createdByUserId && offer.createdByUserId.toString() === req.user._id.toString());

    if (!isParticipant) {
      // Return details for viewing transaction status
    }

    res.status(200).json({
      success: true,
      data: {
        id: offer._id.toString(),
        conversationId: offer.conversationId.toString(),
        amountInPaise: offer.amountInPaise,
        originalPriceInPaise: offer.originalPriceInPaise,
        status: offer.status,
        expiresAt: offer.expiresAt,
        listing: offer.listingId
          ? {
              id: (offer.listingId as any)._id?.toString(),
              title: (offer.listingId as any).title,
              priceInPaise: (offer.listingId as any).priceInPaise,
              image: (offer.listingId as any).images?.[0] || "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
              area: (offer.listingId as any).area || "Madhapur, Hyderabad"
            }
          : undefined,
        buyer: offer.buyerId
          ? {
              id: (offer.buyerId as any)._id?.toString(),
              name: (offer.buyerId as any).profile?.name || (offer.buyerId as any).email || "Buyer"
            }
          : undefined,
        seller: offer.sellerId
          ? {
              id: (offer.sellerId as any)._id?.toString(),
              name: (offer.sellerId as any).profile?.name || (offer.sellerId as any).email || "Seller"
            }
          : undefined
      }
    });
  } catch (error) {
    next(error);
  }
}
