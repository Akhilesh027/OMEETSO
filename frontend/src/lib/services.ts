// Omeetso Services Vertical — Frontend persistence layer, API client & Seed data

export type ServiceType = "DOORSTEP" | "AT_CENTER" | "ONLINE" | "HYBRID";
export type PriceType = "FIXED" | "STARTING_AT" | "PER_HOUR" | "VISITATION_FEE" | "REQUEST_QUOTE";
export type PriceUnit = "per service" | "per hour" | "per visit" | "per sqft" | "per day" | "fixed";
export type InquiryStatus = "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REJECTED";

export interface ServiceItem {
  id: string;
  providerId: string;
  storeId?: string;
  businessName: string;
  providerName: string;
  avatar?: string;
  phone?: string;
  email?: string;
  isVerifiedProvider: boolean;
  providerBadge?: string;
  title: string;
  serviceCategoryId: string;
  subcategoryId: string;
  serviceType: ServiceType;
  pricing: {
    priceType: PriceType;
    amount: number;
    discountPrice?: number;
    priceUnit: PriceUnit;
    isNegotiable: boolean;
  };
  location: {
    area: string;
    city: string;
    pincode: string;
    serviceRadiusKm?: number;
    servesAreas?: string[];
    coordinates?: [number, number];
  };
  serviceDetails: {
    description: string;
    inclusions: string[];
    exclusions: string[];
    images: string[];
    experienceYears: number;
    guaranteedResponseTime: string;
    warranty: string;
  };
  availability: {
    workingDays: string[];
    workingHours: string;
    emergencyServiceAvailable: boolean;
  };
  status: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "PAUSED" | "REJECTED";
  isFeatured?: boolean;
  isEmergency?: boolean;
  stats: {
    viewsCount: number;
    inquiriesCount: number;
    bookingsCount: number;
    rating: number;
    reviewsCount: number;
  };
  createdAt: number | string;
  updatedAt?: number | string;
  similarServices?: ServiceItem[];
}

export interface ServiceInquiryItem {
  id: string;
  serviceId: string;
  service?: Partial<ServiceItem>;
  customerId: string;
  providerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: {
    street?: string;
    area: string;
    city: string;
    pincode: string;
  };
  preferredDate: string | number;
  preferredTimeSlot: string;
  serviceMode: ServiceType;
  problemDescription: string;
  problemPhotos?: string[];
  status: InquiryStatus;
  quotationAmount?: number;
  providerNotes?: string;
  cancellationReason?: string;
  createdAt: string | number;
}

export interface ServiceCategoryItem {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  description?: string;
  displayOrder: number;
  subcategories: {
    id: string;
    name: string;
    popularServices?: string[];
  }[];
}

export const SERVICE_CATEGORIES: ServiceCategoryItem[] = [
  {
    id: "appliance_repair",
    categoryId: "appliance_repair",
    name: "Appliance Repair",
    icon: "Wrench",
    description: "AC service, refrigerator, washing machine & microwave repair",
    displayOrder: 1,
    subcategories: [
      { id: "ac_repair", name: "AC Service & Gas Refill", popularServices: ["Deep Jet Clean", "Gas Leak Fix & Refill", "AC Installation"] },
      { id: "refrigerator_repair", name: "Refrigerator Repair", popularServices: ["Cooling Problem Fix", "Compressor Replacement"] },
      { id: "washing_machine", name: "Washing Machine Repair", popularServices: ["Drum Issue", "Motor Replacement"] },
      { id: "tv_repair", name: "Smart TV & Soundbar Repair", popularServices: ["Display Panel Fix", "Wall Mount Installation"] },
    ],
  },
  {
    id: "home_services",
    categoryId: "home_services",
    name: "Home Services",
    icon: "Home",
    description: "Deep cleaning, painting, pest control, plumbing & electricians",
    displayOrder: 2,
    subcategories: [
      { id: "deep_cleaning", name: "Deep Home Cleaning", popularServices: ["Full Villa Cleaning", "Kitchen Deep Clean", "Sofa & Carpet Shampooing"] },
      { id: "electrician", name: "Electrician & Wiring", popularServices: ["Fan & Light Installation", "Switchboard Repair", "MCB Tripping"] },
      { id: "plumber", name: "Plumber & Pipe Fitting", popularServices: ["Tap Leakage Fix", "Drain Blockage", "Water Heater Installation"] },
      { id: "painting", name: "House Painting & Waterproofing", popularServices: ["Interior Wall Painting", "Waterproof Coating"] },
      { id: "pest_control", name: "Pest Control", popularServices: ["Cockroach & Termite Treatment", "Bed Bug Elimination"] },
    ],
  },
  {
    id: "beauty_wellness",
    categoryId: "beauty_wellness",
    name: "Beauty & Wellness",
    icon: "Sparkles",
    description: "Salon at home, massage, bridal makeup & grooming",
    displayOrder: 3,
    subcategories: [
      { id: "salon_women", name: "Salon for Women at Home", popularServices: ["Bridal Makeup", "Hydra Facial", "Waxing & Threading"] },
      { id: "hair_grooming", name: "Hair Grooming & Spa", popularServices: ["Hair Cut & Blowdry", "Keratin Treatment"] },
    ],
  },
  {
    id: "tutors_classes",
    categoryId: "tutors_classes",
    name: "Tutors & Education",
    icon: "GraduationCap",
    description: "Home tutors, coding, music & exam coaching",
    displayOrder: 4,
    subcategories: [
      { id: "home_tutors", name: "School Home Tutors (CBSE/ICSE)", popularServices: ["Maths & Science Tutor", "Class 10-12 Board Coaching"] },
      { id: "music_instruments", name: "Guitar & Piano Lessons", popularServices: ["Beginner Guitar Classes"] },
    ],
  },
  {
    id: "packers_movers",
    categoryId: "packers_movers",
    name: "Packers & Movers",
    icon: "Truck",
    description: "Local house shifting, office relocation & vehicle transport",
    displayOrder: 5,
    subcategories: [
      { id: "house_shifting", name: "House Shifting & Relocation", popularServices: ["1BHK / 2BHK Relocation", "Bubble Wrap Packing"] },
    ],
  },
];

