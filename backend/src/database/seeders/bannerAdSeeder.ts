import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../connect";
import { HomeBanner } from "../../modules/revenue/models/HomeBanner";
import { AdPlacement } from "../../modules/revenue/models/AdPlacement";
import { AdProduct } from "../../modules/revenue/models/AdProduct";
import { AdCampaign } from "../../modules/revenue/models/AdCampaign";
import { User } from "../../modules/users/models/User";

export async function seedBannersAndAds(): Promise<{
  bannersCount: number;
  placementsCount: number;
  productsCount: number;
  campaignsCount: number;
}> {
  console.log("[Seeder] Starting Banners & Ads seeding...");

  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }

  // 1. Seed Ad Placements
  const placements = [
    {
      placementId: "HOMEPAGE_HERO",
      name: "Homepage Hero Banner",
      campaignTypes: ["BANNER_AD"],
      aspectRatio: "16:9",
      minimumWidth: 1600,
      minimumHeight: 900,
      maximumFileSizeBytes: 3145728,
      maximumActiveSlots: 10,
      active: true
    },
    {
      placementId: "CATEGORY_HEADER",
      name: "Category Header Banner",
      campaignTypes: ["BANNER_AD"],
      aspectRatio: "3:1",
      minimumWidth: 1500,
      minimumHeight: 500,
      maximumFileSizeBytes: 2097152,
      maximumActiveSlots: 10,
      active: true
    },
    {
      placementId: "SEARCH_TOP",
      name: "Search Priority #1 Spot",
      campaignTypes: ["LISTING_BOOST"],
      aspectRatio: "CARD",
      minimumWidth: 400,
      minimumHeight: 400,
      maximumFileSizeBytes: 1048576,
      maximumActiveSlots: 20,
      active: true
    },
    {
      placementId: "HOMEPAGE_CAROUSEL",
      name: "Featured Deals Carousel",
      campaignTypes: ["LISTING_BOOST"],
      aspectRatio: "CARD",
      minimumWidth: 400,
      minimumHeight: 400,
      maximumFileSizeBytes: 1048576,
      maximumActiveSlots: 20,
      active: true
    },
    {
      placementId: "URGENT_BADGE",
      name: "Urgent Deal Highlight",
      campaignTypes: ["LISTING_BOOST"],
      aspectRatio: "BADGE",
      minimumWidth: 200,
      minimumHeight: 200,
      maximumFileSizeBytes: 524288,
      maximumActiveSlots: 25,
      active: true
    },
    {
      placementId: "STORE_BANNER",
      name: "Store Directory Spotlight",
      campaignTypes: ["BANNER_AD"],
      aspectRatio: "3:1",
      minimumWidth: 1200,
      minimumHeight: 400,
      maximumFileSizeBytes: 2097152,
      maximumActiveSlots: 10,
      active: true
    }
  ];

  for (const p of placements) {
    await AdPlacement.findOneAndUpdate(
      { placementId: p.placementId },
      { $set: p },
      { upsert: true, new: true }
    );
  }
  console.log(`[Seeder] Seeded ${placements.length} Ad Placements.`);

  // 2. Seed Ad Products / Pricing Plans
  const products = [
    {
      name: "⚡ Starter Quick Boost (3 Days)",
      description: "Promote your listing card with a FEATURED badge and category top placement for 3 days of quick exposure.",
      campaignType: "LISTING_BOOST",
      durationDays: 3,
      priceInPaise: 9900, // ₹99
      originalPriceInPaise: 14900, // ₹149
      badge: "⚡ Quick Sale",
      features: [
        "FEATURED Ribbon Badge on Card",
        "Higher Category Grid Ranking",
        "Direct WhatsApp & Offer Priority",
        "Priority Search Indexing"
      ],
      estimatedReach: "1,500 - 3,000 Local Buyers",
      priority: 1,
      permittedPlacements: ["CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
      active: true
    },
    {
      name: "🚀 Popular Growth Boost (7 Days)",
      description: "Top search ranking, SPONSORED badge, and category header placement for 7 days. Most popular seller choice!",
      campaignType: "LISTING_BOOST",
      durationDays: 7,
      priceInPaise: 24900, // ₹249
      originalPriceInPaise: 39900, // ₹399
      badge: "🔥 Most Popular",
      features: [
        "#1 Top Rank on Search Results",
        "SPONSORED Golden Badge",
        "Pinned Category Header Spot",
        "5× More Buyer Messages & Calls",
        "Daily Automatic Listing Bump"
      ],
      estimatedReach: "5,000 - 12,000 Local Buyers",
      priority: 2,
      permittedPlacements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
      active: true
    },
    {
      name: "👑 Pro Mega Takeover Boost (15 Days)",
      description: "Homepage hero carousel, guaranteed top search spot, URGENT badge, and 10× visibility boost for 15 days.",
      campaignType: "LISTING_BOOST",
      durationDays: 15,
      priceInPaise: 49900, // ₹499
      originalPriceInPaise: 79900, // ₹799
      badge: "👑 Max Exposure",
      features: [
        "Homepage Hero Carousel Feature",
        "Guaranteed Top 3 Search Spot",
        "URGENT Red Sale Badge",
        "Hyperlocal GPS Push Notifications",
        "10× Exposure & Verified Priority"
      ],
      estimatedReach: "15,000 - 30,000 Local Buyers",
      priority: 3,
      permittedPlacements: ["HOMEPAGE_HERO", "SEARCH_TOP", "CATEGORY_FEATURED", "URGENT_BADGE"],
      active: true
    },
    {
      name: "🎨 Homepage Hero Showcase Banner (7 Days)",
      description: "Custom promotional banner image featured prominently on the main Omeetso Homepage Hero Carousel with direct link.",
      campaignType: "BANNER_AD",
      durationDays: 7,
      priceInPaise: 49900, // ₹499
      originalPriceInPaise: 79900, // ₹799
      badge: "Best for Stores",
      features: [
        "Full-Width Main Homepage Carousel",
        "Custom Creative Image & Direct Link",
        "Click-through to Store / WhatsApp",
        "Targeted by User City / Pincode"
      ],
      estimatedReach: "20,000+ Homepage Visitors",
      priority: 4,
      permittedPlacements: ["HOMEPAGE_HERO"],
      active: true
    },
    {
      name: "🏷️ Category Top Spotlight Banner (14 Days)",
      description: "Top header banner displayed across all category search pages targeting active local shoppers for 14 days.",
      campaignType: "BANNER_AD",
      durationDays: 14,
      priceInPaise: 89900, // ₹899
      originalPriceInPaise: 149900, // ₹1,499
      badge: "High Conversion",
      features: [
        "Pinned at Top of Specific Category",
        "Zero Direct Competition in Slot",
        "Targeted to Buyers Browsing Your Niche",
        "Live Click & View Analytics Dashboard"
      ],
      estimatedReach: "45,000+ Category Shoppers",
      priority: 5,
      permittedPlacements: ["CATEGORY_HEADER"],
      active: true
    },
    {
      name: "💎 30-Day Omnichannel Brand Takeover (30 Days)",
      description: "Complete brand takeover featuring your banner across Homepage Hero, Category Top Headers, and Store Spotlight sections.",
      campaignType: "BANNER_AD",
      durationDays: 30,
      priceInPaise: 199900, // ₹1,999
      originalPriceInPaise: 349900, // ₹3,499
      badge: "💎 Enterprise Plan",
      features: [
        "Rotating Banner on Homepage Hero",
        "Category Top Banner Across Related Pages",
        "Store Spotlight & Middle Feed Banners",
        "Dedicated Account Manager Support",
        "Weekly Performance Analytics Reports"
      ],
      estimatedReach: "100,000+ Verified Impressions",
      priority: 6,
      permittedPlacements: ["HOMEPAGE_HERO", "CATEGORY_HEADER", "STORE_BANNER"],
      active: true
    }
  ];

  await AdProduct.deleteMany({});
  await AdProduct.insertMany(products);
  console.log(`[Seeder] Seeded ${products.length} Ad Pricing Products.`);

  // 3. Seed Clean Omeetso Promotional Fallback Banners (Shown ONLY when no active advertiser ads are running)
  const sampleBanners = [
    {
      bannerId: "bnr_hero_fallback",
      type: "hero_showcase",
      title: "Sell Anything in 30 Seconds with 0% Commission on Omeetso",
      subtitle: "Connect directly with verified local buyers in your neighborhood with instant chat & 100% free buyer leads",
      tag: "⚡ Post 100% Free on Omeetso",
      price: 0,
      originalPrice: 0,
      image: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1200",
      sellerName: "Omeetso Community",
      initials: "OM",
      location: "Local Marketplace",
      responseTime: "⚡ Direct WhatsApp & Chat",
      targetUrl: "/sell",
      order: 1,
      isActive: true
    },
    {
      bannerId: "bnr_promo_stores",
      type: "category_strip",
      title: "Discover Verified Local Business Stores & Showrooms on Omeetso",
      subtitle: "Shop genuine warranty products directly from top-rated neighborhood merchants with same-day doorstep pickup",
      tag: "🏬 Omeetso Store Spotlight",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      sellerName: "Omeetso Store Network",
      initials: "OS",
      location: "Verified Merchants",
      targetUrl: "/stores",
      order: 2,
      isActive: true
    },
    {
      bannerId: "bnr_promo_direct",
      type: "quick_deal",
      title: "Direct In-App Buyer Chat & 0% Middleman Fees on Omeetso",
      subtitle: "Deal safely face-to-face with verified buyers and sellers in your city without commission cuts",
      tag: "🛡️ Omeetso Safe Trade",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200",
      sellerName: "Omeetso Buyer Shield",
      initials: "OS",
      location: "Hyperlocal Network",
      targetUrl: "/results",
      order: 3,
      isActive: true
    }
  ];

  await HomeBanner.deleteMany({});
  await HomeBanner.insertMany(sampleBanners);
  console.log(`[Seeder] Seeded ${sampleBanners.length} Omeetso Promotional Fallback Banners.`);

  return {
    bannersCount: sampleBanners.length,
    placementsCount: placements.length,
    productsCount: products.length,
    campaignsCount: 0
  };
}

// Run directly if invoked from command line
if (require.main === module) {
  seedBannersAndAds()
    .then(async (res) => {
      console.log(`[Seeder] Successfully finished seeding banners & ads:`, res);
      await disconnectDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seeder] Fatal error during seeding:", err);
      process.exit(1);
    });
}
