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
  try {
    console.log("[BannerSeeder] Starting Banners & Ads seeding...");

    if (mongoose.connection.readyState !== 1) {
      await connectDatabase();
    }

  // 1. Seed Ad Placements
  const placements = [
    {
      placementId: "HOMEPAGE_HERO",
      name: "Home Page Banners",
      campaignTypes: ["BANNER_AD"],
      aspectRatio: "16:9",
      minimumWidth: 1600,
      minimumHeight: 900,
      maximumFileSizeBytes: 3145728,
      maximumActiveSlots: 10,
      active: true,
      page: "Homepage",
      route: "/",
      position: "Main Homepage Banner",
      description: "Prominent billboard banner across the main Omeetso homepage with auto-rotation, advertiser CTA link, and verified local reach.",
      device: "Web & Mobile App"
    },
    {
      placementId: "CATEGORY_HEADER",
      name: "Category Page Banners",
      campaignTypes: ["BANNER_AD"],
      aspectRatio: "3:1",
      minimumWidth: 1500,
      minimumHeight: 500,
      maximumFileSizeBytes: 2097152,
      maximumActiveSlots: 5,
      active: true,
      page: "Category Browse",
      route: "/category/all",
      position: "Category Top Billboard",
      description: "Top billboard banner across category pages (Mobiles, Cars, Electronics, Furniture, etc.) targeting active category shoppers.",
      device: "Web & Mobile App"
    },
    {
      placementId: "STORE_BANNER",
      name: "Store Directory Banners",
      campaignTypes: ["BANNER_AD"],
      aspectRatio: "3:1",
      minimumWidth: 1200,
      minimumHeight: 400,
      maximumFileSizeBytes: 2097152,
      maximumActiveSlots: 5,
      active: true,
      page: "Stores Directory & Showrooms",
      route: "/stores",
      position: "Store Directory Billboard",
      description: "Spotlight brand and showroom billboard banner on the stores directory and merchant profile pages.",
      device: "Web & Mobile App"
    },
    {
      placementId: "JOBS_HEADER",
      name: "Jobs Portal Banners",
      campaignTypes: ["BANNER_AD"],
      aspectRatio: "3:1",
      minimumWidth: 1200,
      minimumHeight: 400,
      maximumFileSizeBytes: 2097152,
      maximumActiveSlots: 5,
      active: true,
      page: "Jobs Portal",
      route: "/jobs",
      position: "Jobs Portal Top Header Banner",
      description: "Recruitment and hiring billboard banner at the top of the Omeetso Local Jobs and careers portal.",
      device: "Web & Mobile App"
    },
    {
      placementId: "SEARCH_TOP",
      name: "Search Results Priority Spots",
      campaignTypes: ["LISTING_BOOST"],
      aspectRatio: "CARD",
      minimumWidth: 600,
      minimumHeight: 400,
      maximumFileSizeBytes: 2097152,
      maximumActiveSlots: 5,
      active: true,
      page: "Search Results",
      route: "/results",
      position: "Top of Search Results Grid (#1 Priority)",
      description: "Guaranteed top 1-3 ranking spots on keyword search results with SPONSORED golden badge and maximum buyer visibility.",
      device: "Web & Mobile App"
    },
    {
      placementId: "CATEGORY_FEATURED",
      name: "Category Featured Listing",
      campaignTypes: ["LISTING_BOOST"],
      aspectRatio: "CARD",
      minimumWidth: 600,
      minimumHeight: 400,
      maximumFileSizeBytes: 2097152,
      maximumActiveSlots: 10,
      active: true,
      page: "Category Browse",
      route: "/category/all",
      position: "Category Listing Grid",
      description: "Featured sponsored listing cards in category product grids with highlighted border and priority buyer inquiries.",
      device: "Web & Mobile App"
    },
    {
      placementId: "URGENT_BADGE",
      name: "Urgent Sale Badge",
      campaignTypes: ["LISTING_BOOST"],
      aspectRatio: "BADGE",
      minimumWidth: 200,
      minimumHeight: 60,
      maximumFileSizeBytes: 524288,
      maximumActiveSlots: 25,
      active: true,
      page: "All Feeds & Search Results",
      route: "/results",
      position: "Listing Card Top-Left Ribbon",
      description: "Pulsing red 'URGENT SALE' ribbon badge overlaid on listing cards to trigger rapid buyer inquiries.",
      device: "Web & Mobile App"
    },
    {
      placementId: "HIGHLIGHTED_CARD",
      name: "Golden Highlighted Card",
      campaignTypes: ["LISTING_BOOST"],
      aspectRatio: "CARD",
      minimumWidth: 600,
      minimumHeight: 400,
      maximumFileSizeBytes: 2097152,
      maximumActiveSlots: 20,
      active: true,
      page: "All Feeds & Search Results",
      route: "/results",
      position: "Listing Card Glow Border",
      description: "Golden illuminated card border with subtle gradient glow effect making listings stand out in browsing feeds.",
      device: "Web & Mobile App"
    }
  ];

  await AdPlacement.deleteMany({
    placementId: { $in: ["HOMEPAGE_SECTION_BANNER", "HOMEPAGE_CAROUSEL", "HOME_NATIVE_FEED", "PRODUCT_CONTEXTUAL"] }
  });

  for (const p of placements) {
    await AdPlacement.findOneAndUpdate(
      { placementId: p.placementId },
      { $set: p },
      { upsert: true, new: true }
    );
  }
  console.log(`[BannerSeeder] Seeded ${placements.length} Ad Placements.`);

  // 2. Seed Ad Pricing Products (Clean & Plain)
  const products = [
    // --- Listing Boost Plans ---
    {
      name: "⚡ Quick Boost (3 Days)",
      description: "Promote your listing card with a FEATURED badge and higher category ranking for 3 days.",
      campaignType: "LISTING_BOOST",
      durationDays: 3,
      priceInPaise: 9900,
      originalPriceInPaise: 14900,
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
      description: "Top search ranking, SPONSORED badge, and category spotlight for 7 days. Most popular seller choice!",
      campaignType: "LISTING_BOOST",
      durationDays: 7,
      priceInPaise: 24900,
      originalPriceInPaise: 39900,
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
      name: "👑 Pro Mega Boost (15 Days)",
      description: "Homepage hero feature, guaranteed top search spot, URGENT badge, and 10× visibility boost for 15 days.",
      campaignType: "LISTING_BOOST",
      durationDays: 15,
      priceInPaise: 49900,
      originalPriceInPaise: 79900,
      badge: "👑 Max Exposure",
      features: [
        "Homepage Banner Feature",
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
      name: "🔴 Urgent Sale Fast Clearance (3 Days)",
      description: "Pulsing red URGENT sale badge overlay on your listing card for emergency sales and fast clearance.",
      campaignType: "LISTING_BOOST",
      durationDays: 3,
      priceInPaise: 4900,
      originalPriceInPaise: 9900,
      badge: "🔴 Urgent Sale",
      features: [
        "Eye-catching Pulsing Red 'URGENT' Ribbon",
        "Filtered directly into 'Urgent Deals' local browse tab",
        "Instant buyer WhatsApp trigger & direct calling button",
        "Clearance liquidation tag for price-conscious buyers"
      ],
      estimatedReach: "2,000 - 4,500 Bargain Hunters",
      priority: 4,
      permittedPlacements: ["URGENT_BADGE"],
      active: true
    },
    {
      name: "✨ Golden Glow Card Highlight (7 Days)",
      description: "Illuminated golden card border and warm badge glow that makes your product pop in all search grids.",
      campaignType: "LISTING_BOOST",
      durationDays: 7,
      priceInPaise: 8900,
      originalPriceInPaise: 14900,
      badge: "✨ Golden Border",
      features: [
        "Illuminated Golden Glowing Border on Product Card",
        "Stands out from ordinary listings in category & search feeds",
        "Verified seller trust emblem overlay",
        "3× Higher click-through rate from visual prominence"
      ],
      estimatedReach: "4,000 - 8,000 Category Shoppers",
      priority: 5,
      permittedPlacements: ["HIGHLIGHTED_CARD"],
      active: true
    },
    {
      name: "🔍 Search Results Priority Spotlight (3 Days)",
      description: "Guaranteed top 1-3 ranking spots on keyword search results with SPONSORED badge for 3 days of targeted intent.",
      campaignType: "LISTING_BOOST",
      durationDays: 3,
      priceInPaise: 14900,
      originalPriceInPaise: 24900,
      badge: "⚡ Search Rank",
      features: [
        "Guaranteed Top 1-3 ranking for relevant keyword searches",
        "SPONSORED golden badge label",
        "Target active buyers ready to purchase right now",
        "Instant direct call and chat connectivity"
      ],
      estimatedReach: "3,000 - 6,000 Active Searchers",
      priority: 6,
      permittedPlacements: ["SEARCH_TOP"],
      active: true
    },

    // --- Plain Banners (Home Page Banners, Category, Stores, Jobs) ---
    {
      name: "🎨 Home Page Banner (7 Days)",
      description: "High-impact banner featured prominently across the main Omeetso homepage with direct store or listing link.",
      campaignType: "BANNER_AD",
      durationDays: 7,
      priceInPaise: 49900,
      originalPriceInPaise: 79900,
      badge: "Best for Stores",
      features: [
        "Main Homepage Billboard Banner Placement",
        "Custom Creative Image & Direct Link",
        "Click-through to Store / WhatsApp",
        "Targeted by User City / Pincode"
      ],
      estimatedReach: "20,000+ Homepage Visitors",
      priority: 7,
      permittedPlacements: ["HOMEPAGE_HERO"],
      active: true
    },
    {
      name: "🌟 Home Page Banner (14 Days)",
      description: "Extended 2-week premium banner showcase across the Omeetso marketplace homepage.",
      campaignType: "BANNER_AD",
      durationDays: 14,
      priceInPaise: 89900,
      originalPriceInPaise: 149900,
      badge: "🔥 Premium Spot",
      features: [
        "14 Days Prime Banner Rotation on Homepage",
        "High CTR direct store showroom & WhatsApp link",
        "Hyperlocal city & district targeted delivery",
        "Live real-time impression & click telemetry"
      ],
      estimatedReach: "45,000+ Verified Visitors",
      priority: 8,
      permittedPlacements: ["HOMEPAGE_HERO"],
      active: true
    },
    {
      name: "👑 Home Page Banner (30 Days)",
      description: "Full monthly presence on the main Omeetso homepage for sustained authority and maximum local reach.",
      campaignType: "BANNER_AD",
      durationDays: 30,
      priceInPaise: 149900,
      originalPriceInPaise: 249900,
      badge: "👑 Max Branding",
      features: [
        "30 Days Continuous Rotation on Homepage",
        "Direct Store / Profile / WhatsApp Inquiry Link",
        "Zero Banner Fatigue with Multi-Creative Rotation",
        "Comprehensive Monthly Analytics & CTR Insights"
      ],
      estimatedReach: "100,000+ Homepage Impressions",
      priority: 9,
      permittedPlacements: ["HOMEPAGE_HERO"],
      active: true
    },
    {
      name: "🏷️ Category Page Banner (7 Days)",
      description: "Top billboard header banner displayed across category search pages for 7 days.",
      campaignType: "BANNER_AD",
      durationDays: 7,
      priceInPaise: 39900,
      originalPriceInPaise: 69900,
      badge: "Niche Target",
      features: [
        "Pinned at Top of Specific Category Pages",
        "Targets users actively browsing your specific industry",
        "Direct store showroom or external website link",
        "Zero competing banner in viewport"
      ],
      estimatedReach: "25,000+ Category Shoppers",
      priority: 10,
      permittedPlacements: ["CATEGORY_HEADER"],
      active: true
    },
    {
      name: "🏷️ Category Page Banner (14 Days)",
      description: "Top header banner displayed across all category search pages targeting active local shoppers for 14 days.",
      campaignType: "BANNER_AD",
      durationDays: 14,
      priceInPaise: 69900,
      originalPriceInPaise: 119900,
      badge: "High Conversion",
      features: [
        "Pinned at Top of Specific Category",
        "Zero Direct Competition in Slot",
        "Targeted to Buyers Browsing Your Niche",
        "Live Click & View Analytics Dashboard"
      ],
      estimatedReach: "50,000+ Category Shoppers",
      priority: 11,
      permittedPlacements: ["CATEGORY_HEADER"],
      active: true
    },
    {
      name: "🏬 Store Directory Banner (14 Days)",
      description: "Featured brand and showroom billboard on the /stores directory and merchant profile pages.",
      campaignType: "BANNER_AD",
      durationDays: 14,
      priceInPaise: 49900,
      originalPriceInPaise: 89900,
      badge: "Best for Showrooms",
      features: [
        "Top billboard spot on /stores directory",
        "Pinned spotlight on merchant category pages",
        "Direct store showroom visit link",
        "Verified Merchant Trust Shield"
      ],
      estimatedReach: "25,000+ Verified Buyers",
      priority: 12,
      permittedPlacements: ["STORE_BANNER"],
      active: true
    },
    {
      name: "🏬 Store Directory Banner (30 Days)",
      description: "Full monthly presence at the top of the Omeetso Store Directory to cement merchant authority in your locality.",
      campaignType: "BANNER_AD",
      durationDays: 30,
      priceInPaise: 89900,
      originalPriceInPaise: 149900,
      badge: "👑 Store Branding",
      features: [
        "30 Days permanent billboard on /stores directory",
        "Promoted Merchant profile with direct WhatsApp inquiries",
        "Google Maps store navigation link integration",
        "Priority Merchant Verification Badge"
      ],
      estimatedReach: "60,000+ Store Shoppers",
      priority: 13,
      permittedPlacements: ["STORE_BANNER"],
      active: true
    },
    {
      name: "💼 Jobs Portal Banner (7 Days)",
      description: "One week recruitment billboard header on Omeetso Local Jobs portal targeting urgent candidate hiring.",
      campaignType: "BANNER_AD",
      durationDays: 7,
      priceInPaise: 39900,
      originalPriceInPaise: 69900,
      badge: "Urgent Hiring",
      features: [
        "Top billboard spot on Omeetso Local Jobs Portal",
        "Direct WhatsApp & phone call application buttons",
        "Target drivers, sales executive, retail & technical staff",
        "Urgent employer badge with fast candidate leads"
      ],
      estimatedReach: "10,000+ Local Candidates",
      priority: 14,
      permittedPlacements: ["JOBS_HEADER"],
      active: true
    },
    {
      name: "💼 Jobs Portal Banner (14 Days)",
      description: "Top billboard spot on the Omeetso Local Jobs and careers portal targeting local candidates for 14 days.",
      campaignType: "BANNER_AD",
      durationDays: 14,
      priceInPaise: 69900,
      originalPriceInPaise: 119900,
      badge: "Fast Hiring",
      features: [
        "Top billboard spot on Omeetso Local Jobs Portal",
        "Direct call & WhatsApp application buttons",
        "Target nearby drivers, technicians, retail & office staff",
        "Verified employer badge & urgent hiring tag"
      ],
      estimatedReach: "25,000+ Local Job Seekers",
      priority: 15,
      permittedPlacements: ["JOBS_HEADER"],
      active: true
    }
  ];

  for (const prod of products) {
    await AdProduct.findOneAndUpdate(
      { name: prod.name },
      { $set: prod },
      { upsert: true, new: true }
    );
  }
  console.log(`[BannerSeeder] Synced ${products.length} Ad Pricing Products.`);

  // 3. Seed High-Converting Home Banners
  const sampleBanners = [
    {
      bannerId: "bnr_hero_01",
      type: "hero_showcase",
      title: "Sell Any Item in 30 Seconds with 0% Commission on Omeetso",
      subtitle: "Connect directly with verified local buyers in your neighborhood with instant chat & 100% free buyer leads",
      tag: "⚡ Post 100% Free on Omeetso",
      price: 0,
      originalPrice: 0,
      image: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1600",
      sellerName: "Omeetso Community",
      initials: "OM",
      location: "Local Marketplace",
      responseTime: "⚡ Direct WhatsApp & Chat",
      targetUrl: "/sell",
      order: 1,
      isActive: true
    },
    {
      bannerId: "bnr_hero_02",
      type: "hero_showcase",
      title: "Discover 500+ Verified Local Business Stores & Showrooms",
      subtitle: "Shop genuine warranty products directly from top-rated neighborhood merchants with same-day doorstep pickup",
      tag: "🏬 Omeetso Store Spotlight",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
      sellerName: "Omeetso Store Network",
      initials: "OS",
      location: "Verified Merchants",
      targetUrl: "/stores",
      order: 2,
      isActive: true
    },
    {
      bannerId: "bnr_hero_03",
      type: "hero_showcase",
      title: "Book Trusted Doorstep Home Services — AC Care, Cleaning & Electricians",
      subtitle: "Verified doorstep professionals at fixed honest pricing with 30-day service warranty",
      tag: "🛠️ 30-Min Rapid Arrival",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600",
      sellerName: "Omeetso Home Services",
      initials: "OH",
      location: "Doorstep Pros",
      targetUrl: "/services",
      order: 3,
      isActive: true
    },
    {
      bannerId: "bnr_hero_04",
      type: "hero_showcase",
      title: "Up to 70% Off Certified Pre-Owned Smartphones & Gadgets",
      subtitle: "Inspected devices with invoice, 100% battery health & physical condition check video",
      tag: "📱 Certified Pre-Owned",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600",
      sellerName: "TechZone Hub",
      initials: "TZ",
      location: "Hyderabad",
      targetUrl: "/results?category=electronics",
      order: 4,
      isActive: true
    },
    {
      bannerId: "bnr_strip_01",
      type: "category_strip",
      title: "Direct Used Cars & Two-Wheelers from Real Verified Owners",
      subtitle: "Inspect vehicles locally with company service records and zero dealer commission",
      tag: "🚗 Direct Owner Deals",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600",
      sellerName: "Omeetso Auto",
      initials: "OA",
      location: "Local Vehicles",
      targetUrl: "/results?category=cars",
      order: 5,
      isActive: true
    },
    {
      bannerId: "bnr_strip_02",
      type: "category_strip",
      title: "Solid Sheesham Wood Furniture & Luxury Home Decor Clearance",
      subtitle: "Direct factory pricing from verified craft stores with same-day doorstep delivery",
      tag: "🛋️ Factory Direct",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600",
      sellerName: "Royal Crafts",
      initials: "RC",
      location: "Craft District",
      targetUrl: "/results?category=furniture",
      order: 6,
      isActive: true
    },
    {
      bannerId: "bnr_deal_01",
      type: "quick_deal",
      title: "Direct In-App Buyer Chat & 0% Middleman Fees on Omeetso",
      subtitle: "Deal safely face-to-face with verified buyers and sellers in your city without commission cuts",
      tag: "🛡️ Omeetso Safe Trade",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600",
      sellerName: "Omeetso Buyer Shield",
      initials: "OS",
      location: "Hyperlocal Network",
      targetUrl: "/results",
      order: 7,
      isActive: true
    },
    {
      bannerId: "bnr_deal_02",
      type: "quick_deal",
      title: "Post Local Job Vacancies & Hire Nearby Verified Talent",
      subtitle: "Connect with skilled drivers, delivery staff, technicians, retail staff, and professionals nearby",
      tag: "💼 Hyperlocal Hiring",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600",
      sellerName: "Omeetso Jobs",
      initials: "OJ",
      location: "Local Opportunities",
      targetUrl: "/jobs",
      order: 8,
      isActive: true
    }
  ];

  const existingBannersCount = await HomeBanner.countDocuments();
  if (existingBannersCount === 0) {
    await HomeBanner.insertMany(sampleBanners);
    console.log(`[BannerSeeder] Seeded ${sampleBanners.length} Home Banners in MongoDB.`);
  } else {
    console.log(`[BannerSeeder] Home Banners already exist (${existingBannersCount}), preserving them.`);
  }

  // 4. Seed Active AdCampaigns for Homepage Hero (ONLY if no campaigns exist)
  const existingCampaignsCount = await AdCampaign.countDocuments();
  if (existingCampaignsCount === 0) {
    let advertiser = await User.findOne({ email: "admin@digitalness.co.in" });
    if (!advertiser) advertiser = await User.findOne({});
    const advertiserUserId = advertiser ? advertiser._id : new mongoose.Types.ObjectId();

    const sampleCampaigns = [
      {
        campaignType: "BANNER_AD",
        advertiserUserId,
        targetType: "STORE",
        placementIds: ["HOMEPAGE_HERO"],
        bannerUrl: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1600",
        targeting: { city: "Hyderabad" },
        pricing: { amountInPaise: 49900, taxInPaise: 8982, totalInPaise: 58882 },
        paymentStatus: "PAID",
        status: "ACTIVE",
        startAt: new Date(Date.now() - 86400000),
        endAt: new Date(Date.now() + 30 * 86400000),
        analytics: { impressions: 1420, clicks: 185 }
      },
      {
        campaignType: "BANNER_AD",
        advertiserUserId,
        targetType: "STORE",
        placementIds: ["HOMEPAGE_HERO", "STORE_BANNER"],
        bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
        targeting: { city: "Hyderabad" },
        pricing: { amountInPaise: 89900, taxInPaise: 16182, totalInPaise: 106082 },
        paymentStatus: "PAID",
        status: "ACTIVE",
        startAt: new Date(Date.now() - 86400000),
        endAt: new Date(Date.now() + 30 * 86400000),
        analytics: { impressions: 2150, clicks: 310 }
      }
    ];
    await AdCampaign.insertMany(sampleCampaigns);
    console.log(`[BannerSeeder] Seeded ${sampleCampaigns.length} Active Banner Ad Campaigns in MongoDB.`);
  } else {
    console.log(`[BannerSeeder] Ad Campaigns already exist (${existingCampaignsCount}), preserving all live seller ads.`);
  }

    return {
      bannersCount: sampleBanners.length,
      placementsCount: placements.length,
      productsCount: products.length,
      campaignsCount: await AdCampaign.countDocuments()
    };
  } catch (error) {
    console.error("[BannerSeeder] Error seeding banners and ads:", error);
    return {
      bannersCount: 0,
      placementsCount: 0,
      productsCount: 0,
      campaignsCount: 0
    };
  }
}

if (require.main === module) {
  seedBannersAndAds()
    .then(async (res) => {
      console.log(`[BannerSeeder] Successfully finished seeding banners & ads:`, res);
      await disconnectDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error("[BannerSeeder] Fatal error during seeding:", err);
      process.exit(1);
    });
}
