import { AdProduct } from "../../modules/revenue/models/AdProduct";
import { AdPlacement } from "../../modules/revenue/models/AdPlacement";
import { AdCampaign } from "../../modules/revenue/models/AdCampaign";
import { Listing } from "../../modules/listings/models/Listing";

export async function seedAdConfiguration(): Promise<void> {
  try {
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
    console.log(`[Seeder] Synced ${placements.length} AdPlacement slots in MongoDB.`);

    const products = [
      // --- Listing Boost Plans ---
      {
        name: "⚡ Quick Boost (3 Days)",
        description: "Promote your listing card with a FEATURED badge and category top placement for 3 days.",
        campaignType: "LISTING_BOOST",
        durationDays: 3,
        priceInPaise: 9900, // ₹99
        permittedPlacements: ["CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
        active: true
      },
      {
        name: "🚀 Popular Growth Boost (7 Days)",
        description: "Top search ranking, SPONSORED badge, and category header placement for 7 days. Most Popular!",
        campaignType: "LISTING_BOOST",
        durationDays: 7,
        priceInPaise: 24900, // ₹249
        permittedPlacements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
        active: true
      },
      {
        name: "👑 Pro Mega Boost (15 Days)",
        description: "Homepage banner feature, top search position, URGENT badge, and 10× visibility boost for 15 days.",
        campaignType: "LISTING_BOOST",
        durationDays: 15,
        priceInPaise: 49900, // ₹499
        permittedPlacements: ["HOMEPAGE_HERO", "SEARCH_TOP", "CATEGORY_FEATURED", "URGENT_BADGE"],
        active: true
      },
      {
        name: "🔴 Urgent Sale Fast Clearance (3 Days)",
        description: "Pulsing red URGENT sale badge overlay on your listing card for emergency sales and fast clearance.",
        campaignType: "LISTING_BOOST",
        durationDays: 3,
        priceInPaise: 4900, // ₹49
        permittedPlacements: ["URGENT_BADGE"],
        active: true
      },
      {
        name: "✨ Golden Glow Card Highlight (7 Days)",
        description: "Illuminated golden card border and warm badge glow that makes your product pop in all search grids.",
        campaignType: "LISTING_BOOST",
        durationDays: 7,
        priceInPaise: 8900, // ₹89
        permittedPlacements: ["HIGHLIGHTED_CARD"],
        active: true
      },
      {
        name: "🔍 Search Results Priority Spotlight (3 Days)",
        description: "Guaranteed top 1-3 ranking spots on keyword search results with SPONSORED badge for 3 days of targeted intent.",
        campaignType: "LISTING_BOOST",
        durationDays: 3,
        priceInPaise: 14900, // ₹149
        permittedPlacements: ["SEARCH_TOP"],
        active: true
      },
      // --- Banner Ad Packages ---
      {
        name: "🎨 Home Page Banner (7 Days)",
        description: "High-impact banner featured prominently across the main Omeetso homepage with direct store or listing link.",
        campaignType: "BANNER_AD",
        durationDays: 7,
        priceInPaise: 49900, // ₹499
        permittedPlacements: ["HOMEPAGE_HERO"],
        active: true
      },
      {
        name: "🌟 Home Page Banner (14 Days)",
        description: "Extended 2-week premium banner showcase across the Omeetso marketplace homepage.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 89900, // ₹899
        permittedPlacements: ["HOMEPAGE_HERO"],
        active: true
      },
      {
        name: "👑 Home Page Banner (30 Days)",
        description: "Full monthly presence on the main Omeetso homepage for sustained authority and maximum local reach.",
        campaignType: "BANNER_AD",
        durationDays: 30,
        priceInPaise: 149900, // ₹1,499
        permittedPlacements: ["HOMEPAGE_HERO"],
        active: true
      },
      {
        name: "🏷️ Category Page Banner (7 Days)",
        description: "Top billboard header banner displayed across category search pages for 7 days.",
        campaignType: "BANNER_AD",
        durationDays: 7,
        priceInPaise: 39900, // ₹399
        permittedPlacements: ["CATEGORY_HEADER"],
        active: true
      },
      {
        name: "🏷️ Category Page Banner (14 Days)",
        description: "Top header banner displayed across all category search pages targeting active local shoppers for 14 days.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 69900, // ₹699
        permittedPlacements: ["CATEGORY_HEADER"],
        active: true
      },
      {
        name: "🏬 Store Directory Banner (14 Days)",
        description: "Featured brand and showroom billboard on the /stores directory and merchant profile pages.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 49900, // ₹499
        permittedPlacements: ["STORE_BANNER"],
        active: true
      },
      {
        name: "🏬 Store Directory Banner (30 Days)",
        description: "Full monthly presence at the top of the Omeetso Store Directory to cement merchant authority in your locality.",
        campaignType: "BANNER_AD",
        durationDays: 30,
        priceInPaise: 89900, // ₹899
        permittedPlacements: ["STORE_BANNER"],
        active: true
      },
      {
        name: "💼 Jobs Portal Banner (7 Days)",
        description: "One week recruitment billboard header on Omeetso Local Jobs portal targeting urgent candidate hiring.",
        campaignType: "BANNER_AD",
        durationDays: 7,
        priceInPaise: 39900, // ₹399
        permittedPlacements: ["JOBS_HEADER"],
        active: true
      },
      {
        name: "💼 Jobs Portal Banner (14 Days)",
        description: "Top billboard spot on the Omeetso Local Jobs and careers portal targeting local candidates for 14 days.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 69900, // ₹699
        permittedPlacements: ["JOBS_HEADER"],
        active: true
      }
    ];

    await AdProduct.deleteMany({
      $or: [
        { name: { $regex: /Section Divider|Middle Promotional Carousel|Native Spotlight|Omnichannel|Showroom & Store Mega Spotlight|Contextual Partner/i } },
        { permittedPlacements: { $in: ["HOMEPAGE_SECTION_BANNER", "HOMEPAGE_CAROUSEL", "HOME_NATIVE_FEED", "PRODUCT_CONTEXTUAL"] } }
      ]
    });

    for (const prod of products) {
      await AdProduct.findOneAndUpdate(
        { name: prod.name },
        { $set: prod },
        { upsert: true, new: true }
      );
    }
    console.log("[Seeder] Synced AdProduct pricing packages in MongoDB.");
  } catch (error) {
    console.error("[Seeder] Error seeding ad configuration:", error);
  }
}
