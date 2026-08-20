import { AdProduct } from "../../modules/revenue/models/AdProduct";
import { AdPlacement } from "../../modules/revenue/models/AdPlacement";
import { AdCampaign } from "../../modules/revenue/models/AdCampaign";
import { Listing } from "../../modules/listings/models/Listing";

export async function seedAdConfiguration(): Promise<void> {
  try {
    const placements = [
      {
        placementId: "HOMEPAGE_HERO",
        name: "Homepage Hero Banner",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "16:9",
        minimumWidth: 1600,
        minimumHeight: 900,
        maximumFileSizeBytes: 3145728, // 3MB
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
        maximumFileSizeBytes: 2097152, // 2MB
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
    console.log("[Seeder] Synced 6 AdPlacement slots in MongoDB.");

    const products = [
      // --- Listing Boost Plans ---
      {
        name: "⚡ Starter Boost Plan (3 Days)",
        description: "Promote your listing card with a FEATURED badge and category top placement for 3 days.",
        campaignType: "LISTING_BOOST",
        durationDays: 3,
        priceInPaise: 9900, // ₹99
        permittedPlacements: ["CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
        active: true
      },
      {
        name: "🚀 Popular Growth Boost Plan (7 Days)",
        description: "Top search ranking, SPONSORED badge, and category header placement for 7 days. Most Popular!",
        campaignType: "LISTING_BOOST",
        durationDays: 7,
        priceInPaise: 24900, // ₹249
        permittedPlacements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
        active: true
      },
      {
        name: "👑 Pro Mega Takeover Plan (15 Days)",
        description: "Homepage hero carousel, top search position, URGENT badge, and 10× visibility boost for 15 days.",
        campaignType: "LISTING_BOOST",
        durationDays: 15,
        priceInPaise: 49900, // ₹499
        permittedPlacements: ["HOMEPAGE_HERO", "SEARCH_TOP", "CATEGORY_FEATURED", "URGENT_BADGE"],
        active: true
      },
      // --- Banner Ad Packages ---
      {
        name: "🎨 7-Day Homepage Hero Banner Package",
        description: "Custom promotional banner image featured prominently on the main Omeetso Homepage Hero Carousel with direct link.",
        campaignType: "BANNER_AD",
        durationDays: 7,
        priceInPaise: 49900, // ₹499
        permittedPlacements: ["HOMEPAGE_HERO"],
        active: true
      },
      {
        name: "🏷️ 14-Day Category Top Header Banner Package",
        description: "Top header banner displayed across all category search pages targeting active local shoppers for 14 days.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 89900, // ₹899
        permittedPlacements: ["CATEGORY_HEADER"],
        active: true
      },
      {
        name: "👑 30-Day Store Mega Takeover Banner Package",
        description: "Complete brand takeover featuring your banner across Homepage Hero, Category Top Headers, and Store Spotlight sections.",
        campaignType: "BANNER_AD",
        durationDays: 30,
        priceInPaise: 199900, // ₹1,999
        permittedPlacements: ["HOMEPAGE_HERO", "CATEGORY_HEADER", "STORE_BANNER"],
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
    console.log("[Seeder] Synced AdProduct pricing packages in MongoDB.");

    // Clean up any previously seeded mock product listings and their campaigns
    const seededTitles = [
      "2022 Hyundai Creta SX (O) Turbo DCT",
      "2021 Mahindra Thar LX Hard Top 4x4 Petrol",
      "2023 Tata Nexon EV Max Lux Teal Blue",
      "2020 Maruti Suzuki Swift ZXi+ Dual Tone",
      "Royal Enfield Meteor 350 Supernova Custom",
      "Yamaha YZF R15 V4 Racing Blue",
      "KTM Duke 390 ABS (2022) Orange Edition",
      "Honda Activa 6G Premium Edition Grey",
      "Apple iPhone 15 Pro Max Natural Titanium 256GB",
      "MacBook Pro 14 M3 Pro Space Black (18GB/512GB)",
      "Sony Bravia 55 inch 4K Ultra HD OLED TV",
      "Sony PlayStation 5 Disc Edition + 2 DualSense Controllers",
      "Luxury 3BHK Gated Community Apartment in Gachibowli",
      "4BHK Independent Ultra-Luxury Villa in Kokapet",
      "Commercial Office Space 2500 Sq.Ft in Hitec City",
      "Residential Open Plot 200 Sq.Yds near ORR Exit",
      "Solid Sheesham Wood 6-Seater Dining Table Set",
      "L-Shape 6-Seater Modern Fabric Sectional Sofa Grey",
      "King Size Hydraulic Storage Bed with Ortho Mattress",
      "Ergonomic High Back Mesh Office Chair with Lumbar Support",
      "LG 1.5 Ton 5 Star AI Dual Inverter Split AC",
      "Samsung 415L Frost Free Double Door Digital Inverter Refrigerator",
      "IFB 8 Kg 5 Star Fully Automatic Front Load Washing Machine",
      "Dyson V11 Absolute Cordless Vacuum Cleaner",
      "Bridal Designer Embroidered Lehenga Choli Set",
      "Men Pure Silk Sherwani with Stole & Mojari",
      "Rolex Submariner Date 41mm Stainless Steel Oyster",
      "Nike Air Jordan 1 Retro High OG Chicago (Size 9)",
      "Professional Bridal & Party Makeup Services by Studio",
      "Full Home Deep Cleaning & Sanitization Services",
      "Experienced AC Repair, Gas Refilling & Servicing",
      "Professional Packers and Movers (Local & Intercity)",
      "Fender Player Stratocaster Electric Guitar Sunburst",
      "Yamaha PSR-E473 61-Key Portable Keyboard",
      "Bowflex SelectTech 552 Adjustable Dumbbells Pair",
      "Decathlon Triban RC 100 Road Bike",
      "Complete UPSC Civil Services IAS Exam Study Books Set",
      "Complete NCERT Textbooks Set (Class 6 to 12)",
      "Medical Prep Complete Standard Reference Books Set",
      "Harry Potter Illustrated Hardcover Deluxe Box Set",
      "CNC Laser Cutting & Engraving Machine 1390",
      "Heavy Duty 300A Inverter MIG/ARC Welding Machine",
      "Industrial Commercial Spiral Dough Mixer 30 Liters",
      "3000KG Hydraulic Heavy Duty Manual Pallet Truck",
      "Purebred Golden Retriever Puppies (KCI Registered)",
      "Persian Kitten Triple Coat Semi-Punch Face",
      "Ultra-Clear Rimless Aquarium Fish Tank with Filter & LED",
      "Pedigree & Royal Canin Dog Food + Grooming Accessories"
    ];

    const oldSeeded = await Listing.find({ title: { $in: seededTitles } }).select("_id");
    if (oldSeeded.length > 0) {
      const ids = oldSeeded.map(s => s._id);
      await AdCampaign.deleteMany({ listingId: { $in: ids } });
      await Listing.deleteMany({ _id: { $in: ids } });
      console.log(`[Seeder] Cleaned up and deleted ${oldSeeded.length} old seeded products and their campaigns from MongoDB.`);
    }
  } catch (error) {
    console.error("[Seeder] Error seeding ad configuration:", error);
  }
}
