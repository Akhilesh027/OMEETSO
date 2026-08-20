import mongoose from "mongoose";
import { Listing } from "../../modules/listings/models/Listing";
import { User } from "../../modules/users/models/User";
import { ListingStatus } from "../../contracts";

export async function seedApprovedListings(): Promise<void> {
  try {
    let owner = await User.findOne({ role: "SELLER" });
    if (!owner) owner = await User.findOne({ role: "ADMIN" });
    if (!owner) owner = await User.findOne({});
    const sellerId = owner ? owner._id : new mongoose.Types.ObjectId();

    const sampleApprovedListings = [
      {
        title: "Mahindra Thar LX 4x4 Petrol Hardtop (2022) — Adilabad",
        description: "2022 Mahindra Thar LX Petrol Automatic 4x4 Hardtop. 18,000 KM driven, mint condition. Located in Adilabad.",
        priceInPaise: 135000000,
        negotiable: true,
        free: false,
        condition: "like_new",
        categoryId: "cars",
        subcategoryId: "used_cars",
        images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500"],
        coverIndex: 0,
        area: "Adilabad",
        city: "Adilabad",
        pincode: "504312",
        location: { type: "Point", coordinates: [78.532, 19.6641] },
        fulfilment: "pickup",
        contactPref: "call_and_chat",
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
        analytics: { views: 320, saves: 45, chats: 22 },
        sellerId,
      },
      {
        title: "Royal Enfield Classic 350 Stealth Black (2023) — Adilabad",
        description: "Single owner Royal Enfield Classic 350 in Adilabad 504312. 6,500 KM driven, original company service.",
        priceInPaise: 17500000,
        negotiable: true,
        free: false,
        condition: "like_new",
        categoryId: "bikes",
        subcategoryId: "motorcycles",
        images: ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500"],
        coverIndex: 0,
        area: "Adilabad",
        city: "Adilabad",
        pincode: "504312",
        location: { type: "Point", coordinates: [78.532, 19.6641] },
        fulfilment: "pickup",
        contactPref: "call_and_chat",
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
        analytics: { views: 280, saves: 34, chats: 18 },
        sellerId,
      },
      {
        title: "Apple iPhone 15 Pro Natural Titanium (128GB) — Adilabad",
        description: "iPhone 15 Pro Natural Titanium in Adilabad. 98% battery health, Apple warranty active, box available.",
        priceInPaise: 8900000,
        negotiable: true,
        free: false,
        condition: "like_new",
        categoryId: "electronics",
        subcategoryId: "mobiles",
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"],
        coverIndex: 0,
        area: "Adilabad",
        city: "Adilabad",
        pincode: "504312",
        location: { type: "Point", coordinates: [78.532, 19.6641] },
        fulfilment: "pickup",
        contactPref: "call_and_chat",
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
        analytics: { views: 490, saves: 65, chats: 40 },
        sellerId,
      },
      {
        title: "Sony 55-inch 4K Ultra HD Smart Google TV — Adilabad",
        description: "Sony Bravia 55-inch 4K Google TV in Adilabad 504312. Wall mount included, pristine display.",
        priceInPaise: 4800000,
        negotiable: true,
        free: false,
        condition: "excellent",
        categoryId: "electronics",
        subcategoryId: "appliances",
        images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500"],
        coverIndex: 0,
        area: "Adilabad",
        city: "Adilabad",
        pincode: "504312",
        location: { type: "Point", coordinates: [78.532, 19.6641] },
        fulfilment: "pickup",
        contactPref: "call_and_chat",
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
        analytics: { views: 230, saves: 29, chats: 16 },
        sellerId,
      },
      {
        title: "Hyundai i20 Asta 1.2 Petrol (2021) — Used Car",
        description: "2021 Hyundai i20 Asta 1.2 Petrol Manual. Single owner, 24,000 KM driven. Fully insured, mint condition used car.",
        priceInPaise: 64500000,
        negotiable: true,
        free: false,
        condition: "excellent",
        categoryId: "cars",
        subcategoryId: "used_cars",
        images: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500"],
        coverIndex: 0,
        area: "Madhapur",
        city: "Hyderabad",
        pincode: "500081",
        location: { type: "Point", coordinates: [78.3871, 17.4399] },
        fulfilment: "pickup",
        contactPref: "call_and_chat",
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
        analytics: { views: 184, saves: 24, chats: 12 },
        sellerId,
      },
      {
        title: "Honda City VX Petrol Manual (2019) — Sunroof Used Car",
        description: "2019 Honda City VX i-VTEC with sunroof. 38,000 KM driven, full company service record. Well maintained used car.",
        priceInPaise: 78500000,
        negotiable: true,
        free: false,
        condition: "like_new",
        categoryId: "cars",
        subcategoryId: "used_cars",
        images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500"],
        coverIndex: 0,
        area: "Gachibowli",
        city: "Hyderabad",
        pincode: "500032",
        location: { type: "Point", coordinates: [78.3489, 17.4401] },
        fulfilment: "pickup",
        contactPref: "call_and_chat",
        status: ListingStatus.APPROVED,
        publishedAt: new Date(),
        analytics: { views: 240, saves: 31, chats: 15 },
        sellerId,
      }
    ];

    let seededCount = 0;
    for (const item of sampleApprovedListings) {
      await Listing.updateOne(
        { title: item.title },
        { $set: { ...item, rating: 0, reviewCount: 0 } },
        { upsert: true }
      );
      seededCount++;
    }

    // Reset any legacy default 4.8 ratings on existing listings
    await Listing.updateMany({ rating: 4.8 }, { $set: { rating: 0, reviewCount: 0 } });

    console.log(`[ListingSeeder] Seeded/Ensured ${seededCount} approved DB listings in MongoDB.`);
  } catch (error) {
    console.error("[ListingSeeder] Error seeding approved listings:", error);
  }
}
