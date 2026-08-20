// Omeetso Smart AI Assistance, Brand & Model Mapping Utilities

export const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  mobiles: ["Apple", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Realme", "Google", "Nothing", "Motorola", "Oppo"],
  electronics: ["Sony", "LG", "Samsung", "Dell", "HP", "Lenovo", "Bose", "Canon", "Apple", "Asus"],
  cars: ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota", "Kia", "BMW", "Mercedes-Benz", "Volkswagen"],
  bikes: ["Royal Enfield", "Yamaha", "TVS", "Honda", "Bajaj", "KTM", "Hero", "Ather", "Java", "Suzuki"],
  furniture: ["IKEA", "Pepperfry", "WoodenStreet", "Godrej Interio", "Durian", "Urban Ladder", "RoyalOak"],
  fashion: ["Nike", "Adidas", "Zara", "H&M", "Puma", "Levi's", "FabIndia", "Allen Solly", "Raymond", "Biba"],
  properties: ["DLF", "Prestige", "Sobha", "Godrej Properties", "Brigade", "Lodha", "My Home", "Aparna"],
  jobs: ["Tech Mahindra", "Infosys", "TCS", "Wipro", "Accenture", "Cognizant", "Deloitte", "Amazon"],
  services: ["Urban Company", "NoBroker", "Dunzo", "Packers & Movers", "Homelane", "Livspace"],
};

export const MODELS_BY_BRAND: Record<string, string[]> = {
  // --- MOBILIES & COMPUTERS ---
  Apple: ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14", "iPhone 13", "iPhone 12", "MacBook Pro M3", "MacBook Air M2", "iPad Pro", "iPad Air"],
  Samsung: ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S23 FE", "Galaxy A55 5G", "Galaxy Z Fold 5", "Galaxy Z Flip 5", "Galaxy M34", "Neo QLED 4K TV", "Double Door Refrigerator"],
  OnePlus: ["OnePlus 12", "OnePlus 12R", "OnePlus 11 5G", "OnePlus Nord 4", "OnePlus Nord CE 3", "OnePlus Open"],
  Xiaomi: ["Xiaomi 14 Ultra", "Xiaomi 13 Pro", "Redmi Note 13 Pro+", "Redmi Note 12", "Redmi 13C 5G", "POCO X6 Pro"],
  Vivo: ["Vivo X100 Pro", "Vivo V30 Pro", "Vivo V29 5G", "Vivo Y200", "Vivo T2 Pro"],
  Realme: ["Realme GT 5 Pro", "Realme 12 Pro+", "Realme 11 Pro", "Realme Narzo 60 Pro"],
  Google: ["Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel 7 Pro", "Pixel 6a"],
  Nothing: ["Nothing Phone (2)", "Nothing Phone (2a)", "Nothing Phone (1)", "CMF Phone 1"],
  Motorola: ["Moto Edge 50 Ultra", "Moto Edge 40 Neo", "Moto G84 5G", "Razr 40 Ultra"],
  Oppo: ["Oppo Find N3 Flip", "Oppo Reno 11 Pro", "Oppo F25 Pro", "Oppo A79 5G"],

  // --- CARS ---
  "Maruti Suzuki": ["Swift", "Baleno", "Brezza", "Dzire", "Ertiga", "Grand Vitara", "Alto K10", "Wagon R", "Fronx", "Jimny", "XL6", "Ciaz"],
  Hyundai: ["Creta", "Venue", "i20", "Verna", "Exter", "Alcazar", "Tucson", "Aura", "Grand i10 Nios"],
  Tata: ["Nexon", "Punch", "Harrier", "Safari", "Altroz", "Tiago", "Tigor", "Curvv EV", "Nexon EV"],
  Mahindra: ["Thar", "XUV700", "Scorpio-N", "Scorpio Classic", "XUV300", "Bolero Neo", "XUV400 EV"],
  Honda: ["City 5th Gen", "Elevate", "Amaze", "Civic", "CR-V", "City e:HEV Hybrid"],
  Toyota: ["Innova Crysta", "Innova Hycross", "Fortuner", "Urban Cruiser Hyryder", "Glanza", "Camry Hybrid", "Hilux"],
  Kia: ["Seltos", "Sonet", "Carens", "EV6"],
  BMW: ["3 Series Gran Limousine", "5 Series", "7 Series", "X1", "X3", "X5", "M3"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "G-Wagon"],
  Volkswagen: ["Virtus", "Taigun", "Tiguan", "Polo GT", "Vento"],

  // --- BIKES ---
  "Royal Enfield": ["Classic 350", "Hunter 350", "Bullet 350", "Meteor 350", "Himalayan 450", "Continental GT 650", "Interceptor 650", "Shotgun 650"],
  Yamaha: ["R15 V4", "MT-15 V2", "FZ-S V4", "RayZR 125 FI", "Aerox 155", "R3"],
  TVS: ["Apache RTR 160 4V", "Apache RTR 200 4V", "Apache RR 310", "Jupiter 125", "Ntorq 125", "Raider 125", "iQube Electric", "Ronin 225"],
  Bajaj: ["Pulsar N250", "Pulsar NS200", "Pulsar 150", "Dominar 400", "Chetak EV", "Platina 110", "Avenger Cruise 220"],
  KTM: ["Duke 390", "Duke 250", "Duke 200", "RC 390", "RC 200", "Adventure 390"],
  Hero: ["Splendor Plus", "HF Deluxe", "Xpulse 200 4V", "Karizma XMR", "Extreme 160R", "Mavrick 440"],
  Ather: ["Ather 450X", "Ather 450S", "Ather Rizta"],
  Java: ["Jawa 354", "Jawa 42 Bobber", "Jawa Perak"],

  // --- ELECTRONICS & APPLIANCES ---
  Sony: ["PlayStation 5", "Bravia 4K OLED TV", "WH-1000XM5 Headphones", "Alpha A7 IV Camera", "Soundbar HT-S20R"],
  LG: ["OLED C3 4K TV", "Dual Inverter AC 1.5T", "Front Load 8kg Washer", "Side-by-Side Refrigerator 635L"],
  Dell: ["XPS 13", "XPS 15", "Alienware m16", "Inspiron 15", "Latitude 5430"],
  HP: ["Spectre x360", "Pavilion 15", "Omen 16", "Envy 13"],
  Lenovo: ["ThinkPad X1 Carbon", "Legion Pro 5", "IdeaPad Slim 3", "Yoga Slim 7i"],
  Bose: ["QuietComfort 45", "SoundLink Flex", "Smart Soundbar 900"],
  Canon: ["EOS R6 Mark II", "EOS 200D II", "EOS R10", "EOS 90D"],
};

