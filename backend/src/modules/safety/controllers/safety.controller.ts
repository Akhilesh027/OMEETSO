import { Request, Response, NextFunction } from "express";
import { SafetyReport } from "../models/SafetyReport";
import { AuditLog } from "../../admin/models/AuditLog";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { AuthenticatedAdminRequest } from "../../../middleware/authenticateAdmin";
import { SafetyPriority } from "../../../contracts";
import { dispatchEmail, OMEETSO_LOGO_URL } from "../../auth/services/email.service";
import { env } from "../../../config/env";

export async function createSafetyReport(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      category,
      description,
      relatedUser,
      relatedListing,
      relatedChat,
      attachments = [],
      evidenceImages = [],
      contactPref = "in_app",
      contactTimeSlot = "anytime",
      isAnonymous = false,
      reporterName,
      reporterEmail,
      reporterPhone,
      priority,
      targetType: customTargetType,
      targetId: customTargetId
    } = req.body;

    if (!description || typeof description !== "string" || !description.trim()) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Incident description is required" }
      });
      return;
    }

    // Determine target entity type and identifier
    let targetType = customTargetType || "GENERAL";
    if (!customTargetType) {
      if (relatedListing) targetType = "LISTING";
      else if (relatedUser) targetType = "USER";
      else if (relatedChat) targetType = "MESSAGE";
      else targetType = "GENERAL";
    }

    const targetId = customTargetId || relatedListing || relatedUser || relatedChat || "GENERAL_INCIDENT";

    // Determine priority
    let resolvedPriority = priority;
    if (!resolvedPriority) {
      const catLower = (category || "").toLowerCase();
      if (catLower.includes("scam") || catLower.includes("harassment") || catLower.includes("fraud") || contactTimeSlot === "anytime") {
        resolvedPriority = SafetyPriority.HIGH;
      } else {
        resolvedPriority = SafetyPriority.MEDIUM;
      }
    }

    // Combine attachments and evidence images
    const combinedEvidence = Array.from(new Set([...(evidenceImages || []), ...(attachments || [])]));

    const report = await SafetyReport.create({
      reporterId: req.user?._id || undefined,
      targetType,
      targetId,
      category: category || "general_safety",
      description: description.trim(),
      evidenceImages: combinedEvidence,
      attachments: combinedEvidence,
      priority: resolvedPriority,
      status: "OPEN",
      reporterName: isAnonymous ? "Anonymous Reporter" : reporterName || (req.user as any)?.profile?.name || (req.user as any)?.name || "Omeetso User",
      reporterEmail: isAnonymous ? undefined : (reporterEmail || req.user?.email || undefined),
      reporterPhone: isAnonymous ? undefined : (reporterPhone || req.user?.phone || undefined),
      contactPref,
      contactTimeSlot,
      isAnonymous: Boolean(isAnonymous),
      relatedUser: relatedUser?.trim() || undefined,
      relatedListing: relatedListing?.trim() || undefined,
      relatedChat: relatedChat?.trim() || undefined
    });

    const reportIdStr = report._id.toString();
    const formattedDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const adminEmail = env.ADMIN_NOTIFICATION_EMAIL || "info@omeetso.in";
    const adminUrl = `${env.CLIENT_ADMIN_URL}/admin/safety-reports`;

    // 1. Send Alert Email to Admin
    try {
      const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #e11d48, #be123c); padding: 24px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 8px; background: rgba(255,255,255,0.2); }
    .content { padding: 24px; }
    .detail-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 20px; }
    .detail-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .detail-table td.label { font-weight: 700; color: #64748b; width: 35%; }
    .detail-table td.value { font-weight: 600; color: #0f172a; }
    .description-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.6; color: #334155; margin-top: 8px; }
    .button-container { text-align: center; margin: 28px 0 12px; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 16px 24px 24px; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🚨 Incident Report Escalation</h1>
      <div class="badge">Reference: #${reportIdStr.slice(-8).toUpperCase()} · Priority: ${resolvedPriority.toUpperCase()}</div>
    </div>
    <div class="content">
      <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
        A new suspicious activity report has been submitted on <strong>Omeetso</strong>. Please review the details below.
      </p>

      <table class="detail-table">
        <tr>
          <td class="label">Incident ID</td>
          <td class="value">#${reportIdStr}</td>
        </tr>
        <tr>
          <td class="label">Category</td>
          <td class="value"><span style="color: #e11d48; font-weight: 800;">${(report.category || "General").toUpperCase()}</span></td>
        </tr>
        <tr>
          <td class="label">Priority</td>
          <td class="value">${resolvedPriority}</td>
        </tr>
        <tr>
          <td class="label">Submission Time</td>
          <td class="value">${formattedDate}</td>
        </tr>
        <tr>
          <td class="label">Reporter Mode</td>
          <td class="value">${isAnonymous ? "🔒 Anonymous Confidential Report" : `👤 ${report.reporterName}`}</td>
        </tr>
        ${!isAnonymous && report.reporterEmail ? `<tr><td class="label">Reporter Email</td><td class="value"><a href="mailto:${report.reporterEmail}">${report.reporterEmail}</a></td></tr>` : ""}
        ${!isAnonymous && report.reporterPhone ? `<tr><td class="label">Reporter Phone</td><td class="value"><a href="tel:${report.reporterPhone}">${report.reporterPhone}</a></td></tr>` : ""}
        <tr>
          <td class="label">Contact Preference</td>
          <td class="value">${contactPref.toUpperCase()} (${contactTimeSlot})</td>
        </tr>
        ${report.relatedUser ? `<tr><td class="label">Reported User</td><td class="value"><strong style="color: #0284c7;">${report.relatedUser}</strong></td></tr>` : ""}
        ${report.relatedListing ? `<tr><td class="label">Related Listing</td><td class="value"><strong style="color: #0284c7;">${report.relatedListing}</strong></td></tr>` : ""}
        ${report.relatedChat ? `<tr><td class="label">Related Chat ID</td><td class="value">${report.relatedChat}</td></tr>` : ""}
        ${combinedEvidence.length > 0 ? `<tr><td class="label">Evidence Files</td><td class="value">${combinedEvidence.length} attachment(s) logged</td></tr>` : ""}
      </table>

      <label style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase;">Incident Description & Allegation</label>
      <div class="description-box">
        ${description.trim().replace(/\n/g, "<br/>")}
      </div>

      <div class="button-container">
        <a href="${adminUrl}" class="btn" target="_blank">Open Admin Safety Panel</a>
      </div>
    </div>
    <div class="footer">
      Omeetso Trust & Safety Division · Automated Incident Alert System
    </div>
  </div>
</body>
</html>`;

      dispatchEmail({
        to: adminEmail,
        subject: `🚨 [Omeetso Safety Alert] Incident #${reportIdStr.slice(-8).toUpperCase()}: ${(category || "Safety").toUpperCase()}`,
        html: adminHtml
      }).catch((err) => console.error("[Safety] Admin alert email delivery error:", err));
    } catch (mailErr) {
      console.error("[Safety] Failed to prepare admin alert email:", mailErr);
    }

    // 2. Send Confirmation Email to Reporter (if email provided and not anonymous)
    if (!isAnonymous && report.reporterEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(report.reporterEmail)) {
      try {
        const userHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #0f172a; padding: 24px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .content { padding: 24px; font-size: 14px; line-height: 1.6; color: #334155; }
    .ref-badge { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-family: monospace; font-size: 13px; color: #0f172a; margin: 12px 0; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px 24px 24px; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🛡️ Report Received</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${report.reporterName || "Omeetso Member"}</strong>,</p>
      <p>Thank you for reporting suspicious activity and helping keep the Omeetso marketplace safe for everyone.</p>
      
      <p>Your incident report has been logged under reference number:</p>
      <div style="text-align: center;">
        <span class="ref-badge">#${reportIdStr}</span>
      </div>

      <p>
        <strong>Category:</strong> ${(category || "General").toUpperCase()}<br/>
        <strong>Status:</strong> Under Review<br/>
        <strong>Follow-up Window:</strong> ${contactTimeSlot}
      </p>

      <p>Our Trust & Safety moderators review reported accounts and listings thoroughly. If additional evidence is required, we will contact you via your preferred channel (<strong>${contactPref}</strong>).</p>

      <p>Warm regards,<br/><strong>Omeetso Trust & Safety Team</strong></p>
    </div>
    <div class="footer">
      Omeetso Hyperlocal Marketplace · Hyderabad, India
    </div>
  </div>
</body>
</html>`;

        dispatchEmail({
          to: report.reporterEmail,
          subject: `[Omeetso] Safety Incident Logged — Reference #${reportIdStr.slice(-8).toUpperCase()}`,
          html: userHtml
        }).catch((err) => console.error("[Safety] User confirmation email delivery error:", err));
      } catch (userMailErr) {
        console.error("[Safety] Failed to prepare user confirmation email:", userMailErr);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        id: report._id.toString(),
        status: report.status,
        createdAt: report.createdAt,
        category: report.category,
        isAnonymous: report.isAnonymous,
        contactPref: report.contactPref
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMySafetyReports(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: Record<string, any> = {};

    if (req.user?._id) {
      query.$or = [
        { reporterId: req.user._id },
        ...(req.user.email ? [{ reporterEmail: req.user.email }] : []),
        ...(req.user.phone ? [{ reporterPhone: req.user.phone }] : [])
      ];
    } else {
      const email = typeof req.query.email === "string" ? req.query.email.trim() : null;
      const phone = typeof req.query.phone === "string" ? req.query.phone.trim() : null;
      if (email || phone) {
        query.$or = [
          ...(email ? [{ reporterEmail: email }] : []),
          ...(phone ? [{ reporterPhone: phone }] : [])
        ];
      } else {
        // Return latest public incident tracker stats / recent empty list
        res.status(200).json({ success: true, data: [] });
        return;
      }
    }

    const reports = await SafetyReport.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.status(200).json({
      success: true,
      data: reports.map((r: any) => ({
        id: r._id.toString(),
        category: r.category,
        description: r.description,
        status: r.status,
        priority: r.priority,
        targetType: r.targetType,
        targetId: r.targetId,
        relatedUser: r.relatedUser,
        relatedListing: r.relatedListing,
        isAnonymous: r.isAnonymous,
        contactPref: r.contactPref,
        resolutionNotes: r.resolutionNotes,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminSafetyReports(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (req.query.status) query.status = req.query.status;

    const [reports, total] = await Promise.all([
      SafetyReport.find(query)
        .populate("reporterId", "profile.name phone email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SafetyReport.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: reports.map((r: any) => ({
        id: r._id.toString(),
        targetType: r.targetType,
        targetId: r.targetId,
        category: r.category,
        description: r.description,
        evidenceImages: r.evidenceImages || r.attachments || [],
        attachments: r.attachments || r.evidenceImages || [],
        priority: r.priority,
        status: r.status,
        createdAt: r.createdAt,
        reporterName: r.reporterName || r.reporterId?.profile?.name || (r.isAnonymous ? "Anonymous" : undefined),
        reporterEmail: r.reporterEmail || r.reporterId?.email,
        reporterPhone: r.reporterPhone || r.reporterId?.phone,
        contactPref: r.contactPref,
        contactTimeSlot: r.contactTimeSlot,
        isAnonymous: r.isAnonymous,
        relatedUser: r.relatedUser,
        relatedListing: r.relatedListing,
        relatedChat: r.relatedChat,
        resolutionNotes: r.resolutionNotes,
        assignedAdminName: r.assignedAdminName,
        reporter: r.reporterId
          ? {
              id: r.reporterId._id.toString(),
              name: r.reporterId.profile?.name,
              phone: r.reporterId.phone,
              email: r.reporterId.email
            }
          : undefined
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

export async function resolveSafetyReport(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const { reportId } = req.params;
    const { action, resolutionNotes } = req.body;

    const report = await SafetyReport.findById(reportId);
    if (!report) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Safety report not found" } });
      return;
    }

    report.status = action === "dismiss" ? "DISMISSED" : "RESOLVED";
    report.assignedAdminId = req.admin._id;
    report.assignedAdminName = req.admin.name;
    report.resolutionNotes = resolutionNotes;
    await report.save();

    await AuditLog.create({
      actorAdminId: req.admin._id,
      actorName: req.admin.name,
      actorRole: req.admin.role,
      action: `SAFETY_REPORT_${report.status}`,
      targetType: "SafetyReport",
      targetId: report._id.toString(),
      reason: resolutionNotes || "Safety report investigation completed",
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    res.status(200).json({
      success: true,
      data: {
        id: report._id.toString(),
        status: report.status
      }
    });
  } catch (error) {
    next(error);
  }
}

