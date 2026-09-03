import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../connect";
import { User } from "../../modules/users/models/User";
import { Store } from "../../modules/stores/models/Store";
import { Listing } from "../../modules/listings/models/Listing";
import { Category } from "../../modules/categories/models/Category";
import { SEED_CATEGORIES } from "./categorySeeder";
import { ListingStatus, StoreStatus, UserStatus } from "../../contracts";

export async function seedMultiLocationMarket(): Promise<{
  sellersCount: number;
  storesCount: number;
  listingsCount: number;
  categoriesCount: number;
}> {
  console.log("[Market Seeder] Starting multi-location market seeding...");

  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }

  // 1. Seed Categories if empty
  const existingCatCount = await Category.countDocuments();
  if (existingCatCount === 0) {
    console.log("[Market Seeder] Seeding master categories...");
    for (const item of SEED_CATEGORIES) {
      await Category.create({
        categoryId: item.categoryId,
        name: item.name,
        row: item.row as 1 | 2 | 3,
        iconName: item.iconName,
        subcategoriesLabel: item.subcategoriesLabel,
        subcategories: item.subcategories,
        filters: item.filters,
        listingCardFields: item.listingCardFields,
        detailsSpecFields: item.detailsSpecFields,
        sellingFormFields: item.sellingFormFields,
        verificationBadges: item.verificationBadges,
        compareAttributes: (item as any).compareAttributes || [],
        sortOptions: item.sortOptions,
        isActive: true
      });
    }
  }
  const totalCategories = await Category.countDocuments();

  // 2. Create 8 Distinct Sellers across 3 Locations (Hyderabad, Bangalore, Mumbai)
  const sellersData = [
    {
      phone: "+919849012345",
      email: "aditya.varma@gmail.com",
      name: "Aditya Varma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      city: "Hyderabad",
      area: "Madhapur",
      pincode: "500081",
      accountType: "individual" as const,
      bio: "Top rated local gadget and car enthusiast. Instant response guaranteed."
    },
    {
      phone: "+919820012345",
      email: "sneha.kulkarni@gmail.com",
      name: "Sneha Kulkarni",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
      city: "Mumbai",
      area: "Bandra West",
      pincode: "400050",
      accountType: "individual" as const,
      bio: "Fashion stylist & interior curator. Selling authenticated luxury items."
    },
    {
      phone: "+919880012345",
      email: "rohan.nambiar@gmail.com",
      name: "Rohan Nambiar",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      city: "Bangalore",
      area: "Koramangala",
      pincode: "560034",
      accountType: "business" as const,
      bio: "Tech entrepreneur and certified furniture dealer."
    },
    {
      phone: "+919440012345",
      email: "kavita.reddy@gmail.com",
      name: "Kavita Reddy",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
      city: "Hyderabad",
      area: "Gachibowli",
      pincode: "500032",
      accountType: "business" as const,
      bio: "Real estate consultant and property manager in Cyberabad."
    },
    {
      phone: "+919810012345",
      email: "vikram.malhotra@gmail.com",
      name: "Vikram Malhotra",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      city: "Mumbai",
      area: "Andheri West",
      pincode: "400053",
      accountType: "individual" as const,
      bio: "Audio engineer & smartphone collector."
    },
    {
      phone: "+919845012345",
      email: "ananya.hegde@gmail.com",
      name: "Ananya Hegde",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      city: "Bangalore",
      area: "Indiranagar",
      pincode: "560038",
      accountType: "individual" as const,
      bio: "Home decor designer and tech reviewer."
    },
    {
      phone: "+919341012345",
      email: "rajesh.agarwal@gmail.com",
      name: "Rajesh Agarwal",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200",
      city: "Hyderabad",
      area: "Kukatpally",
      pincode: "500072",
      accountType: "business" as const,
      bio: "Authorized appliance & heavy electronics distributor."
    },
    {
      phone: "+919769012345",
      email: "pooja.deshmukh@gmail.com",
      name: "Pooja Deshmukh",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
      city: "Mumbai",
      area: "Powai",
      pincode: "400076",
      accountType: "business" as const,
      bio: "Commercial machinery & industrial tools supplier."
    }
  ];

  const sellerDocs: any[] = [];
  for (const s of sellersData) {
    let user = await User.findOne({ phone: s.phone });
    if (!user) {
      user = await User.create({
        phone: s.phone,
        email: s.email,
        emailVerified: true,
        accountType: s.accountType,
        status: UserStatus.ACTIVE,
        profile: {
          name: s.name,
          avatar: s.avatar,
          bio: s.bio,
          city: s.city,
          pincode: s.pincode,
          area: s.area,
          language: "en",
          memberSince: new Date(Date.now() - 180 * 86400000)
        },
        verificationSummary: {
          mobileVerified: true,
          emailVerified: true,
          identityVerified: true,
          businessVerified: s.accountType === "business"
        }
      });
    }
    sellerDocs.push(user);
  }
  console.log(`[Market Seeder] Seeded ${sellerDocs.length} Sellers across Hyderabad, Bangalore & Mumbai.`);

  // 3. Create 3 Verified Stores with Quick Sale Enabled
  const storesData = [
    {
      ownerId: sellerDocs[0]._id, // Aditya (Hyderabad)
      name: "Apex Digital & Mobile Store",
      slug: "apex-digital-mobiles-hyderabad",
      tagline: "Certified Flagship Gadgets & Apple Authorized Deals",
      description: "Premier local electronics store in Madhapur with genuine warranty, express 2-hour delivery, and trade-in exchange options.",
      businessType: "Electronics & Mobile Store",
      logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200",
      cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000",
      primaryCategory: "mobiles",
      supportingCategories: ["electronics", "appliances"],
      pincode: "500081",
      area: "Madhapur",
      city: "Hyderabad",
      address: "Plot 42, Silicon Valley Layout, Madhapur, Hyderabad",
      businessMobile: "+919849012345",
      email: "store.apex@omeetso.com",
      status: StoreStatus.APPROVED,
      rating: 4.9,
      reviewCount: 42,
      followersCount: 156
    },
    {
      ownerId: sellerDocs[2]._id, // Rohan (Bangalore)
      name: "Greenwood Living & Furniture Studio",
      slug: "greenwood-living-furniture-bangalore",
      tagline: "Solid Teak & Sheesham Handcrafted Home Decor",
      description: "Direct factory pricing on handcrafted living room, bedroom, and executive office furniture with lifetime termite warranty and doorstep assembly.",
      businessType: "Furniture Manufacturer & Showroom",
      logo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200",
      cover: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000",
      primaryCategory: "furniture",
      supportingCategories: ["appliances", "commercial"],
      pincode: "560034",
      area: "Koramangala",
      city: "Bangalore",
      address: "100 Feet Road, 4th Block, Koramangala, Bangalore",
      businessMobile: "+919880012345",
      email: "store.greenwood@omeetso.com",
      status: StoreStatus.APPROVED,
      rating: 4.8,
      reviewCount: 38,
      followersCount: 124
    },
    {
      ownerId: sellerDocs[1]._id, // Sneha (Mumbai)
      name: "Velocity Motors & Pre-Owned Wheels",
      slug: "velocity-motors-wheels-mumbai",
      tagline: "Certified Inspected Cars & Superbikes with 1-Year Engine Warranty",
      description: "Mumbai's trusted pre-owned vehicle showroom in Bandra. Every car and bike undergoes 180-point inspection with zero accident history.",
      businessType: "Automobile Dealership",
      logo: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=200",
      cover: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000",
      primaryCategory: "cars",
      supportingCategories: ["bikes", "commercial"],
      pincode: "400050",
      area: "Bandra West",
      city: "Mumbai",
      address: "Hill Road, Near Bandra Station, Bandra West, Mumbai",
      businessMobile: "+919820012345",
      email: "store.velocity@omeetso.com",
      status: StoreStatus.APPROVED,
      rating: 4.9,
      reviewCount: 65,
      followersCount: 289
    }
  ];

  const storeDocs: any[] = [];
  for (const st of storesData) {
    let store = await Store.findOne({ slug: st.slug });
    if (!store) {
      store = await Store.create({
        ...st,
        location: { type: "Point", coordinates: [78.3871, 17.4486] },
        delivery: {
          pickup: true,
          localDelivery: true,
          buyerPickup: true,
          radiusKm: 25,
          chargeInPaise: 0,
          freeAboveInPaise: 100000
        },
        workingHours: [
          { day: "Mon", closed: false, open: "10:00", close: "21:00" },
          { day: "Tue", closed: false, open: "10:00", close: "21:00" },
          { day: "Wed", closed: false, open: "10:00", close: "21:00" },
          { day: "Thu", closed: false, open: "10:00", close: "21:00" },
          { day: "Fri", closed: false, open: "10:00", close: "21:00" },
          { day: "Sat", closed: false, open: "10:00", close: "21:00" },
          { day: "Sun", closed: false, open: "11:00", close: "19:00" }
        ],
        is24x7: false
      });
    }
    storeDocs.push(store);
  }
  console.log(`[Market Seeder] Seeded ${storeDocs.length} Verified Stores with Quick Sale in Hyderabad, Bangalore & Mumbai.`);

  // 4. Seed 2 Listings per Category (24 total listings across 3 locations)
  const listingsData = [
    // --- 1. CARS ---
    {
      seller: sellerDocs[0], // Aditya (Hyderabad)
      storeId: storeDocs[2]._id,
      categoryId: "cars",
      subcategoryId: "SUV",
      title: "2022 Hyundai Creta SX (O) 1.4 Turbo DCT",
      description: "Top-end variant with panoramic sunroof, 10.25 inch touchscreen, Bose sound system, ventilated seats, single owner with full service records at authorized showroom.",
      priceInPaise: 142500000, // ₹14,25,000
      condition: "excellent",
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"
      ],
      city: "Hyderabad",
      area: "Madhapur",
      pincode: "500081",
      specs: { "Year": "2022", "Fuel": "Petrol", "Transmission": "Automatic (DCT)", "Kms Driven": "18,500", "Ownership": "1st Owner" }
    },
    {
      seller: sellerDocs[2], // Rohan (Bangalore)
      storeId: storeDocs[2]._id,
      categoryId: "cars",
      subcategoryId: "SUV",
      title: "2021 Mahindra Thar LX 4x4 Hard Top Petrol",
      description: "Hard top convertible 4x4 automatic in Rocky Beige. Upgraded off-road bumpers, BF Goodrich all-terrain tires, zero accidental history, insured till 2027.",
      priceInPaise: 138000000, // ₹13,80,000
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800"
      ],
      city: "Bangalore",
      area: "Koramangala",
      pincode: "560034",
      specs: { "Year": "2021", "Fuel": "Petrol", "Transmission": "Automatic", "Kms Driven": "22,000", "Ownership": "1st Owner" }
    },

    // --- 2. BIKES ---
    {
      seller: sellerDocs[1], // Sneha (Mumbai)
      categoryId: "bikes",
      subcategoryId: "Cruiser",
      title: "Royal Enfield Meteor 350 Supernova Custom",
      description: "Custom blue dual-tone with tripper navigation pod, touring windshield, backrest, alloy wheels with tubeless tires. Recently serviced with new battery.",
      priceInPaise: 18500000, // ₹1,85,000
      condition: "excellent",
      images: [
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800",
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800"
      ],
      city: "Mumbai",
      area: "Bandra West",
      pincode: "400050",
      specs: { "Year": "2022", "Kms Driven": "8,200", "Engine": "350cc", "Ownership": "1st Owner" }
    },
    {
      seller: sellerDocs[3], // Kavita (Hyderabad)
      categoryId: "bikes",
      subcategoryId: "Sports",
      title: "Yamaha YZF R15 V4 Dual ABS Racing Blue",
      description: "Track-inspired design with quickshifter, traction control, Bluetooth Y-Connect cluster. Always parked in covered garage, excellent mileage 45 kmpl.",
      priceInPaise: 14500000, // ₹1,45,000
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800",
        "https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=800"
      ],
      city: "Hyderabad",
      area: "Gachibowli",
      pincode: "500032",
      specs: { "Year": "2023", "Kms Driven": "6,400", "Engine": "155cc", "Ownership": "1st Owner" }
    },

    // --- 3. MOBILES ---
    {
      seller: sellerDocs[0], // Aditya (Hyderabad)
      storeId: storeDocs[0]._id,
      categoryId: "mobiles",
      subcategoryId: "Smartphones",
      title: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
      description: "Indian billing unit with Apple Care+ warranty valid for 8 months. 98% battery health, screen protector applied on day 1. Bill, box & original cable included.",
      priceInPaise: 9850000, // ₹98,500
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800"
      ],
      city: "Hyderabad",
      area: "Madhapur",
      pincode: "500081",
      specs: { "Brand": "Apple", "Model": "iPhone 15 Pro Max", "Storage": "256GB", "Color": "Natural Titanium", "Warranty": "Active AppleCare" }
    },
    {
      seller: sellerDocs[4], // Vikram (Mumbai)
      storeId: storeDocs[0]._id,
      categoryId: "mobiles",
      subcategoryId: "Smartphones",
      title: "Samsung Galaxy S24 Ultra 512GB Titanium Black",
      description: "Flagship Galaxy AI phone with Snapdragon 8 Gen 3, integrated S-Pen, 200MP camera with 100x zoom. No scratches or dents. Original box with 45W charger.",
      priceInPaise: 9400000, // ₹94,000
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
        "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800"
      ],
      city: "Mumbai",
      area: "Andheri West",
      pincode: "400053",
      specs: { "Brand": "Samsung", "Model": "Galaxy S24 Ultra", "Storage": "512GB", "RAM": "12GB", "Color": "Titanium Black" }
    },

    // --- 4. ELECTRONICS ---
    {
      seller: sellerDocs[6], // Rajesh (Hyderabad)
      storeId: storeDocs[0]._id,
      categoryId: "electronics",
      subcategoryId: "Gaming Consoles",
      title: "Sony PlayStation 5 Disc Edition + 2 Controllers",
      description: "Indian edition PS5 console with 2 DualSense wireless controllers, charging station, and two game discs (Spider-Man 2 and God of War Ragnarok).",
      priceInPaise: 3999900, // ₹39,999
      condition: "excellent",
      images: [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800"
      ],
      city: "Hyderabad",
      area: "Kukatpally",
      pincode: "500072",
      specs: { "Type": "Disc Edition", "Storage": "825GB SSD", "Controllers": "2 Included", "Condition": "Flawless" }
    },
    {
      seller: sellerDocs[2], // Rohan (Bangalore)
      categoryId: "electronics",
      subcategoryId: "Laptops",
      title: "Apple MacBook Pro 14 M3 Pro (18GB / 512GB) Space Black",
      description: "Space Black M3 Pro with 11-core CPU, 14-core GPU, Liquid Retina XDR display. Battery cycle count only 32. Original MagSafe 3 charger and box.",
      priceInPaise: 14800000, // ₹1,48,000
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"
      ],
      city: "Bangalore",
      area: "Koramangala",
      pincode: "560034",
      specs: { "Chip": "M3 Pro", "RAM": "18GB Unified", "SSD": "512GB", "Screen": "14.2 inch XDR", "Color": "Space Black" }
    },

    // --- 5. FURNITURE ---
    {
      seller: sellerDocs[7], // Pooja (Mumbai)
      storeId: storeDocs[1]._id,
      categoryId: "furniture",
      subcategoryId: "Dining Sets",
      title: "Solid Sheesham Wood 6-Seater Dining Table Set",
      description: "Handcrafted pure rosewood dining table with 6 cushioned ergonomic high-back chairs. Warm honey finish with anti-termite treatment.",
      priceInPaise: 2850000, // ₹28,500
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800",
        "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800"
      ],
      city: "Mumbai",
      area: "Powai",
      pincode: "400076",
      specs: { "Material": "Sheesham Wood", "Seating": "6 Seater", "Finish": "Honey Oak", "Dimensions": "6ft x 3ft" }
    },
    {
      seller: sellerDocs[2], // Rohan (Bangalore)
      storeId: storeDocs[1]._id,
      categoryId: "furniture",
      subcategoryId: "Sofas",
      title: "L-Shape 6-Seater Modern Fabric Sectional Sofa Grey",
      description: "Premium velvet fabric sectional sofa with adjustable headrests, solid wood internal frame, and pocket spring high-density foam cushions.",
      priceInPaise: 3200000, // ₹32,000
      condition: "excellent",
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800"
      ],
      city: "Bangalore",
      area: "Koramangala",
      pincode: "560034",
      specs: { "Configuration": "L-Shape Right Hand", "Seating": "6 Persons", "Fabric": "Stain Resistant Velvet", "Color": "Slate Grey" }
    },

    // --- 6. PROPERTIES ---
    {
      seller: sellerDocs[3], // Kavita (Hyderabad)
      categoryId: "properties",
      subcategoryId: "Apartments",
      title: "Luxury 3BHK Gated Community Apartment (2150 Sq.Ft)",
      description: "East facing 3BHK in high-rise tower at Gachibowli Financial District. 100% Vastu compliant with 2 covered car parkings, clubhouse, pool and gym.",
      priceInPaise: 1450000000, // ₹1,45,00,000
      condition: "new",
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
      ],
      city: "Hyderabad",
      area: "Gachibowli",
      pincode: "500032",
      specs: { "Bedrooms": "3 BHK", "Super Area": "2150 Sq.Ft", "Facing": "East", "Furnishing": "Semi-Furnished", "Floor": "14th of 28" }
    },
    {
      seller: sellerDocs[5], // Ananya (Bangalore)
      categoryId: "properties",
      subcategoryId: "Apartments",
      title: "2BHK Modern High-Rise Apartment in Indiranagar",
      description: "Prime location apartment with balcony overlooking trees. Modular kitchen, imported fittings, 24x7 security and power backup. Clear titles ready to register.",
      priceInPaise: 920000000, // ₹92,00,000
      condition: "excellent",
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
      ],
      city: "Bangalore",
      area: "Indiranagar",
      pincode: "560038",
      specs: { "Bedrooms": "2 BHK", "Super Area": "1280 Sq.Ft", "Facing": "North", "Furnishing": "Fully Furnished" }
    },

    // --- 7. FASHION ---
    {
      seller: sellerDocs[1], // Sneha (Mumbai)
      categoryId: "fashion",
      subcategoryId: "Watches",
      title: "Rolex Submariner Date 41mm Stainless Steel Oyster",
      description: "Certified luxury watch with black cerachrom bezel, black dial, automatic movement. Complete with green box, guarantee card, manual & chronometer tag.",
      priceInPaise: 78500000, // ₹7,85,000
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800"
      ],
      city: "Mumbai",
      area: "Bandra West",
      pincode: "400050",
      specs: { "Brand": "Rolex", "Model": "Submariner Date", "Case": "41mm Oystersteel", "Water Resistance": "300m" }
    },
    {
      seller: sellerDocs[0], // Aditya (Hyderabad)
      categoryId: "fashion",
      subcategoryId: "Ethnic Wear",
      title: "Designer Bridal Heavy Embroidered Silk Lehenga",
      description: "Custom royal crimson bridal lehenga set crafted with zardozi, sequins, and pearl hand embroidery. Worn once for 3 hours, dry cleaned and preserved.",
      priceInPaise: 3500000, // ₹35,000
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"
      ],
      city: "Hyderabad",
      area: "Madhapur",
      pincode: "500081",
      specs: { "Fabric": "Raw Silk", "Work": "Zardozi & Pearl", "Size": "Adjustable (M/L)", "Color": "Royal Crimson Red" }
    },

    // --- 8. APPLIANCES ---
    {
      seller: sellerDocs[5], // Ananya (Bangalore)
      categoryId: "appliances",
      subcategoryId: "Air Conditioners",
      title: "LG 1.5 Ton 5-Star AI Dual Inverter Split AC",
      description: "Super efficient 5-star AC with copper condenser, anti-virus filter, WiFi ThinQ smart control. 10-year compressor warranty included.",
      priceInPaise: 2950000, // ₹29,500
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
        "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800"
      ],
      city: "Bangalore",
      area: "Indiranagar",
      pincode: "560038",
      specs: { "Brand": "LG", "Capacity": "1.5 Ton", "Energy Rating": "5 Star", "Condenser": "100% Copper" }
    },
    {
      seller: sellerDocs[4], // Vikram (Mumbai)
      categoryId: "appliances",
      subcategoryId: "Refrigerators",
      title: "Samsung 415L Double Door Convertible Refrigerator",
      description: "Frost-free double door with 5-in-1 convertible modes, twin cooling plus, digital inverter compressor with stabilizer-free operation.",
      priceInPaise: 2700000, // ₹27,000
      condition: "excellent",
      images: [
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800",
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800"
      ],
      city: "Mumbai",
      area: "Andheri West",
      pincode: "400053",
      specs: { "Brand": "Samsung", "Capacity": "415 Litres", "Rating": "3 Star Inverter", "Door Style": "Double Door" }
    },

    // --- 9. JOBS ---
    {
      seller: sellerDocs[2], // Rohan (Bangalore)
      categoryId: "jobs",
      subcategoryId: "IT & Software",
      title: "Senior Full-Stack Developer (React 19 & Node.js)",
      description: "Hiring experienced full-stack engineers for high-growth tech startup. Hybrid role in Koramangala. Competitive stock options and health insurance.",
      priceInPaise: 180000000, // ₹18,00,000 /yr
      condition: "new",
      images: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800"
      ],
      city: "Bangalore",
      area: "Koramangala",
      pincode: "560034",
      specs: { "Role": "Full Stack Lead", "Experience": "4-7 Years", "Mode": "Hybrid (3 days office)", "Location": "Koramangala, Bangalore" }
    },
    {
      seller: sellerDocs[3], // Kavita (Hyderabad)
      categoryId: "jobs",
      subcategoryId: "Sales & Marketing",
      title: "Business Development Manager - Real Estate Sales",
      description: "Seeking high-energy sales professionals for luxury residential projects in Hitec City & Kokapet. Attractive incentives over base salary.",
      priceInPaise: 85000000, // ₹8,50,000 /yr
      condition: "new",
      images: [
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800"
      ],
      city: "Hyderabad",
      area: "Gachibowli",
      pincode: "500032",
      specs: { "Role": "BDM Luxury Homes", "Experience": "2-5 Years", "Incentives": "Up to ₹50,000/deal", "Location": "Gachibowli, Hyderabad" }
    },

    // --- 10. SERVICES ---
    {
      seller: sellerDocs[0], // Aditya (Hyderabad)
      categoryId: "services",
      subcategoryId: "Cleaning",
      title: "Full Home Deep Cleaning & Sanitization Service",
      description: "Professional multi-member crew with industrial steam machines, scrubbing tools, and eco-friendly chemicals for complete 2BHK/3BHK sanitization.",
      priceInPaise: 349900, // ₹3,499
      condition: "new",
      images: [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800"
      ],
      city: "Hyderabad",
      area: "Madhapur",
      pincode: "500081",
      specs: { "Duration": "4-6 Hours", "Crew Size": "3-4 Professionals", "Guarantee": "100% Satisfaction", "Equipments": "Industrial Steam" }
    },
    {
      seller: sellerDocs[2], // Rohan (Bangalore)
      categoryId: "services",
      subcategoryId: "Packers & Movers",
      title: "Professional Packers and Movers (Local & Interstate)",
      description: "Damage-free packing with 5-layer bubble wrap, cartons, and dedicated GPS-tracked container vehicles with full insurance coverage.",
      priceInPaise: 499900, // ₹4,999
      condition: "new",
      images: [
        "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"
      ],
      city: "Bangalore",
      area: "Koramangala",
      pincode: "560034",
      specs: { "Service": "Home Relocation", "Packing": "5-Layer Protection", "Insurance": "Transit Included", "City": "Bangalore" }
    },

    // --- 11. PETS ---
    {
      seller: sellerDocs[1], // Sneha (Mumbai)
      categoryId: "pets",
      subcategoryId: "Dogs",
      title: "Purebred Golden Retriever Puppies (KCI Registered)",
      description: "Healthy champion bloodline golden retriever puppies. De-wormed, first vaccination complete, microchipped with official KCI pedigree certificates.",
      priceInPaise: 2400000, // ₹24,000
      condition: "new",
      images: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800"
      ],
      city: "Mumbai",
      area: "Bandra West",
      pincode: "400050",
      specs: { "Breed": "Golden Retriever", "Age": "60 Days", "KCI Certified": "Yes", "Vaccinated": "Yes (Card Included)" }
    },
    {
      seller: sellerDocs[6], // Rajesh (Hyderabad)
      categoryId: "pets",
      subcategoryId: "Cats",
      title: "Persian Kitten Triple Coat Semi-Punch Face",
      description: "Playful and healthy pure white Persian kitten with blue eyes. Litter trained, eating Royal Canin kitten food, vaccinated with health check certificate.",
      priceInPaise: 1800000, // ₹18,000
      condition: "new",
      images: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800"
      ],
      city: "Hyderabad",
      area: "Kukatpally",
      pincode: "500072",
      specs: { "Breed": "Persian", "Coat": "Triple Coat White", "Age": "55 Days", "Litter Trained": "Yes" }
    },

    // --- 12. COMMERCIAL & INDUSTRIAL ---
    {
      seller: sellerDocs[7], // Pooja (Mumbai)
      categoryId: "commercial",
      subcategoryId: "Industrial Machinery",
      title: "CNC Laser Cutting & Engraving Machine 1390 (100W)",
      description: "High precision CO2 laser cutter with Ruida DSP controller, CW-5200 industrial chiller, honey-comb bed, motorized up-down table for acrylic and wood.",
      priceInPaise: 38500000, // ₹3,85,000
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
        "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800"
      ],
      city: "Mumbai",
      area: "Powai",
      pincode: "400076",
      specs: { "Laser Power": "100W Reci Tube", "Working Area": "1300 x 900 mm", "Controller": "Ruida 6442S", "Chiller": "CW5200 Included" }
    },
    {
      seller: sellerDocs[2], // Rohan (Bangalore)
      categoryId: "commercial",
      subcategoryId: "Bakery Equipment",
      title: "Industrial Commercial Spiral Dough Mixer 30 Liters",
      description: "Heavy duty stainless steel bowl and spiral arm mixer with dual-speed motor and safety emergency switch. Perfect for bakeries, pizzerias and hotels.",
      priceInPaise: 6800000, // ₹68,000
      condition: "like_new",
      images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
        "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800"
      ],
      city: "Bangalore",
      area: "Koramangala",
      pincode: "560034",
      specs: { "Capacity": "30 Litres / 12.5 Kg Flour", "Motor": "2.2 kW Heavy Duty", "Material": "Food Grade SS 304" }
    }
  ];

  const createdListings: any[] = [];
  for (const item of listingsData) {
    let listing = await Listing.findOne({ title: item.title, sellerId: item.seller._id });
    if (!listing) {
      listing = await Listing.create({
      sellerId: item.seller._id,
      storeId: item.storeId,
      categoryId: item.categoryId,
      subcategoryId: item.subcategoryId,
      title: item.title,
      description: item.description,
      priceInPaise: item.priceInPaise,
      negotiable: true,
      free: false,
      condition: item.condition,
      images: item.images,
      coverIndex: 0,
      pincode: item.pincode,
      area: item.area,
      city: item.city,
      location: {
        type: "Point",
        coordinates: item.city === "Hyderabad" ? [78.3871, 17.4486] : item.city === "Bangalore" ? [77.6101, 12.9352] : [72.8258, 19.0596]
      },
      fulfilment: "pickup",
      specs: item.specs,
      contactPref: "call_and_chat",
      enableWhatsapp: true,
      whatsappPhone: item.seller.phone,
      rating: 4.9,
      reviewCount: 14,
      status: ListingStatus.APPROVED,
      publishedAt: new Date(Date.now() - Math.floor(Math.random() * 5 * 86400000)),
      analytics: {
        views: Math.floor(120 + Math.random() * 400),
        saves: Math.floor(15 + Math.random() * 60),
        chats: Math.floor(5 + Math.random() * 25)
      }
    });
    }
    createdListings.push(listing);
  }
  console.log(`[Market Seeder] Seeded ${createdListings.length} Listings (2 per category across 12 categories in Hyderabad, Bangalore & Mumbai).`);

  return {
    sellersCount: sellerDocs.length,
    storesCount: storeDocs.length,
    listingsCount: createdListings.length,
    categoriesCount: totalCategories
  };
}

// Run directly if invoked from command line
if (require.main === module) {
  seedMultiLocationMarket()
    .then(async (res) => {
      console.log(`[Market Seeder] Successfully finished:`, res);
      await disconnectDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Market Seeder] Fatal error:", err);
      process.exit(1);
    });
}
