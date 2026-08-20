import { connectDatabase, disconnectDatabase } from "../connect";
import { Listing } from "../../modules/listings/models/Listing";
import { AdCampaign } from "../../modules/revenue/models/AdCampaign";

async function cleanup() {
  await connectDatabase();

  const titles = [
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

  const listings = await Listing.find({ title: { $in: titles } });
  const listingIds = listings.map((l: any) => l._id);

  console.log(`Found ${listings.length} seeded product listings to delete.`);

  if (listingIds.length > 0) {
    const campaignResult = await AdCampaign.deleteMany({ listingId: { $in: listingIds } });
    console.log(`Deleted ${campaignResult.deletedCount} associated AdCampaigns.`);

    const listingResult = await Listing.deleteMany({ _id: { $in: listingIds } });
    console.log(`Deleted ${listingResult.deletedCount} seeded listings.`);
  }

  const remainingListings = await Listing.countDocuments();
  console.log(`Remaining listings count: ${remainingListings}`);

  await disconnectDatabase();
}

cleanup().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
