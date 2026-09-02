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
    // 1. Seed authoritative service categories
    for (const cat of SERVICE_CATEGORIES_SEED) {
      await ServiceCategory.findOneAndUpdate(
        { categoryId: cat.categoryId },
        cat,
        { upsert: true, new: true }
      );
    }

    // 2. Permanently delete all mock/dummy services from MongoDB
    const deleted = await Service.deleteMany({
      $or: [
        { _id: { $in: [
          new mongoose.Types.ObjectId("66df10000000000000000001"),
          new mongoose.Types.ObjectId("66df10000000000000000002"),
          new mongoose.Types.ObjectId("66df10000000000000000003")
        ] } },
        { businessName: { $in: [
          "CoolBreeze AC Care & HVAC Solutions",
          "SparkleClean Pro Home & Office Deep Cleaners",
          "VoltMaster 24/7 Electrician & Emergency Plumbing"
        ] } },
        { id: { $in: ["srv-ac-001", "srv-clean-002", "srv-elec-003"] } }
      ]
    });

    if (deleted.deletedCount > 0) {
      console.log(`[ServiceSeeder] Purged ${deleted.deletedCount} mock services from MongoDB.`);
    }
    console.log("[ServiceSeeder] Service categories verified. No mock services seeded.");
  } catch (err) {
    console.error("[ServiceSeeder] Error verifying service categories:", err);
  }
}