// Seed initial 3 services for immediate rich fallback and storage
export const SEED_SERVICES: ServiceItem[] = [
  {
    id: "srv-ac-001",
    providerId: "user-provider-001",
    businessName: "CoolBreeze AC Care & HVAC Solutions",
    providerName: "Ramesh Sharma (Certified HVAC Technician)",
    avatar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80",
    phone: "+91 98765 12001",
    email: "ramesh.hvac@omeetso.com",
    isVerifiedProvider: true,
    providerBadge: "Top Rated AC Pro",
    title: "Complete Jet Pump AC Servicing & Gas Refill",
    serviceCategoryId: "appliance_repair",
    subcategoryId: "AC Service & Gas Refill",
    serviceType: "DOORSTEP",
    pricing: {
      priceType: "STARTING_AT",
      amount: 499,
      discountPrice: 699,
      priceUnit: "per service",
      isNegotiable: false,
    },
    location: {
      area: "Madhapur",
      city: "Hyderabad",
      pincode: "500081",
      serviceRadiusKm: 25,
      servesAreas: ["Madhapur", "Hitec City", "Gachibowli", "Kondapur", "Jubilee Hills", "Banjara Hills", "Kukatpally"],
      coordinates: [78.3869, 17.4483],
    },
    serviceDetails: {
      description: "Professional high-pressure jet pump deep clean for Split and Window ACs. Eliminates 99.9% bacteria, foul odor, and improves cooling efficiency up to 40%. Complete gas check and electrical diagnostics included.",
      inclusions: [
        "High-pressure jet cleaning for indoor evaporator coils & filter mesh",
        "Outdoor condenser unit power wash & coil cleanup",
        "Drain pipe flushing to prevent water leakage",
        "Comprehensive 10-point cooling and electrical safety diagnostic test",
        "Refrigerant gas pressure measurement check",
      ],
      exclusions: [
        "Spare parts replacement (PCB board, capacitor, copper tubing if needed)",
        "Complete gas refilling / top-up billed additionally as per PSI requirement",
      ],
      images: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80",
      ],
      experienceYears: 8,
      guaranteedResponseTime: "Within 60 Mins",
      warranty: "60 Days Cooling & Leak Guarantee",
    },
    availability: {
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      workingHours: "08:00 AM - 09:00 PM",
      emergencyServiceAvailable: true,
    },
    status: "ACTIVE",
    isFeatured: true,
    isEmergency: true,
    stats: {
      viewsCount: 1240,
      inquiriesCount: 182,
      bookingsCount: 145,
      rating: 4.9,
      reviewsCount: 68,
    },
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "srv-clean-002",
    providerId: "user-provider-002",
    businessName: "SparkleClean Pro Home & Office Deep Cleaners",
    providerName: "Pooja & Clean Crew",
    avatar: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80",
    phone: "+91 98765 12002",
    email: "sparkle.clean@omeetso.com",
    isVerifiedProvider: true,
    providerBadge: "ISO Certified Partner",
    title: "Full Apartment & Villa Deep Cleaning Service",
    serviceCategoryId: "home_services",
    subcategoryId: "Deep Home Cleaning",
    serviceType: "DOORSTEP",
    pricing: {
      priceType: "STARTING_AT",
      amount: 2499,
      discountPrice: 3200,
      priceUnit: "per service",
      isNegotiable: true,
    },
    location: {
      area: "Gachibowli",
      city: "Hyderabad",
      pincode: "500032",
      serviceRadiusKm: 30,
      servesAreas: ["Gachibowli", "Financial District", "Kokapet", "Manikonda", "Nanakramguda", "Tellapur", "Miyapur"],
      coordinates: [78.3578, 17.4401],
    },
    serviceDetails: {
      description: "Top-to-bottom mechanized deep sanitization for 1BHK/2BHK/3BHK apartments and independent houses. Uses eco-friendly German Taski chemicals, single-disc floor scrubbing machines, and industrial vacuum cleaners.",
      inclusions: [
        "Kitchen deep degreasing: chimney, exhaust, tiles, countertops, cabinet exteriors",
        "Bathroom scrub & descaling: tiles, sanitary fittings, glass partitions, taps",
        "Single-disc mechanized floor scrubbing & buffing across all rooms",
        "Dry vacuuming of sofas, mattresses, and window channel debris extraction",
        "Ceiling fan, switchboard, door, and balcony railing wipe down",
      ],
      exclusions: [
        "Interior cupboard organization / personal item decluttering",
        "Wall repainting or heavy cement stain scraping",
      ],
      images: [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
      ],
      experienceYears: 6,
      guaranteedResponseTime: "Same Day Slots",
      warranty: "100% Re-clean Guarantee if unsatisfied",
    },
    availability: {
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      workingHours: "07:30 AM - 08:30 PM",
      emergencyServiceAvailable: false,
    },
    status: "ACTIVE",
    isFeatured: true,
    isEmergency: false,
    stats: {
      viewsCount: 890,
      inquiriesCount: 96,
      bookingsCount: 82,
      rating: 4.85,
      reviewsCount: 42,
    },
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: "srv-elec-003",
    providerId: "user-provider-003",
    businessName: "VoltMaster 24/7 Electrician & Emergency Plumbing",
    providerName: "K. Venkatesh (Master Wireman)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    phone: "+91 98765 12003",
    email: "voltmaster@omeetso.com",
    isVerifiedProvider: true,
    providerBadge: "Govt. Licensed Electrician",
    title: "24/7 Emergency Electrician & Plumbing Fix",
    serviceCategoryId: "home_services",
    subcategoryId: "Electrician & Wiring",
    serviceType: "DOORSTEP",
    pricing: {
      priceType: "VISITATION_FEE",
      amount: 199,
      priceUnit: "per visit",
      isNegotiable: false,
    },
    location: {
      area: "Kukatpally",
      city: "Hyderabad",
      pincode: "500072",
      serviceRadiusKm: 20,
      servesAreas: ["Kukatpally", "KPHB Colony", "Miyapur", "Nizampet", "Bachupally", "JNTU", "Moosapet"],
      coordinates: [78.3995, 17.4938],
    },
    serviceDetails: {
      description: "Rapid 30-minute doorstep emergency response for electrical power cuts, MCB tripping, short circuits, inverter wiring, ceiling fans, motor pump issues, and acute water leakage/drain blockages.",
      inclusions: [
        "Fast 30-45 min arrival across Kukatpally & Cyberabad zone",
        "Thorough digital multimeter diagnostic & short-circuit tracing",
        "First 30 minutes of labor & basic connection fixing included",
        "Transparent upfront rate card for any additional work or replacements",
      ],
      exclusions: [
        "Cost of heavy cables, MCB switches, submersible motors or copper pipes",
      ],
      images: [
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
      ],
      experienceYears: 10,
      guaranteedResponseTime: "Under 30 Mins",
      warranty: "30 Days Service Warranty",
    },
    availability: {
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      workingHours: "24 Hours Emergency",
      emergencyServiceAvailable: true,
    },
    status: "ACTIVE",
    isFeatured: true,
    isEmergency: true,
    stats: {
      viewsCount: 2150,
      inquiriesCount: 310,
      bookingsCount: 278,
      rating: 4.95,
      reviewsCount: 114,
    },
    createdAt: Date.now() - 86400000 * 1,
  },
];

