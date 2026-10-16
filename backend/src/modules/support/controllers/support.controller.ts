import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { SupportTicket } from "../models/SupportTicket";
import { SupportMessage } from "../models/SupportMessage";
import { User, IUser } from "../../users/models/User";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { AuthenticatedAdminRequest } from "../../../middleware/authenticateAdmin";
import { SupportPriority, SupportStatus, UserStatus } from "../../../contracts";

function generateTicketNumber(): string {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `TCK-${rand}`;
}

export async function createTicket(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      subject,
      category = "General",
      subcategory,
      description,
      message,
      priority = SupportPriority.MEDIUM,
      contactMethod = "in_app",
      relatedListing,
      relatedStore,
      relatedCampaign,
      relatedPayment,
      attachments = [],
      userName,
      name,
      userEmail,
      email,
      userPhone,
      phone
    } = req.body;

    let user: IUser | null | undefined = req.user;
    const contactName = userName || name || req.user?.profile?.name || (req.user as any)?.name || "Omeetso Member";
    const contactEmail = userEmail || email || req.user?.email || undefined;
    const contactPhone = userPhone || phone || req.user?.phone || undefined;

    if (!user) {
      const searchEmail = contactEmail;
      const searchPhone = contactPhone;
      if (searchEmail || searchPhone) {
        user = await User.findOne({
          $or: [
            ...(searchEmail ? [{ email: searchEmail.toLowerCase() }] : []),
            ...(searchPhone ? [{ phone: searchPhone }] : [])
          ]
        });
      }
      if (!user) {
        user = await User.findOne({ status: UserStatus.ACTIVE }) || await User.findOne();
      }
      if (!user) {
        user = await User.create({
          phone: phone || "+919876543210",
          email: email || "member.support@omeetso.in",
          status: UserStatus.ACTIVE,
          accountType: "individual",
          profile: { name: contactName, city: "Hyderabad" }
        });
      }
    }

    const ticketBody = description || message || subject;
    const ticketNumber = generateTicketNumber();

    const normPriority = typeof priority === "string" ? (priority.toUpperCase() as any) : SupportPriority.MEDIUM;

    const ticket = await SupportTicket.create({
      userId: user?._id || undefined,
      contactName,
      contactEmail,
      contactPhone,
      ticketNumber,
      subject: subject?.trim(),
      category: category?.trim() || "General",
      subcategory: subcategory?.trim() || undefined,
      description: ticketBody?.trim(),
      priority: Object.values(SupportPriority).includes(normPriority) ? normPriority : SupportPriority.MEDIUM,
      status: SupportStatus.OPEN,
      contactMethod: contactMethod || "in_app",
      relatedListing: relatedListing?.trim() || undefined,
      relatedStore: relatedStore?.trim() || undefined,
      relatedCampaign: relatedCampaign?.trim() || undefined,
      relatedPayment: relatedPayment?.trim() || undefined,
      lastMessageAt: new Date()
    });

    // Create the initial message in SupportMessage thread
    await SupportMessage.create({
      ticketId: ticket._id,
      senderType: "user",
      senderUserId: user?._id || undefined,
      senderName: contactName,
      text: ticketBody?.trim(),
      attachments: attachments || []
    });

    res.status(201).json({
      success: true,
      data: {
        id: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        subcategory: ticket.subcategory,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        contactMethod: ticket.contactMethod,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyTickets(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const tickets = await SupportTicket.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: tickets.map((t) => ({
        id: t._id.toString(),
        ticketNumber: t.ticketNumber || `TCK-${t._id.toString().slice(-5).toUpperCase()}`,
        subject: t.subject,
        category: t.category,
        subcategory: t.subcategory,
        description: t.description,
        priority: t.priority,
        status: t.status,
        contactMethod: t.contactMethod,
        relatedListing: t.relatedListing,
        relatedStore: t.relatedStore,
        relatedCampaign: t.relatedCampaign,
        relatedPayment: t.relatedPayment,
        resolutionNotes: t.resolutionNotes,
        lastMessageAt: t.lastMessageAt || t.updatedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicketById(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const ticketId = String(req.params.ticketId);
    let query: Record<string, any>;
    if (mongoose.Types.ObjectId.isValid(ticketId)) {
      query = { _id: ticketId };
    } else {
      query = { ticketNumber: ticketId };
    }

    const ticket = await SupportTicket.findOne(query).lean();
    if (!ticket) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ticket not found" } });
      return;
    }

    // Verify ownership
    if (ticket.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied to ticket" } });
      return;
    }

    const messages = await SupportMessage.find({ ticketId: ticket._id })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        id: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber || `TCK-${ticket._id.toString().slice(-5).toUpperCase()}`,
        subject: ticket.subject,
        category: ticket.category,
        subcategory: ticket.subcategory,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        contactMethod: ticket.contactMethod,
        relatedListing: ticket.relatedListing,
        relatedStore: ticket.relatedStore,
        relatedCampaign: ticket.relatedCampaign,
        relatedPayment: ticket.relatedPayment,
        resolutionNotes: ticket.resolutionNotes,
        assignedAdminName: ticket.assignedAdminName,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        messages: messages.map((m) => ({
          id: m._id.toString(),
          senderType: m.senderType,
          senderName: m.senderName,
          text: m.text,
          attachments: m.attachments || [],
          createdAt: m.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicketMessages(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const ticketId = String(req.params.ticketId);
    let ticket;
    if (mongoose.Types.ObjectId.isValid(ticketId)) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      ticket = await SupportTicket.findOne({ ticketNumber: ticketId });
    }

    if (!ticket) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ticket not found" } });
      return;
    }

    if (ticket.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied to ticket" } });
      return;
    }

    const messages = await SupportMessage.find({ ticketId: ticket._id })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: messages.map((m) => ({
        id: m._id.toString(),
        senderType: m.senderType,
        senderName: m.senderName,
        text: m.text,
        attachments: m.attachments || [],
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function addTicketMessage(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const ticketId = String(req.params.ticketId);
    const { text, attachments = [] } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, error: { message: "Message text is required" } });
      return;
    }

    let ticket;
    if (mongoose.Types.ObjectId.isValid(ticketId)) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      ticket = await SupportTicket.findOne({ ticketNumber: ticketId });
    }

    if (!ticket) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ticket not found" } });
      return;
    }

    if (ticket.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
      return;
    }

    const msg = await SupportMessage.create({
      ticketId: ticket._id,
      senderType: "user",
      senderUserId: req.user._id,
      senderName: req.user.profile?.name || (req.user as any).name || "Omeetso User",
      text: text.trim(),
      attachments: attachments || []
    });

    ticket.lastMessageAt = new Date();
    if (ticket.status === SupportStatus.RESOLVED || ticket.status === SupportStatus.CLOSED) {
      ticket.status = SupportStatus.OPEN;
    }
    await ticket.save();

    res.status(201).json({
      success: true,
      data: {
        id: msg._id.toString(),
        senderType: msg.senderType,
        senderName: msg.senderName,
        text: msg.text,
        attachments: msg.attachments,
        createdAt: msg.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const ticketId = String(req.params.ticketId);
    const { status, resolutionNotes } = req.body;

    let ticket;
    if (mongoose.Types.ObjectId.isValid(ticketId)) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      ticket = await SupportTicket.findOne({ ticketNumber: ticketId });
    }

    if (!ticket) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ticket not found" } });
      return;
    }

    if (ticket.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
      return;
    }

    if (status) {
      const upper = typeof status === "string" ? status.toUpperCase() : "";
      if (Object.values(SupportStatus).includes(upper as any)) {
        ticket.status = upper as any;
      } else {
        ticket.status = status;
      }
    }
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    await ticket.save();

    res.status(200).json({
      success: true,
      data: {
        id: ticket._id.toString(),
        status: ticket.status,
        resolutionNotes: ticket.resolutionNotes,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminSupportTickets(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (req.query.status && req.query.status !== "all") {
      const st = String(req.query.status).trim();
      query.status = { $in: [st, st.toUpperCase(), st.toLowerCase()] };
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate("userId", "profile.name email phone")
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: tickets.map((t: any) => ({
        id: t._id.toString(),
        ticketNumber: t.ticketNumber || `TCK-${t._id.toString().slice(-5).toUpperCase()}`,
        subject: t.subject,
        category: t.category,
        subcategory: t.subcategory,
        description: t.description,
        priority: t.priority,
        status: t.status,
        contactMethod: t.contactMethod,
        resolutionNotes: t.resolutionNotes,
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
        user: {
          id: t.userId?._id?.toString() || (typeof t.userId === "string" ? t.userId : "usr-anon"),
          name: t.contactName || t.userId?.profile?.name || t.userId?.name || (t.contactPhone ? `User (${t.contactPhone})` : "Omeetso Member"),
          email: t.contactEmail || t.userId?.email,
          phone: t.contactPhone || t.userId?.phone
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function adminReplyTicket(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticketId = String(req.params.ticketId);
    const { text, status = SupportStatus.IN_PROGRESS, resolutionNotes } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, error: { message: "Reply text is required" } });
      return;
    }

    let ticket;
    if (mongoose.Types.ObjectId.isValid(ticketId)) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      ticket = await SupportTicket.findOne({ ticketNumber: ticketId });
    }

    if (!ticket) {
      res.status(404).json({ success: false, error: { message: "Ticket not found" } });
      return;
    }

    const adminDisplayName = req.admin?.name || (req.admin as any)?.username || "Omeetso Support Operator";

    const msg = await SupportMessage.create({
      ticketId: ticket._id,
      senderType: "admin",
      senderAdminId: req.admin?._id,
      senderName: adminDisplayName,
      text: text.trim()
    });

    ticket.lastMessageAt = new Date();
    if (status) {
      const upper = typeof status === "string" ? status.toUpperCase() : "";
      if (Object.values(SupportStatus).includes(upper as any)) {
        ticket.status = upper as any;
      } else {
        ticket.status = status;
      }
    }
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    ticket.assignedAdminName = adminDisplayName;
    await ticket.save();

    res.status(201).json({
      success: true,
      data: {
        id: msg._id.toString(),
        senderType: msg.senderType,
        senderName: msg.senderName,
        text: msg.text,
        status: ticket.status,
        resolutionNotes: ticket.resolutionNotes,
        createdAt: msg.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function adminGetTicketMessages(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticketId = String(req.params.ticketId);
    let ticket;
    if (mongoose.Types.ObjectId.isValid(ticketId)) {
      ticket = await SupportTicket.findById(ticketId);
    } else {
      ticket = await SupportTicket.findOne({ ticketNumber: ticketId });
    }

    if (!ticket) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Ticket not found" } });
      return;
    }

    const messages = await SupportMessage.find({ ticketId: ticket._id })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: messages.map((m) => ({
        id: m._id.toString(),
        senderType: m.senderType,
        senderName: m.senderName,
        text: m.text,
        attachments: m.attachments || [],
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