export function getModelsForBrand(category?: string, brand?: string): string[] {
  if (!brand) return [];
  return MODELS_BY_BRAND[brand] || [
    `${brand} Standard Model`,
    `${brand} Pro Edition`,
    `${brand} Top Model`,
    `${brand} Limited Edition`,
  ];
}

export function generateTitleSuggestions(category?: string, brand?: string, condition?: string): string[] {
  const c = (category || "mobiles").toLowerCase();
  const b = brand || (BRANDS_BY_CATEGORY[c]?.[0] ?? "Brand");
  const cond = condition || "Good Condition";

  if (c.includes("mobile")) {
    return [
      `${b} 128GB — Mint Condition (Box & Original Charger)`,
      `${b} Flagship Smartphone — ${cond} with Bill & Warranty`,
      `Original ${b} Phone — Fully Unlocked, Excellent Battery`,
    ];
  } else if (c.includes("car")) {
    return [
      `${b} Petrol 2022 — Single Owner, Low KM, Fully Serviced`,
      `${b} Automatic Top Model — Insurance Valid & Clean History`,
      `Well Maintained ${b} — Doctor Driven, Non-Accidental`,
    ];
  } else if (c.includes("bike")) {
    return [
      `${b} 350cc — Low Mileage, First Owner with Insurance`,
      `${b} Sports Edition — Excellent Condition, New Tyres`,
      `Smooth Driving ${b} — Serviced at Authorized Center`,
    ];
  } else if (c.includes("electronic")) {
    return [
      `${b} 4K Smart TV / Laptop — High Performance, Low Use`,
      `${b} Premium Edition — Working 100% with Box & Accessories`,
      `Authentic ${b} Device — ${cond}, Urgent Sale`,
    ];
  } else if (c.includes("furniture")) {
    return [
      `Solid Wood ${b} Set — Barely Used, Pristine Condition`,
      `Modern Ergonomic ${b} — Compact & Elegant Design`,
      `Heavy Duty ${b} — Relocation Sale, Great Deal`,
    ];
  }

  return [
    `${b} Premium Item — ${cond}`,
    `Authentic ${b} Product — Relocation Sale`,
    `${b} — Sparingly Used with Full Accessories`,
  ];
}

export function generateAiDescription(params: {
  title?: string;
  category?: string;
  brand?: string;
  condition?: string;
  price?: number;
  specs?: Record<string, any>;
  area?: string;
}): string {
  const title = params.title || "Quality Product";
  const cat = params.category || "Item";
  const brand = params.brand ? `by ${params.brand}` : "";
  const cond = params.condition || "Like New";
  const loc = params.area || "Madhapur, Hyderabad";
  const priceFormatted = params.price ? `₹${params.price.toLocaleString("en-IN")}` : "Reasonable Price";

  return `✨ **${title} ${brand}**

Selling my genuine **${title}** in **${cond}** condition. Sparingly used, carefully maintained, and 100% functional with zero technical issues.

**Key Highlights & Specifications:**
• **Condition:** ${cond} — clean, fully tested & verified.
• **Authenticity:** 100% original product with verified seller badge.
• **Reason for Selling:** Upgrading to new model / Moving location.
• **Location for Inspection & Pickup:** ${loc} (Nearby buyers welcome for live test).
• **Price:** ${priceFormatted} (Fair & open to reasonable offers for quick pickup).

Interested buyers can call or chat directly via Omeetso to schedule a instant inspection!`;
}

export function generateAiStoreDescription(storeName?: string, category?: string, city?: string): string {
  const name = storeName || "Local Business Store";
  const cat = category || "General Goods & Electronics";
  const loc = city || "Hyderabad";

  return `🏪 **Welcome to ${name}!**

Your trusted neighbourhood destination in ${loc} for premium quality **${cat}**. We specialize in providing verified products, transparent pricing, and fast local doorstep delivery.

**Why Choose ${name}?**
✔ **100% Verified Business**: Authenticity & local warranty guaranteed.
✔ **Competitive Pricing**: Genuine products at unbeatable local prices.
✔ **Fast Fulfillment**: In-store pickup, same-day local delivery, and easy payment options.
✔ **Dedicated Support**: Friendly local customer service before and after purchase.

Visit our store page or message us directly on Omeetso for instant stock availability & price quotes!`;
}
