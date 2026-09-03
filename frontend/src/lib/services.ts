// Omeetso Services Vertical — Frontend persistence layer, API client & Seed data
import { API_BASE as ROOT_API } from "@/config/api";

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

// No mock services by default; real services come from backend or user creations
export const SEED_SERVICES: ServiceItem[] = [];

const LOCAL_STORAGE_SERVICES_KEY = "omeetso_local_services";
const LOCAL_STORAGE_INQUIRIES_KEY = "omeetso_service_inquiries";
const LOCAL_STORAGE_SAVED_SERVICES_KEY = "omeetso_saved_service_ids";

// Helper to get local services
export function getLocalServices(): ServiceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SERVICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out old mock seed IDs if any exist in localStorage
    const cleanList = parsed.filter(
      (s: any) => s && s.id !== "srv-ac-001" && s.id !== "srv-clean-002" && s.id !== "srv-elec-003"
    );
    if (cleanList.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch {
    return [];
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

    const res = await fetch(`${ROOT_API}/services?${query.toString()}`, {
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
    const res = await fetch(`${ROOT_API}/services/${id}`, {
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
