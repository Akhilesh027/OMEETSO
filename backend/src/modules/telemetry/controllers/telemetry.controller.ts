import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { VisitorActivity, ActivityType } from "../models/VisitorActivity";
import { User } from "../../users/models/User";
import { verifyAccessToken, UserTokenPayload } from "../../auth/utils/token";
import { broadcastLiveActivity } from "../../../sockets/socket-server";

// Helper to sanitize IP addresses
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

// Helper to escape regex special characters
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export async function recordActivityEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      visitorId,
      sessionId,
      activityType = "PAGE_VIEW",
      pageUrl = "",
      pagePath = "/",
      pageTitle = "",
      referrer = "",
      metadata = {},
      location: clientLocation = {},
      device: clientDevice = {},
      timeSpentSeconds = 0
    } = req.body;

    if (!visitorId || !sessionId) {
      res.status(400).json({
        success: false,
        error: { code: "MISSING_IDENTIFIERS", message: "visitorId and sessionId are required" }
      });
      return;
    }

    // 1. Resolve User Identity if logged in
    let userId: mongoose.Types.ObjectId | undefined;
    let userContact: {
      name?: string;
      phone?: string;
      email?: string;
      city?: string;
      accountType?: string;
    } = {};

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = verifyAccessToken<UserTokenPayload>(token);
        if (payload?.userId && mongoose.Types.ObjectId.isValid(payload.userId)) {
          userId = new mongoose.Types.ObjectId(payload.userId);
          const user = await User.findById(userId).select("phone email profile accountType").lean();
          if (user) {
            userContact = {
              name: user.profile?.name || "Omeetso User",
              phone: user.phone || undefined,
              email: user.email || undefined,
              city: user.profile?.city || undefined,
              accountType: user.accountType || "individual"
            };
          }
        }
      } catch {
        // Token invalid/expired - continue as guest
      }
    }

    // 2. Classify if this is a high-intent commercial lead
    const isLead = [
      "CONTACT_CALL_CLICKED",
      "CONTACT_WHATSAPP_CLICKED",
      "DEAL_OFFER_MADE"
    ].includes(activityType);

    // 3. Resolve Location (client GPS > client selected city > headers/ip)
    const ip = getClientIp(req);
    const resolvedCity = (
      clientLocation.city ||
      userContact.city ||
      (req.headers["cf-ipcity"] as string) ||
      "Hyderabad"
    ).trim();

    const resolvedState = (
      clientLocation.state ||
      (req.headers["cf-region"] as string) ||
      "Telangana"
    ).trim();

    const resolvedCountry = (
      clientLocation.country ||
      (req.headers["cf-ipcountry"] as string) ||
      "India"
    ).trim();

    const coordinates = clientLocation.coordinates || [78.3871, 17.4486];
    const locationSource = clientLocation.coordinates
      ? "gps"
      : clientLocation.city
        ? "user_selected"
        : req.headers["cf-ipcity"]
          ? "ip_header"
          : "fallback";

    // 4. Construct human-readable Title & Description
    const visitorLabel = userContact.name
      ? `${userContact.name} (${userContact.phone || "User"})`
      : `Guest #${visitorId.slice(-4)}`;

    let title = `${visitorLabel} viewed page`;
    let description = `${visitorLabel} visited ${pagePath} in ${resolvedCity}`;

    switch (activityType as ActivityType) {
      case "VISIT_OPENED":
        title = `${visitorLabel} opened Omeetso`;
        description = `${visitorLabel} launched marketplace from ${resolvedCity}`;
        break;
      case "LISTING_VIEW":
        title = `${visitorLabel} viewed "${metadata.listingTitle || "a product"}"`;
        description = `Browsed ${metadata.listingTitle || "product"} (${metadata.listingPrice ? `₹${metadata.listingPrice}` : "Contact for price"}) in ${resolvedCity}`;
        break;
      case "STORE_VISIT":
        title = `${visitorLabel} visited store "${metadata.storeName || "Merchant Store"}"`;
        description = `Inspected merchant catalog in ${resolvedCity}`;
        break;
      case "SEARCH_PERFORMED":
        title = `${visitorLabel} searched for "${metadata.searchQuery || "all items"}"`;
        description = `Queried "${metadata.searchQuery}" in ${resolvedCity}`;
        break;
      case "CONTACT_WHATSAPP_CLICKED":
        title = `🔥 LEAD: ${visitorLabel} clicked WhatsApp Chat`;
        description = `Interested in "${metadata.listingTitle || "Item"}". Clicked WhatsApp to chat with seller (${metadata.sellerPhone || "Seller"}).`;
        break;
      case "CONTACT_CALL_CLICKED":
        title = `🔥 LEAD: ${visitorLabel} clicked Call Seller`;
        description = `Dialed seller (${metadata.sellerPhone || "Seller"}) for "${metadata.listingTitle || "Item"}".`;
        break;
      case "DEAL_OFFER_MADE":
        title = `💰 OFFER: ${visitorLabel} offered ₹${metadata.offerAmount || "Negotiation"}`;
        description = `Proposed price for "${metadata.listingTitle || "Item"}" in ${resolvedCity}`;
        break;
      case "USER_REGISTERED":
        title = `🎉 NEW USER: ${visitorLabel} registered`;
        description = `Created new Omeetso account in ${resolvedCity}`;
        break;
      case "USER_LOGGED_IN":
        title = `🔑 SIGN-IN: ${visitorLabel} logged in`;
        description = `Authenticated successfully in ${resolvedCity}`;
        break;
    }

    // 5. Persist to MongoDB
    const activityDoc = await VisitorActivity.create({
      visitorId,
      sessionId,
      userId,
      userContact: Object.keys(userContact).length > 0 ? userContact : undefined,
      activityType,
      title,
      description,
      pageUrl,
      pagePath,
      pageTitle,
      referrer,
      metadata,
      location: {
        ip,
        city: resolvedCity,
        area: clientLocation.area || "",
        pincode: clientLocation.pincode || "",
        state: resolvedState,
        country: resolvedCountry,
        coordinates,
        source: locationSource
      },
      device: {
        platform: clientDevice.platform || "mobile_web",
        browser: clientDevice.browser || "Chrome",
        os: clientDevice.os || "Android",
        screenResolution: clientDevice.screenResolution,
        networkType: clientDevice.networkType,
        userAgent: req.headers["user-agent"] || ""
      },
      isLead,
      timeSpentSeconds
    });

    // 6. Broadcast Real-Time WebSocket event to all connected Admins
    broadcastLiveActivity({
      id: activityDoc._id.toString(),
      visitorId: activityDoc.visitorId,
      userId: activityDoc.userId?.toString(),
      userContact: activityDoc.userContact,
      type: activityDoc.activityType,
      title: activityDoc.title,
      description: activityDoc.description,
      location: activityDoc.location,
      device: activityDoc.device,
      metadata: activityDoc.metadata,
      isLead: activityDoc.isLead,
      timestamp: activityDoc.createdAt.toISOString()
    });

    res.status(201).json({
      success: true,
      activityId: activityDoc._id
    });
  } catch (error) {
    next(error);
  }
}

