import { Blog } from "../../modules/blogs/models/Blog";

export const INITIAL_BLOGS = [
  {
    title: "How to Safely Buy Used Cars in Hyderabad: Inspection & RC Transfer Checklist",
    slug: "safely-buy-used-cars-hyderabad-rc-transfer-checklist",
    excerpt: "Essential steps every buyer must take before purchasing a pre-owned vehicle in Telangana, including RTO verification, accident inspections, and safe transactions.",
    content: `Buying a pre-owned car in Hyderabad can save you lakhs compared to showroom prices, but it requires careful diligence to avoid odometer tampering, undisclosed accident damage, and encumbrance issues.

### 1. Pre-Purchase Mechanical Inspection
Always insist on an inspection during daylight hours. Check the engine bay for signs of oil seepage, inspect panel gaps for past collision repairs, and test drive the vehicle across uneven road conditions (such as Miyapur or Uppal junctions) to listen for suspension thuds.

### 2. Verify Telangana RTO & e-Challan Records
Never rely solely on photocopied documentation:
- Check pending traffic penalties through the **Telangana Police e-Challan portal**.
- Verify hypothecation status: If the car was financed, ensure the seller provides an official Form 35 and NOC from the financier.
- Match engine and chassis numbers with the RC smart card.

### 3. Transparent Financial Settlements
Avoid paying large cash advances before verifying identity. Always use secure escrow or direct bank transfers after both parties sign Form 29 and Form 30 for transfer of ownership.`,
    coverImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200",
    category: "Buying Guides",
    tags: ["cars", "used-cars", "hyderabad", "rto-verification", "safety"],
    author: {
      name: "Rajesh Varma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      role: "Senior Automotive Specialist",
      bio: "12+ years experience in pre-owned vehicle valuations and automotive fleet inspections across South India."
    },
    readTime: "4 min read",
    status: "PUBLISHED",
    isFeatured: true,
    viewsCount: 428,
    likesCount: 57,
    seo: {
      metaTitle: "Safely Buy Used Cars in Hyderabad — Complete Checklist",
      metaDescription: "Step-by-step checklist to inspect second-hand cars, verify RC, clear e-challans and transfer ownership smoothly in Hyderabad.",
      keywords: ["used cars hyderabad", "second hand car checklist", "rc transfer telangana", "buy car safely"]
    },
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Top 7 Tips to Sell Your Smartphone for the Best Price on Omeetso",
    slug: "top-7-tips-sell-smartphone-best-price-omeetso",
    excerpt: "Maximize your resale value! Learn how to clean your device, capture high-converting photos, and write descriptions that attract serious local buyers.",
    content: `Whether you are upgrading to the latest iPhone or switching to Android, selling your old smartphone directly to local buyers on Omeetso gets you up to 30% more cash than retail exchange trade-ins.

### 1. Thorough Cosmetic Cleaning & Original Box
A clean device signals good maintenance. Wipe down the phone with isopropyl alcohol, remove grimy tempered glass, and place the phone neatly in its original retail box with genuine cables and warranty bills.

### 2. High-Resolution Photos under Natural Light
Listings with 4+ clear photos sell 3x faster:
- Front screen with display switched ON (showing clean pixels).
- Back glass and camera lens cluster.
- All 4 bezels/corners to prove zero dent marks.
- Battery Health Settings screenshot (for iPhones).

### 3. Clear Specification Breakdown
Specify exact storage (e.g. 128GB vs 256GB), RAM, battery health percentage, and whether the original GST invoice is available. Transparency reduces endless repetitive buyer chats.

### 4. Fair & Realistic Pricing
Check active listings in your neighborhood (e.g. Madhapur, Kondapur, Kukatpally) and price competitively to generate quick inquiries.`,
    coverImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200",
    category: "Selling Tips",
    tags: ["smartphones", "selling-tips", "electronics", "gadgets", "resale"],
    author: {
      name: "Sneha Reddy",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      role: "Consumer Tech Editor",
      bio: "Tech enthusiast reviewing smartphones, consumer electronics, and smart devices."
    },
    readTime: "3 min read",
    status: "PUBLISHED",
    isFeatured: true,
    viewsCount: 312,
    likesCount: 41,
    seo: {
      metaTitle: "Sell Your Old Phone for Top Cash on Omeetso",
      metaDescription: "Simple steps to clean, photograph, price, and sell your used iPhone or Android smartphone quickly on Omeetso.",
      keywords: ["sell used phone", "mobile resale tips", "iphone sale hyderabad", "omeetso sell phone"]
    },
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Recognizing Online Scams: 5 Safety Rules Every Marketplace Buyer Must Follow",
    slug: "recognizing-online-scams-5-safety-rules-marketplace-buyers",
    excerpt: "Protect your hard-earned money. Discover the most common QR code and fake advance payment traps and how Omeetso protects you.",
    content: `Online classifieds connect honest neighbors every day, but staying vigilant against fraudsters is essential. Here are 5 unbreakable safety rules:

### 1. Never Scan a QR Code to 'Receive' Money
This is the most common UPI scam. Entering your UPI PIN or scanning a QR code is **ONLY for sending money**, never for receiving funds. If a buyer claims "scan this to get your advance", disconnect immediately!

### 2. Meet in Public, Well-Lit Locations
Prefer public meetup spots such as busy metro stations, shopping malls, or reputable neighborhood cafes. Bring a friend along when inspecting high-value items like laptops or motorbikes.

### 3. Verify Before You Pay
Never send token deposits or courier booking fees for an item you have not inspected in person. Genuine sellers are always willing to arrange a local meeting.

### 4. Look for Verified Seller Badges
On Omeetso, prioritized trust badges indicate mobile-verified accounts and verified store registrations. Give preference to sellers with proven marketplace reputations.`,
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200",
    category: "Safety & Scams",
    tags: ["safety", "scams", "fraud-prevention", "buyer-protection", "upi-safety"],
    author: {
      name: "Vikram Malhotra",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      role: "Trust & Safety Lead",
      bio: "Leading consumer cyber safety protocols and marketplace fraud prevention."
    },
    readTime: "4 min read",
    status: "PUBLISHED",
    isFeatured: false,
    viewsCount: 589,
    likesCount: 88,
    seo: {
      metaTitle: "How to Avoid Online Classifieds Scams — Omeetso Safety Guide",
      metaDescription: "Learn how to spot QR code traps, fake advance schemes, and stay completely safe buying and selling locally.",
      keywords: ["online scams", "upi qr code fraud", "marketplace safety", "safe local transactions"]
    },
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Renting vs Buying Flats in Uppal & Gachibowli: 2026 Real Estate Guide",
    slug: "renting-vs-buying-flats-uppal-gachibowli-2026-guide",
    excerpt: "An in-depth analysis of rental yields, capital appreciation, and infrastructure developments across Hyderabad's Eastern and Western corridors.",
    content: `Hyderabad's residential landscape has expanded dramatically. While Gachibowli and the Financial District remain the heartbeat of the IT workforce, Uppal and Nagole offer unbeatable affordability and connectivity via the Metro Red & Blue line links.

### Gachibowli: High Rental Yields & IT Proximity
- **Average 2 BHK Rent**: ₹28,000 – ₹42,000 / month depending on gated community amenities.
- **Capital Value**: ₹8,500 – ₹13,000 per sq ft.
- **Ideal For**: Working IT professionals who value a 15-minute commute to Hitec City and Kokapet.

### Uppal: Affordable Modern Living & Growth Potential
- **Average 2 BHK Rent**: ₹14,000 – ₹22,000 / month.
- **Capital Value**: ₹5,200 – ₹7,800 per sq ft.
- **Ideal For**: Families seeking spacious 3 BHK homes with lower EMI commitments, close to Uppal Stadium, Warangal Highway connectivity, and the Hyderabad Metro.

### Final Recommendation
If high rental flexibility and career mobility are your priorities, renting in Gachibowli is ideal. If long-term capital stability and comfortable family space matter, purchasing in Uppal is one of the highest value plays in the twin cities.`,
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
    category: "Market Insights",
    tags: ["real-estate", "hyderabad", "gachibowli", "uppal", "rent-vs-buy"],
    author: {
      name: "Kavitha Sharma",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      role: "Real Estate Analyst",
      bio: "Analyzing residential and commercial property markets across Telangana and Andhra Pradesh."
    },
    readTime: "5 min read",
    status: "PUBLISHED",
    isFeatured: false,
    viewsCount: 276,
    likesCount: 39,
    seo: {
      metaTitle: "Renting vs Buying Flats in Hyderabad 2026 — Real Estate Guide",
      metaDescription: "Compare rental costs, property values, and lifestyle factors between Uppal and Gachibowli in Hyderabad.",
      keywords: ["flats in hyderabad", "rent in gachibowli", "buy flat in uppal", "hyderabad real estate"]
    },
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  }
];

export async function seedBlogs(): Promise<void> {
  try {
    const count = await Blog.countDocuments({});
    console.log(`[BlogSeeder] Verified ${count} blog articles in MongoDB (auto-seeding disabled).`);
  } catch (err) {
    console.error("[BlogSeeder] Error checking blogs:", err);
  }
}
