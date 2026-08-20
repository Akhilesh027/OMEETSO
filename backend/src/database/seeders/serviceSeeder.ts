import mongoose from "mongoose";
import { Service } from "../../modules/services/models/Service";
import { ServiceCategory } from "../../modules/services/models/ServiceCategory";
import { User } from "../../modules/users/models/User";

export const SERVICE_CATEGORIES_SEED = [
  {
    categoryId: "home_services",
    name: "Home Services",
    icon: "Home",
    description: "Deep home cleaning, painting, pest control, plumbing & electrical services",
    displayOrder: 1,
    isActive: true,
    subcategories: [
      { id: "deep_cleaning", name: "Deep Home Cleaning", popularServices: ["Full Villa Cleaning", "Kitchen Deep Clean", "Sofa & Carpet Shampooing"] },
      { id: "electrician", name: "Electrician & Wiring", popularServices: ["Fan & Light Installation", "Switchboard Repair", "MCB Tripping"] },
      { id: "plumber", name: "Plumber & Pipe Fitting", popularServices: ["Tap Leakage Fix", "Drain Blockage", "Water Heater Installation"] },
      { id: "painting", name: "House Painting & Waterproofing", popularServices: ["Interior Wall Painting", "Waterproof Coating", "Texture Painting"] },
      { id: "pest_control", name: "Pest Control", popularServices: ["Cockroach & Termite Treatment", "Bed Bug Elimination", "General Pest Spray"] },
    ],
  },
  {
    categoryId: "appliance_repair",
    name: "Appliance Repair",
    icon: "Wrench",
    description: "AC service & repair, refrigerator, washing machine & microwave repair",
    displayOrder: 2,
    isActive: true,
    subcategories: [
      { id: "ac_repair", name: "AC Service & Gas Refill", popularServices: ["Deep Jet Clean", "Gas Leak Fix & Refill", "AC Installation"] },
      { id: "refrigerator_repair", name: "Refrigerator Repair", popularServices: ["Cooling Problem Fix", "Compressor Replacement", "Defrost Issue"] },
      { id: "washing_machine", name: "Washing Machine Repair", popularServices: ["Drum Issue", "Motor Replacement", "PCB Board Repair"] },
      { id: "tv_repair", name: "Smart TV & Soundbar Repair", popularServices: ["Display Panel Fix", "Sound Issue", "Wall Mount Installation"] },
    ],
  },
  {
    categoryId: "beauty_wellness",
    name: "Beauty & Wellness",
    icon: "Sparkles",
    description: "Salon at home for women & men, massage, facial, manicure & pedicure",
    displayOrder: 3,
    isActive: true,
    subcategories: [
      { id: "salon_women", name: "Salon for Women at Home", popularServices: ["Bridal Makeup", "Hydra Facial", "Waxing & Threading"] },
      { id: "hair_grooming", name: "Hair Grooming & Spa", popularServices: ["Hair Cut & Blowdry", "Keratin Treatment", "Head Massage"] },
    ],
  },
  {
    categoryId: "tutors_classes",
    name: "Tutors & Education",
    icon: "GraduationCap",
    description: "Home tutors, coding classes, music instructors and test preparation",
    displayOrder: 4,
    isActive: true,
    subcategories: [
      { id: "home_tutors", name: "School Home Tutors (CBSE/ICSE)", popularServices: ["Maths & Science Tutor", "Class 10-12 Board Coaching"] },
      { id: "music_instruments", name: "Guitar & Piano Lessons", popularServices: ["Beginner Guitar Classes", "Vocal Music Training"] },
    ],
  },
  {
    categoryId: "packers_movers",
    name: "Packers & Movers",
    icon: "Truck",
    description: "Local house shifting, office relocation, vehicle transport & storage",
    displayOrder: 5,
    isActive: true,
    subcategories: [
      { id: "house_shifting", name: "House Shifting & Relocation", popularServices: ["1BHK / 2BHK Relocation", "Bubble Wrap Packing", "Intercity Shifting"] },
    ],
  },
];

export async function seedInitialServices() {
  try {
    // 1. Seed categories
    for (const cat of SERVICE_CATEGORIES_SEED) {
      await ServiceCategory.findOneAndUpdate(
        { categoryId: cat.categoryId },
        cat,
        { upsert: true, new: true }
      );
    }

    // 2. Ensure a provider user exists
    let provider = await User.findOne({ email: "provider@omeetso.com" });
    if (!provider) {
      provider = await User.findOne(); // fallback to any existing user
    }

    const providerId = provider ? provider._id : new mongoose.Types.ObjectId();

    // 3. Seed 3 Distinct High-Quality Services
    const initialServices = [
      {
        _id: new mongoose.Types.ObjectId("66df10000000000000000001"),
        providerId,
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
            "Refrigerant gas pressure measurement check"
          ],
          exclusions: [
            "Spare parts replacement (PCB board, capacitor, copper tubing if needed)",
            "Complete gas refilling / top-up billed additionally as per PSI requirement"
          ],
          images: [
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80"
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
      },
      {
        _id: new mongoose.Types.ObjectId("66df10000000000000000002"),
        providerId,
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
            "Ceiling fan, switchboard, door, and balcony railing wipe down"
          ],
          exclusions: [
            "Interior cupboard organization / personal item decluttering",
            "Wall repainting or heavy cement stain scraping"
          ],
          images: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80"
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
      },
      {
        _id: new mongoose.Types.ObjectId("66df10000000000000000003"),
        providerId,
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
            "Transparent upfront rate card for any additional work or replacements"
          ],
          exclusions: [
            "Cost of heavy cables, MCB switches, submersible motors or copper pipes"
          ],
          images: [
            "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80"
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
      },
    ];

    for (const s of initialServices) {
      await Service.findOneAndUpdate({ _id: s._id }, s, { upsert: true, new: true });
    }

    console.log("[ServiceSeeder] Seeded 3 verified services & categories successfully");
  } catch (err) {
    console.error("[ServiceSeeder] Error seeding services:", err);
  }
}