export async function getLiveStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Accurate Live Active Visitors Online (distinct visitors in last 5 mins)
    const activeVisitors = await VisitorActivity.distinct("visitorId", {
      createdAt: { $gte: fiveMinutesAgo }
    });

    // 2. Accurate Unique Visitors Count Today (distinct individuals who visited today)
    const uniqueVisitorsToday = await VisitorActivity.distinct("visitorId", {
      createdAt: { $gte: startOfToday }
    });

    // 3. Registered Users with Phone/Account who visited today
    const registeredUsersVisitedToday = await VisitorActivity.distinct("userContact.phone", {
      createdAt: { $gte: startOfToday },
      "userContact.phone": { $exists: true, $ne: "" }
    });

    // 4. Guest Visitors Today
    const guestVisitorsTodayCount = Math.max(0, uniqueVisitorsToday.length - registeredUsersVisitedToday.length);

    // 5. Total Page Views / Hits today (all events)
    const totalPageViewsToday = await VisitorActivity.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // 6. Total high-intent leads generated today (WhatsApp + Call clicks)
    const todayLeadsCount = await VisitorActivity.countDocuments({
      isLead: true,
      createdAt: { $gte: startOfToday }
    });

    // 7. All-time unique visitors count
    const allTimeUniqueVisitors = await VisitorActivity.distinct("visitorId");

    // 8. Top cities by distinct unique visitors today
    const topCitiesAgg = await VisitorActivity.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: { city: "$location.city", visitorId: "$visitorId" } } },
      { $group: { _id: "$_id.city", uniqueVisitors: { $sum: 1 } } },
      { $sort: { uniqueVisitors: -1 } },
      { $limit: 6 }
    ]);

    // 9. All available cities in database for dynamic dropdown filter
    const allAvailableCities = await VisitorActivity.distinct("location.city");
    const cleanedCities = allAvailableCities
      .filter((c) => Boolean(c && typeof c === "string" && c.trim().length > 0))
      .sort((a, b) => a.localeCompare(b));

    // 10. Recent searches today
    const recentSearchesAgg = await VisitorActivity.aggregate([
      {
        $match: {
          activityType: "SEARCH_PERFORMED",
          createdAt: { $gte: startOfToday },
          "metadata.searchQuery": { $exists: true, $ne: "" }
        }
      },
      { $group: { _id: "$metadata.searchQuery", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        activeOnlineNow: activeVisitors.length,
        uniqueVisitorsToday: uniqueVisitorsToday.length,
        registeredUsersToday: registeredUsersVisitedToday.length,
        guestVisitorsToday: guestVisitorsTodayCount,
        totalPageViewsToday,
        todayLeadsCount,
        allTimeUniqueVisitors: allTimeUniqueVisitors.length,
        topCities: topCitiesAgg.map((c) => ({ city: c._id || "Unknown", count: c.uniqueVisitors })),
        availableCities: cleanedCities.length > 0 ? cleanedCities : ["Hyderabad", "Bangalore", "Mumbai"],
        topSearches: recentSearchesAgg.map((s) => ({ query: s._id, count: s.count })),
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getActivityFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string) || 30));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // 1. Time Range Filter
    const timeRange = String(req.query.timeRange || "all").toLowerCase();
    const now = new Date();

    if (timeRange === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: startOfToday };
    } else if (timeRange === "yesterday") {
      const startOfYesterday = new Date();
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfYesterday, $lte: endOfYesterday };
    } else if (timeRange === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: sevenDaysAgo };
    } else if (timeRange === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    // 2. Activity Type Filter
    if (req.query.type && req.query.type !== "all") {
      query.activityType = req.query.type;
    }

    // 3. Location / City Filter
    if (req.query.city && req.query.city !== "all") {
      query["location.city"] = new RegExp(`^${escapeRegex(String(req.query.city).trim())}$`, "i");
    }

    // 4. Visitor Type Filter (Registered User vs Guest vs Hot Leads)
    const visitorType = String(req.query.visitorType || "").toLowerCase();
    if (visitorType === "registered" || req.query.onlyRegistered === "true") {
      query["userContact.phone"] = { $exists: true, $nin: [null, ""] };
    } else if (visitorType === "guest") {
      query.$or = [
        { "userContact.phone": { $exists: false } },
        { "userContact.phone": null },
        { "userContact.phone": "" }
      ];
    } else if (visitorType === "leads" || req.query.onlyLeads === "true") {
      query.isLead = true;
    }

    // 5. Device Platform Filter
    if (req.query.platform && req.query.platform !== "all") {
      query["device.platform"] = req.query.platform;
    }

    // 6. Search Query Filter across Contact, Location, IP, or Content
    if (req.query.search) {
      const searchTerm = escapeRegex(String(req.query.search).trim());
      const regex = new RegExp(searchTerm, "i");
      query.$or = [
        { "userContact.name": regex },
        { "userContact.phone": regex },
        { "userContact.email": regex },
        { "location.ip": regex },
        { "location.city": regex },
        { "location.area": regex },
        { "metadata.listingTitle": regex },
        { "metadata.searchQuery": regex },
        { title: regex },
        { pagePath: regex }
      ];
    }

    const [activities, total] = await Promise.all([
      VisitorActivity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VisitorActivity.countDocuments(query)
    ]);

    const formatted = activities.map((a) => ({
      id: a._id.toString(),
      visitorId: a.visitorId,
      sessionId: a.sessionId,
      userId: a.userId?.toString(),
      userContact: a.userContact,
      type: a.activityType,
      title: a.title,
      description: a.description,
      pageUrl: a.pageUrl,
      pagePath: a.pagePath,
      location: a.location,
      device: a.device,
      metadata: a.metadata,
      isLead: a.isLead,
      timestamp: a.createdAt.toISOString()
    }));

    res.json({
      success: true,
      data: {
        activities: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getVisitorJourney(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { visitorId } = req.params;
    if (!visitorId) {
      res.status(400).json({ success: false, error: "visitorId parameter is required" });
      return;
    }

    const events = await VisitorActivity.find({ visitorId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: {
        visitorId,
        totalEvents: events.length,
        events: events.map((e) => ({
          id: e._id.toString(),
          type: e.activityType,
          title: e.title,
          description: e.description,
          pagePath: e.pagePath,
          location: e.location,
          isLead: e.isLead,
          metadata: e.metadata,
          timestamp: e.createdAt.toISOString()
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function exportTelemetryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: Record<string, any> = {};

    // 1. Time Range Filter
    const timeRange = String(req.query.timeRange || "all").toLowerCase();
    const now = new Date();

    if (timeRange === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: startOfToday };
    } else if (timeRange === "yesterday") {
      const startOfYesterday = new Date();
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfYesterday, $lte: endOfYesterday };
    } else if (timeRange === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: sevenDaysAgo };
    } else if (timeRange === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    // 2. Activity Type Filter
    if (req.query.type && req.query.type !== "all") {
      query.activityType = req.query.type;
    }

    // 3. Location / City Filter
    if (req.query.city && req.query.city !== "all") {
      query["location.city"] = new RegExp(`^${escapeRegex(String(req.query.city).trim())}$`, "i");
    }

    // 4. Visitor Type Filter
    const visitorType = String(req.query.visitorType || "").toLowerCase();
    if (visitorType === "registered" || req.query.onlyRegistered === "true") {
      query["userContact.phone"] = { $exists: true, $nin: [null, ""] };
    } else if (visitorType === "guest") {
      query.$or = [
        { "userContact.phone": { $exists: false } },
        { "userContact.phone": null },
        { "userContact.phone": "" }
      ];
    } else if (visitorType === "leads" || req.query.onlyLeads === "true") {
      query.isLead = true;
    }

    // 5. Device Platform Filter
    if (req.query.platform && req.query.platform !== "all") {
      query["device.platform"] = req.query.platform;
    }

    // 6. Search Query Filter
    if (req.query.search) {
      const searchTerm = escapeRegex(String(req.query.search).trim());
      const regex = new RegExp(searchTerm, "i");
      query.$or = [
        { "userContact.name": regex },
        { "userContact.phone": regex },
        { "userContact.email": regex },
        { "location.ip": regex },
        { "location.city": regex },
        { "location.area": regex },
        { "metadata.listingTitle": regex },
        { "metadata.searchQuery": regex },
        { title: regex },
        { pagePath: regex }
      ];
    }

    const activities = await VisitorActivity.find(query)
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    // Build Crystal-Clear Formatted CSV
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      "Record ID",
      "Date & Time (IST)",
      "Lead Priority",
      "Activity Type",
      "Visitor Name",
      "Mobile Phone",
      "Email Address",
      "City",
      "Area / Locality",
      "State",
      "Country",
      "IP Address",
      "Device Platform",
      "Browser & OS",
      "Product / Item Title",
      "Price (INR)",
      "Seller Phone",
      "Page URL",
      "Activity Summary"
    ];

    const rows = activities.map((a) => {
      const istTime = new Date(a.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });

      return [
        escapeCsv(a._id.toString()),
        escapeCsv(istTime),
        escapeCsv(a.isLead ? "HOT LEAD (Direct Contact)" : "Standard Activity"),
        escapeCsv(a.activityType),
        escapeCsv(a.userContact?.name || `Guest (${a.visitorId.slice(-4)})`),
        escapeCsv(a.userContact?.phone || "N/A"),
        escapeCsv(a.userContact?.email || "N/A"),
        escapeCsv(a.location?.city || "N/A"),
        escapeCsv(a.location?.area || "N/A"),
        escapeCsv(a.location?.state || "N/A"),
        escapeCsv(a.location?.country || "India"),
        escapeCsv(a.location?.ip || "N/A"),
        escapeCsv(a.device?.platform?.toUpperCase() || "WEB"),
        escapeCsv(`${a.device?.browser || "Browser"} (${a.device?.os || "OS"})`),
        escapeCsv(a.metadata?.listingTitle || a.metadata?.searchQuery || a.metadata?.storeName || "N/A"),
        escapeCsv(a.metadata?.listingPrice ? `₹${a.metadata.listingPrice}` : "N/A"),
        escapeCsv(a.metadata?.sellerPhone || "N/A"),
        escapeCsv(a.pagePath || a.pageUrl || "/"),
        escapeCsv(a.description || a.title)
      ].join(",");
    });

    // UTF-8 BOM for crystal-clear formatting in Microsoft Excel
    const csvData = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

    const reportDate = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="Omeetso_Visitor_Lead_Report_${reportDate}.csv"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
}