const LOCAL_STORAGE_SERVICES_KEY = "omeetso_local_services";
const LOCAL_STORAGE_INQUIRIES_KEY = "omeetso_service_inquiries";
const LOCAL_STORAGE_SAVED_SERVICES_KEY = "omeetso_saved_service_ids";

// Helper to get local services
export function getLocalServices(): ServiceItem[] {
  if (typeof window === "undefined") return SEED_SERVICES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SERVICES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(SEED_SERVICES));
      return SEED_SERVICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_SERVICES;
  } catch {
    return SEED_SERVICES;
  }
}

// Helper to save local services
export function saveLocalServices(services: ServiceItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(services));
}

// Public API fetcher with backend fallback
export async function fetchPublicServices(params?: {
  q?: string;
  cat?: string;
  sub?: string;
  serviceType?: string;
  minPrice?: string;
  maxPrice?: string;
  emergency?: string;
  verified?: string;
  sort?: string;
}): Promise<ServiceItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.cat) query.set("cat", params.cat);
    if (params?.sub) query.set("sub", params.sub);
    if (params?.serviceType) query.set("serviceType", params.serviceType);
    if (params?.minPrice) query.set("minPrice", params.minPrice);
    if (params?.maxPrice) query.set("maxPrice", params.maxPrice);
    if (params?.emergency) query.set("emergency", params.emergency);
    if (params?.verified) query.set("verified", params.verified);
    if (params?.sort) query.set("sort", params.sort);

    const res = await fetch(`http://localhost:5000/api/v1/services?${query.toString()}`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((s: any) => ({
          ...s,
          id: s._id || s.id,
        }));
      }
    }
  } catch {
    // fallback to local
  }

  // Local filtering fallback
  let list = getLocalServices();

  if (params?.cat && params.cat !== "all") {
    list = list.filter((s) => s.serviceCategoryId.toLowerCase() === params.cat?.toLowerCase());
  }

  if (params?.sub && params.sub !== "all") {
    list = list.filter((s) => s.subcategoryId.toLowerCase().includes(params.sub!.toLowerCase()));
  }

  if (params?.serviceType && params.serviceType !== "ALL") {
    list = list.filter((s) => s.serviceType === params.serviceType);
  }

  if (params?.emergency === "true" || params?.emergency === "1") {
    list = list.filter((s) => s.isEmergency || s.availability.emergencyServiceAvailable);
  }

  if (params?.verified === "true" || params?.verified === "1") {
    list = list.filter((s) => s.isVerifiedProvider);
  }

  if (params?.q) {
    const qLower = params.q.toLowerCase();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(qLower) ||
        s.businessName.toLowerCase().includes(qLower) ||
        s.subcategoryId.toLowerCase().includes(qLower) ||
        s.location.area.toLowerCase().includes(qLower)
    );
  }

  if (params?.minPrice) {
    list = list.filter((s) => s.pricing.amount >= Number(params.minPrice));
  }

  if (params?.maxPrice) {
    list = list.filter((s) => s.pricing.amount <= Number(params.maxPrice));
  }

  if (params?.sort === "price-low") {
    list.sort((a, b) => a.pricing.amount - b.pricing.amount);
  } else if (params?.sort === "price-high") {
    list.sort((a, b) => b.pricing.amount - a.pricing.amount);
  } else if (params?.sort === "rating") {
    list.sort((a, b) => b.stats.rating - a.stats.rating);
  }

  return list;
}

