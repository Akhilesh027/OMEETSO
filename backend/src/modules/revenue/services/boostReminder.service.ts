import mongoose from "mongoose";
import { Listing } from "../../listings/models/Listing";
import { User } from "../../users/models/User";
import { Notification } from "../../notifications/models/Notification";
import { AdCampaign } from "../models/AdCampaign";
import { BoostReminderLog } from "../models/BoostReminderLog";
import { ListingStatus } from "../../../contracts";
import { sendOtpSms } from "../../auth/services/sms.service";
import { broadcastLiveActivity } from "../../../sockets/socket-server";

export interface BoostScanResult {
  scannedCount: number;
  remindersDispatchedCount: number;
  skippedActiveCampaignCount: number;
  skippedRecentReminderCount: number;
  dispatchedListings: Array<{
    listingId: string;
    title: string;
    city: string;
    sellerPhone?: string;
  }>;
}

export async function scanAndSendBoostReminders(options: {
  minAgeDays?: number;
  maxAgeDays?: number;
  maxViews?: number;
  cooldownDays?: number;
} = {}): Promise<BoostScanResult> {
  const minAgeDays = options.minAgeDays ?? 3;
  const maxAgeDays = options.maxAgeDays ?? 30;
  const maxViews = options.maxViews ?? 35;
  const cooldownDays = options.cooldownDays ?? 4;

  const now = new Date();
  const minDate = new Date(now.getTime() - minAgeDays * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000);
  const cooldownCutoff = new Date(now.getTime() - cooldownDays * 24 * 60 * 60 * 1000);

  // 1. Query candidate active listings with low views
  const candidateListings = await Listing.find({
    status: { $in: [ListingStatus.ACTIVE, ListingStatus.APPROVED] },
    createdAt: { $lte: minDate, $gte: maxDate },
    $or: [
      { "analytics.views": { $lte: maxViews } },
      { analytics: { $exists: false } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  let remindersDispatched = 0;
  let skippedCampaign = 0;
  let skippedRecent = 0;
  const dispatchedListings: Array<{ listingId: string; title: string; city: string; sellerPhone?: string }> = [];

  for (const listing of candidateListings) {
    try {
      // 2. Check if listing already has an active ad campaign
      const activeCampaign = await AdCampaign.findOne({
        listingId: listing._id,
        status: { $in: ["ACTIVE", "APPROVED", "SCHEDULED", "PENDING_REVIEW"] }
      }).lean();

      if (activeCampaign) {
        skippedCampaign++;
        continue;
      }

      // 3. Check cooldown: ensure no reminder was sent to this listing in last `cooldownDays`
      const recentReminder = await BoostReminderLog.findOne({
        listingId: listing._id,
        sentAt: { $gte: cooldownCutoff }
      }).lean();

      if (recentReminder) {
        skippedRecent++;
        continue;
      }

      // 4. Fetch seller contact info
      const seller = await User.findById(listing.sellerId).select("phone email profile").lean();
      const sellerPhone = listing.sellerPhone || seller?.phone;
      const sellerEmail = seller?.email;

      const ageDays = Math.max(1, Math.floor((now.getTime() - new Date(listing.createdAt).getTime()) / (24 * 60 * 60 * 1000)));
      const currentViews = listing.analytics?.views || 0;

      // 5. Create in-app notification
      await Notification.create({
        userId: listing.sellerId,
        type: "system",
        title: `🚀 5x Your Buyers: Boost "${listing.title}"`,
        body: `Your listing in ${listing.city} had only ${currentViews} views. Boost it to the top of search results for just ₹49 to close deals 5x faster!`,
        link: `/promotions/new?listingId=${listing._id}&kind=listing`,
        isRead: false
      });

      // 6. If SMS is enabled and seller has phone, dispatch lightweight SMS
      if (sellerPhone) {
        const cleanDigits = sellerPhone.replace(/\D/g, "").slice(-10);
        if (cleanDigits.length === 10) {
          try {
            // Optional transactional SMS if template is ready
          } catch {}
        }
      }

      // 7. Log reminder record for tracking conversion & revenue attribution
      await BoostReminderLog.create({
        listingId: listing._id,
        sellerId: listing.sellerId,
        sellerPhone,
        sellerEmail,
        listingTitle: listing.title,
        listingCity: listing.city || "Hyderabad",
        viewsCountAtDispatch: currentViews,
        listingAgeDays: ageDays,
        channel: "push_notification",
        status: "SENT",
        sentAt: now
      });

      // 8. Broadcast live event to Admin Live Stream
      broadcastLiveActivity({
        id: `boost_rem_${listing._id}_${Date.now()}`,
        type: "BOOST_REMINDER_SENT",
        title: `⚡ AUTO-MONETIZATION: Sent Boost Reminder for "${listing.title}"`,
        description: `Dispatched automated ₹49 promotion reminder to seller (${sellerPhone || "Seller"}) in ${listing.city}. Age: ${ageDays}d, Views: ${currentViews}.`,
        location: { city: listing.city || "Hyderabad", country: "India" },
        metadata: {
          listingId: listing._id.toString(),
          listingTitle: listing.title,
          sellerPhone,
          recommendedPricePaise: 4900
        },
        isLead: false,
        timestamp: now.toISOString()
      });

      remindersDispatched++;
      dispatchedListings.push({
        listingId: listing._id.toString(),
        title: listing.title,
        city: listing.city || "Hyderabad",
        sellerPhone
      });
    } catch (err) {
      console.error(`[Boost Reminder] Error processing listing ${listing._id}:`, err);
    }
  }

  console.log(
    `[Boost Worker] Scanned ${candidateListings.length} listings. Dispatched: ${remindersDispatched}, Skipped (Active Campaign): ${skippedCampaign}, Skipped (Cooldown): ${skippedRecent}.`
  );

  return {
    scannedCount: candidateListings.length,
    remindersDispatchedCount: remindersDispatched,
    skippedActiveCampaignCount: skippedCampaign,
    skippedRecentReminderCount: skippedRecent,
    dispatchedListings
  };
}

export async function getMonetizationStats(): Promise<{
  totalRemindersSent: number;
  totalConvertedToPaid: number;
  conversionRatePercent: number;
  totalRevenueGeneratedINR: number;
  eligibleListingsCount: number;
  recentLogs: any[];
}> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const [totalSent, totalConverted, revenueAgg, eligibleCount, recentLogs] = await Promise.all([
    BoostReminderLog.countDocuments({}),
    BoostReminderLog.countDocuments({ status: "CONVERTED_PAID" }),
    BoostReminderLog.aggregate([
      { $match: { status: "CONVERTED_PAID" } },
      { $group: { _id: null, totalRevenuePaise: { $sum: "$revenueGeneratedInPaise" } } }
    ]),
    Listing.countDocuments({
      status: { $in: [ListingStatus.ACTIVE, ListingStatus.APPROVED] },
      createdAt: { $lte: threeDaysAgo },
      $or: [{ "analytics.views": { $lte: 35 } }, { analytics: { $exists: false } }]
    }),
    BoostReminderLog.find({})
      .sort({ sentAt: -1 })
      .limit(30)
      .lean()
  ]);

  const totalRevenuePaise = revenueAgg[0]?.totalRevenuePaise || 0;
  const conversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0;

  return {
    totalRemindersSent: totalSent,
    totalConvertedToPaid: totalConverted,
    conversionRatePercent: parseFloat(conversionRate.toFixed(1)),
    totalRevenueGeneratedINR: totalRevenuePaise / 100,
    eligibleListingsCount: eligibleCount,
    recentLogs: recentLogs.map((log) => ({
      id: log._id.toString(),
      listingId: log.listingId.toString(),
      listingTitle: log.listingTitle,
      listingCity: log.listingCity,
      sellerPhone: log.sellerPhone,
      viewsCount: log.viewsCountAtDispatch,
      ageDays: log.listingAgeDays,
      channel: log.channel,
      status: log.status,
      revenueINR: (log.revenueGeneratedInPaise || 0) / 100,
      sentAt: log.sentAt.toISOString(),
      convertedAt: log.convertedAt?.toISOString()
    }))
  };
}

export async function attributeBoostConversion(
  listingId: string | mongoose.Types.ObjectId,
  campaignId: string | mongoose.Types.ObjectId,
  amountInPaise: number
): Promise<void> {
  try {
    const log = await BoostReminderLog.findOne({
      listingId: new mongoose.Types.ObjectId(listingId.toString()),
      status: { $ne: "CONVERTED_PAID" }
    }).sort({ sentAt: -1 });

    if (log) {
      log.status = "CONVERTED_PAID";
      log.campaignId = new mongoose.Types.ObjectId(campaignId.toString());
      log.revenueGeneratedInPaise = amountInPaise;
      log.convertedAt = new Date();
      await log.save();
      console.log(`[Monetization] Successfully attributed revenue ₹${amountInPaise / 100} to reminder ${log._id}`);
    }
  } catch (err) {
    console.error("[Monetization] Attribution error:", err);
  }
}

