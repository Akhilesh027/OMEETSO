// Category-specific spec form configuration (Phase 3).
export type FieldType = "text" | "number" | "select" | "toggle";
export type SpecField = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

export const SPEC_CONFIG: Record<string, SpecField[]> = {
  cars: [
    { key: "Brand", label: "Brand", type: "select", options: ["Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota", "Mahindra", "Kia", "Volkswagen", "Ford", "Other"], required: true },
    { key: "Model", label: "Model", type: "text", required: true },
    { key: "Variant", label: "Variant", type: "text" },
    { key: "Manufacturing year", label: "Manufacturing year", type: "select", options: YEARS, required: true },
    { key: "Registration year", label: "Registration year", type: "select", options: YEARS },
    { key: "Fuel type", label: "Fuel type", type: "select", options: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG"], required: true },
    { key: "Transmission", label: "Transmission", type: "select", options: ["Manual", "Automatic"], required: true },
    { key: "Kilometres driven", label: "Kilometres driven", type: "number", required: true },
    { key: "Number of owners", label: "Number of owners", type: "select", options: ["1st", "2nd", "3rd", "4th or more"], required: true },
    { key: "Registration state", label: "Registration state", type: "text" },
    { key: "Insurance validity", label: "Insurance validity", type: "text" },
    { key: "Colour", label: "Colour", type: "text" },
  ],
  bikes: [
    { key: "Brand", label: "Brand", type: "select", options: ["Honda", "Hero", "Bajaj", "TVS", "Yamaha", "Suzuki", "Royal Enfield", "KTM", "Ather", "Java", "Other"], required: true },
    { key: "Model", label: "Model", type: "text", required: true },
    { key: "Year", label: "Year", type: "select", options: YEARS, required: true },
    { key: "Kilometres driven", label: "Kilometres driven", type: "number", required: true },
    { key: "Engine capacity", label: "Engine capacity (cc)", type: "number" },
    { key: "Number of owners", label: "Number of owners", type: "select", options: ["1st", "2nd", "3rd", "4th or more"], required: true },
    { key: "Registration state", label: "Registration state", type: "text" },
  ],
  mobiles: [
    { key: "Brand", label: "Brand", type: "select", options: ["Apple", "Samsung", "Xiaomi", "OnePlus", "Realme", "Vivo", "Oppo", "Google", "Motorola", "Nothing", "Other"], required: true },
    { key: "Model", label: "Model", type: "text", required: true },
    { key: "Storage", label: "Storage", type: "select", options: ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], required: true },
    { key: "RAM", label: "RAM", type: "select", options: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"] },
    { key: "Colour", label: "Colour", type: "text" },
    { key: "Warranty", label: "Warranty remaining", type: "select", options: ["None", "Under 3 months", "3–6 months", "6–12 months", "Extended"] },
    { key: "Battery condition", label: "Battery condition", type: "select", options: ["Excellent", "Good", "Average", "Needs replacement"] },
    { key: "Accessories included", label: "Accessories included", type: "text", placeholder: "Charger, box, earphones…" },
    { key: "Invoice available", label: "Invoice available", type: "toggle" },
  ],
  electronics: [
    { key: "Brand", label: "Brand", type: "text", required: true },
    { key: "Model", label: "Model", type: "text" },
    { key: "Product type", label: "Product type", type: "select", options: ["Laptops", "TVs", "Cameras", "Speakers & Audio", "Gaming Consoles", "Smart Home", "Monitors", "Other"], required: true },
    { key: "Purchase year", label: "Purchase year", type: "select", options: YEARS },
    { key: "Warranty", label: "Warranty", type: "select", options: ["None", "Under 3 months", "3–6 months", "6–12 months", "Extended"] },
    { key: "Working condition", label: "Working condition", type: "select", options: ["Perfect", "Minor issues", "Needs repair"], required: true },
    { key: "Accessories", label: "Accessories", type: "text" },
  ],
  furniture: [
    { key: "Furniture type", label: "Furniture type", type: "select", options: ["Sofa", "Bed", "Dining Table", "Study Table / Desk", "Chair", "Wardrobe / Almirah", "Shoe Rack", "Bookshelf", "TV Unit", "Recliner", "Other"], required: true },
    { key: "Material", label: "Material", type: "select", options: ["Solid Wood (Teak/Sheesham)", "Engineered Wood / Plywood", "Metal / Iron", "Plastic", "Leather / Fabric", "Glass", "Mixed"], required: true },
    { key: "Colour", label: "Colour", type: "text" },
    { key: "Dimensions", label: "Dimensions (L × W × H)", type: "text", placeholder: "e.g. 6ft x 4ft x 3ft" },
    { key: "Number of seats", label: "Number of seats / Capacity", type: "select", options: ["Single", "2 Seater", "3 Seater", "4 Seater", "6 Seater", "8+ Seater"] },
    { key: "Assembly required", label: "Assembly required", type: "toggle" },
    { key: "Delivery availability", label: "Delivery availability", type: "select", options: ["Pickup Only", "Local Delivery Available", "Seller Can Arrange Transport"], required: true },
  ],
  properties: [
    { key: "Listing type", label: "Listing type", type: "select", options: ["Rent", "Sale", "PG / Hostel"], required: true },
    { key: "Property type", label: "Property type", type: "select", options: ["Apartment", "Independent House", "Villa", "Studio", "Plot / Land", "Commercial Space"], required: true },
    { key: "Bedrooms", label: "Bedrooms (BHK)", type: "select", options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"] },
    { key: "Bathrooms", label: "Bathrooms", type: "select", options: ["1", "2", "3", "4+"] },
    { key: "Built-up area", label: "Built-up area (sq ft)", type: "number", required: true },
    { key: "Furnishing", label: "Furnishing", type: "select", options: ["Unfurnished", "Semi-furnished", "Fully Furnished"] },
    { key: "Floor", label: "Floor", type: "number" },
    { key: "Total floors", label: "Total floors", type: "number" },
    { key: "Parking", label: "Parking", type: "select", options: ["None", "1 Covered", "2 Covered", "Open Parking"] },
    { key: "Preferred tenant", label: "Preferred tenant", type: "select", options: ["Anyone", "Family Only", "Bachelors Only", "Working Professionals"] },
  ],
  fashion: [
    { key: "Gender / Target", label: "Gender / Target", type: "select", options: ["Men", "Women", "Unisex", "Kids"], required: true },
    { key: "Item Type", label: "Item Type", type: "select", options: ["Shirts & Tops", "Pants & Jeans", "Dresses", "Footwear", "Watches", "Bags & Wallets", "Jewelry & Accessories", "Other"], required: true },
    { key: "Brand", label: "Brand", type: "text" },
    { key: "Size", label: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Shoe Size 6-11"] },
    { key: "Material", label: "Material", type: "select", options: ["Cotton", "Denim", "Leather", "Silk", "Synthetic", "Wool", "Mixed"] },
    { key: "Colour", label: "Colour", type: "text" },
  ],
  appliances: [
    { key: "Appliance Type", label: "Appliance Type", type: "select", options: ["Refrigerator", "Washing Machine", "Air Conditioner (AC)", "Microwave / Oven", "Water Purifier", "Chimney / Stove", "Geyser", "Other"], required: true },
    { key: "Brand", label: "Brand", type: "select", options: ["LG", "Samsung", "Whirlpool", "Bosch", "IFB", "Godrej", "Haier", "Voltas", "Daikin", "Other"], required: true },
    { key: "Capacity / Size", label: "Capacity / Size", type: "text", placeholder: "e.g. 1.5 Ton / 260L / 7kg" },
    { key: "Star Rating", label: "Energy Rating", type: "select", options: ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star", "Not Rated"] },
    { key: "Purchase year", label: "Purchase year", type: "select", options: YEARS },
    { key: "Warranty", label: "Warranty remaining", type: "select", options: ["None", "Under 6 months", "1-2 Years", "Compressor Warranty Only"] },
  ],
  jobs: [
    { key: "Job Designation", label: "Job Title / Role", type: "text", required: true, placeholder: "e.g. Senior Software Engineer / Sales Executive" },
    { key: "Job Type", label: "Job Type", type: "select", options: ["Full time", "Part time", "Work from home", "Contract / Freelance", "Internship"], required: true },
    { key: "Work Mode", label: "Work Mode", type: "select", options: ["On-site (Office)", "Remote (Work from Home)", "Hybrid"], required: true },
    { key: "Experience Required", label: "Experience Required", type: "select", options: ["Fresher / No Experience", "1-2 Years", "3-5 Years", "5-8 Years", "8+ Years"] },
    { key: "Qualification", label: "Minimum Qualification", type: "select", options: ["10th / 12th Pass", "Diploma / ITI", "Graduate (Bachelor's)", "Post Graduate (Master's)", "Any"] },
    { key: "Salary Period", label: "Salary Pay Period", type: "select", options: ["Per Month", "Per Year", "Hourly", "Per Project"] },
    { key: "Company Name", label: "Hiring Company / Consultant", type: "text" },
  ],
  services: [
    { key: "Service Category", label: "Service Provided", type: "select", options: ["Home Repair & Maintenance", "AC & Appliance Repair", "House Cleaning & Pest Control", "Movers & Packers", "Tutors & Classes", "Photography & Video", "Beauty & Salon", "Event Management"], required: true },
    { key: "Pricing Type", label: "Pricing Structure", type: "select", options: ["Fixed Price", "Starts from (Base Rate)", "On Inspection / Quote", "Per Hour"], required: true },
    { key: "Service Mode", label: "Service Delivery Mode", type: "select", options: ["At Customer Doorstep", "At Service Provider Center", "Online / Virtual"], required: true },
    { key: "Response Time", label: "Guaranteed Response Time", type: "select", options: ["Within 1 Hour", "Same Day Service", "Within 24 Hours", "Appointment Only"] },
    { key: "Warranty Offered", label: "Service Warranty / Guarantee", type: "select", options: ["30 Days Guarantee", "90 Days Warranty", "Satisfaction Guarantee", "No Warranty"] },
  ],
  pets: [
    { key: "Pet Category", label: "Pet Category", type: "select", options: ["Dogs", "Cats", "Birds", "Fish & Aquarium", "Pet Food & Accessories"], required: true },
    { key: "Breed / Name", label: "Breed / Item Name", type: "text", required: true },
    { key: "Age", label: "Age", type: "text", placeholder: "e.g. 3 Months / 1 Year" },
    { key: "Vaccinated", label: "Vaccinated & Health Certificate", type: "select", options: ["Yes - Fully Vaccinated", "Partially Vaccinated", "Not Vaccinated", "N/A (Accessories)"] },
  ],
};

export const GENERIC_SPEC: SpecField[] = [
  { key: "Brand", label: "Brand", type: "text" },
  { key: "Model", label: "Model", type: "text" },
  { key: "Purchase year", label: "Purchase year", type: "select", options: YEARS },
];

export function specFieldsFor(category: string, subcategory?: string): SpecField[] {
  const cat = (category || "").toLowerCase();
  return SPEC_CONFIG[cat] ?? GENERIC_SPEC;
}