// Fetch single service by ID
export async function fetchServiceById(id: string): Promise<ServiceItem | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/v1/services/${id}`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return {
          ...data.data,
          id: data.data._id || data.data.id,
        };
      }
    }
  } catch {
    // fallback
  }

  const all = getLocalServices();
  const match = all.find((s) => s.id === id || (s as any)._id === id);
  if (match) {
    const similar = all.filter((s) => s.id !== match.id && s.serviceCategoryId === match.serviceCategoryId).slice(0, 3);
    return { ...match, similarServices: similar };
  }
  return null;
}

// Saved Services (Wishlist / Bookmarks)
export function getSavedServiceIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED_SERVICES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleSaveServiceLocal(serviceId: string): boolean {
  const ids = getSavedServiceIds();
  let updated: string[];
  let isSaved = false;
  if (ids.includes(serviceId)) {
    updated = ids.filter((id) => id !== serviceId);
    isSaved = false;
  } else {
    updated = [serviceId, ...ids];
    isSaved = true;
  }
  localStorage.setItem(LOCAL_STORAGE_SAVED_SERVICES_KEY, JSON.stringify(updated));
  return isSaved;
}

// Service Inquiries / Bookings local management
export function listServiceInquiriesLocal(): ServiceInquiryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function createServiceInquiryLocal(inquiry: Omit<ServiceInquiryItem, "id" | "createdAt" | "status">): ServiceInquiryItem {
  const all = listServiceInquiriesLocal();
  const newInquiry: ServiceInquiryItem = {
    ...inquiry,
    id: `inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "PENDING",
    createdAt: Date.now(),
  };
  const updated = [newInquiry, ...all];
  localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(updated));
  return newInquiry;
}

export function updateInquiryStatusLocal(inquiryId: string, status: InquiryStatus, quotationAmount?: number, notes?: string): void {
  const all = listServiceInquiriesLocal();
  const updated = all.map((i) => {
    if (i.id === inquiryId) {
      return {
        ...i,
        status,
        ...(quotationAmount !== undefined ? { quotationAmount } : {}),
        ...(notes ? { providerNotes: notes } : {}),
      };
    }
    return i;
  });
  localStorage.setItem(LOCAL_STORAGE_INQUIRIES_KEY, JSON.stringify(updated));
}
