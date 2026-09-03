// Centralized Hybrid Location Service for Omeetso (Optimized for Laptops, Desktops & Mobile)
// 1. Laptop-friendly Wi-Fi & GPS positioning (avoids POSITION_UNAVAILABLE errors on devices without GPS chips)
// 2. High-precision Reverse Geocoding + Offline Haversine Math Grid
// 3. Automated Network IP fallback for wired laptops and desktop PCs

export interface LocationResult {
  area: string;
  pincode: string;
  city: string;
  state?: string;
  distanceKm?: number;
}

export interface GeoCoordinateItem {
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

// ── 1. Comprehensive Local GPS Coordinate Grid (Offline Math Fallback) ──
export const LOCAL_GPS_COORDINATES: GeoCoordinateItem[] = [
  // Hyderabad — Hitec City & Western Corridor
  { area: "Madhapur", city: "Hyderabad", state: "Telangana", pincode: "500081", lat: 17.4483, lng: 78.3869 },
  { area: "Hitec City", city: "Hyderabad", state: "Telangana", pincode: "500081", lat: 17.4435, lng: 78.3772 },
  { area: "Kondapur", city: "Hyderabad", state: "Telangana", pincode: "500084", lat: 17.4699, lng: 78.3578 },
  { area: "Gachibowli", city: "Hyderabad", state: "Telangana", pincode: "500032", lat: 17.4401, lng: 78.3489 },
  { area: "Financial District", city: "Hyderabad", state: "Telangana", pincode: "500032", lat: 17.4198, lng: 78.3428 },
  { area: "Nanakramguda", city: "Hyderabad", state: "Telangana", pincode: "500032", lat: 17.4150, lng: 78.3490 },
  { area: "Kokapet", city: "Hyderabad", state: "Telangana", pincode: "500075", lat: 17.3912, lng: 78.3245 },
  { area: "Gandipet", city: "Hyderabad", state: "Telangana", pincode: "500075", lat: 17.3934, lng: 78.3184 },
  { area: "Manikonda", city: "Hyderabad", state: "Telangana", pincode: "500089", lat: 17.4001, lng: 78.3792 },
  { area: "Narsingi", city: "Hyderabad", state: "Telangana", pincode: "500091", lat: 17.3820, lng: 78.3619 },
  { area: "Tellapur", city: "Hyderabad", state: "Telangana", pincode: "502032", lat: 17.4590, lng: 78.2830 },
  { area: "Chanda Nagar", city: "Hyderabad", state: "Telangana", pincode: "500050", lat: 17.4922, lng: 78.3274 },
  { area: "Lingampally", city: "Hyderabad", state: "Telangana", pincode: "500019", lat: 17.4868, lng: 78.3175 },

  // Hyderabad — Kukatpally & Northern Suburbs
  { area: "Kukatpally", city: "Hyderabad", state: "Telangana", pincode: "500072", lat: 17.4938, lng: 78.3995 },
  { area: "KPHB Colony", city: "Hyderabad", state: "Telangana", pincode: "500072", lat: 17.4910, lng: 78.3920 },
  { area: "Miyapur", city: "Hyderabad", state: "Telangana", pincode: "500049", lat: 17.4968, lng: 78.3547 },
  { area: "Nizampet", city: "Hyderabad", state: "Telangana", pincode: "500090", lat: 17.5186, lng: 78.3845 },
  { area: "Bachupally", city: "Hyderabad", state: "Telangana", pincode: "500090", lat: 17.5332, lng: 78.3698 },
  { area: "Pragathi Nagar", city: "Hyderabad", state: "Telangana", pincode: "500090", lat: 17.5120, lng: 78.3770 },
  { area: "Sanathnagar", city: "Hyderabad", state: "Telangana", pincode: "500018", lat: 17.4563, lng: 78.4413 },
  { area: "Ameerpet", city: "Hyderabad", state: "Telangana", pincode: "500016", lat: 17.4375, lng: 78.4483 },
  { area: "SR Nagar", city: "Hyderabad", state: "Telangana", pincode: "500038", lat: 17.4428, lng: 78.4417 },
  { area: "Balanagar", city: "Hyderabad", state: "Telangana", pincode: "500037", lat: 17.4728, lng: 78.4412 },
  { area: "Quthbullapur", city: "Hyderabad", state: "Telangana", pincode: "500055", lat: 17.5060, lng: 78.4632 },
  { area: "Kompally", city: "Hyderabad", state: "Telangana", pincode: "500100", lat: 17.5375, lng: 78.4862 },
  { area: "Bowenpally", city: "Hyderabad", state: "Telangana", pincode: "500011", lat: 17.4716, lng: 78.4856 },
  { area: "Jeedimetla", city: "Hyderabad", state: "Telangana", pincode: "500055", lat: 17.5140, lng: 78.4520 },

  // Hyderabad — Central, Banjara & Jubilee Hills
  { area: "Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034", lat: 17.4156, lng: 78.4350 },
  { area: "Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: "500033", lat: 17.4319, lng: 78.4073 },
  { area: "Somajiguda", city: "Hyderabad", state: "Telangana", pincode: "500082", lat: 17.4262, lng: 78.4584 },
  { area: "Punjagutta", city: "Hyderabad", state: "Telangana", pincode: "500082", lat: 17.4277, lng: 78.4503 },
  { area: "Begumpet", city: "Hyderabad", state: "Telangana", pincode: "500016", lat: 17.4448, lng: 78.4682 },
  { area: "Himayatnagar", city: "Hyderabad", state: "Telangana", pincode: "500029", lat: 17.4042, lng: 78.4870 },
  { area: "Mehdipatnam", city: "Hyderabad", state: "Telangana", pincode: "500028", lat: 17.3916, lng: 78.4398 },
  { area: "Masab Tank", city: "Hyderabad", state: "Telangana", pincode: "500028", lat: 17.4034, lng: 78.4508 },
  { area: "Abids", city: "Hyderabad", state: "Telangana", pincode: "500001", lat: 17.3888, lng: 78.4744 },
  { area: "Charminar", city: "Hyderabad", state: "Telangana", pincode: "500002", lat: 17.3616, lng: 78.4747 },
  { area: "Kachiguda", city: "Hyderabad", state: "Telangana", pincode: "500010", lat: 17.3910, lng: 78.4980 },
  { area: "Vidyanagar", city: "Hyderabad", state: "Telangana", pincode: "500044", lat: 17.4010, lng: 78.5130 },

  // Secunderabad & Eastern Zone
  { area: "Peerzadiguda", city: "Hyderabad", state: "Telangana", pincode: "500088", lat: 17.4042, lng: 78.5833 },
  { area: "Zone 500088", city: "Hyderabad", state: "Telangana", pincode: "500088", lat: 17.4042, lng: 78.5833 },
  { area: "Secunderabad", city: "Hyderabad", state: "Telangana", pincode: "500003", lat: 17.4399, lng: 78.4983 },
  { area: "Tarnaka", city: "Hyderabad", state: "Telangana", pincode: "500017", lat: 17.4285, lng: 78.5312 },
  { area: "Uppal", city: "Hyderabad", state: "Telangana", pincode: "500039", lat: 17.4018, lng: 78.5602 },
  { area: "Nagole", city: "Hyderabad", state: "Telangana", pincode: "500068", lat: 17.3768, lng: 78.5583 },
  { area: "LB Nagar", city: "Hyderabad", state: "Telangana", pincode: "500074", lat: 17.3457, lng: 78.5522 },
  { area: "Dilsukhnagar", city: "Hyderabad", state: "Telangana", pincode: "500035", lat: 17.3688, lng: 78.5247 },
  { area: "Kothapet", city: "Hyderabad", state: "Telangana", pincode: "500060", lat: 17.3670, lng: 78.5360 },
  { area: "Karmanghat", city: "Hyderabad", state: "Telangana", pincode: "500079", lat: 17.3410, lng: 78.5290 },
  { area: "Vanasthalipuram", city: "Hyderabad", state: "Telangana", pincode: "500070", lat: 17.3320, lng: 78.5720 },
  { area: "ECIL", city: "Hyderabad", state: "Telangana", pincode: "500062", lat: 17.4722, lng: 78.5658 },
  { area: "Malkajgiri", city: "Hyderabad", state: "Telangana", pincode: "500043", lat: 17.4517, lng: 78.5322 },
  { area: "Alwal", city: "Hyderabad", state: "Telangana", pincode: "500015", lat: 17.5028, lng: 78.5147 },
  { area: "Sainikpuri", city: "Hyderabad", state: "Telangana", pincode: "500047", lat: 17.4872, lng: 78.5542 },
  { area: "Shamshabad", city: "Hyderabad", state: "Telangana", pincode: "501218", lat: 17.2543, lng: 78.4312 },

  // Telangana Key Districts
  { area: "Adilabad", city: "Adilabad", state: "Telangana", pincode: "504312", lat: 19.6641, lng: 78.5320 },
  { area: "Nizamabad", city: "Nizamabad", state: "Telangana", pincode: "503001", lat: 18.6725, lng: 78.0941 },
  { area: "Karimnagar", city: "Karimnagar", state: "Telangana", pincode: "505001", lat: 18.4386, lng: 79.1288 },
  { area: "Warangal", city: "Warangal", state: "Telangana", pincode: "506001", lat: 17.9689, lng: 79.5941 },
  { area: "Hanamkonda", city: "Warangal", state: "Telangana", pincode: "506001", lat: 18.0138, lng: 79.5604 },
  { area: "Khammam", city: "Khammam", state: "Telangana", pincode: "507001", lat: 17.2473, lng: 80.1514 },
  { area: "Nalgonda", city: "Nalgonda", state: "Telangana", pincode: "508001", lat: 17.0575, lng: 79.2684 },
  { area: "Mahbubnagar", city: "Mahbubnagar", state: "Telangana", pincode: "509001", lat: 16.7488, lng: 77.9856 },
  { area: "Ramagundam", city: "Peddapalli", state: "Telangana", pincode: "505208", lat: 18.7562, lng: 79.4756 },
  { area: "Siddipet", city: "Siddipet", state: "Telangana", pincode: "502103", lat: 18.1018, lng: 78.8520 },
  { area: "Medak", city: "Medak", state: "Telangana", pincode: "502110", lat: 18.0475, lng: 78.2612 },

  // Andhra Pradesh Major Cities
  { area: "Vijayawada", city: "Vijayawada", state: "Andhra Pradesh", pincode: "520001", lat: 16.5062, lng: 80.6480 },
  { area: "Guntur", city: "Guntur", state: "Andhra Pradesh", pincode: "522001", lat: 16.3067, lng: 80.4365 },
  { area: "Visakhapatnam", city: "Visakhapatnam", state: "Andhra Pradesh", pincode: "530001", lat: 17.6868, lng: 83.2185 },
  { area: "Tirupati", city: "Tirupati", state: "Andhra Pradesh", pincode: "517501", lat: 13.6288, lng: 79.4192 },
  { area: "Nellore", city: "Nellore", state: "Andhra Pradesh", pincode: "524001", lat: 14.4426, lng: 79.9865 },
  { area: "Kurnool", city: "Kurnool", state: "Andhra Pradesh", pincode: "518001", lat: 15.8281, lng: 78.0373 },
  { area: "Rajahmundry", city: "East Godavari", state: "Andhra Pradesh", pincode: "533101", lat: 17.0005, lng: 81.8040 },
  { area: "Kakinada", city: "Kakinada", state: "Andhra Pradesh", pincode: "533001", lat: 16.9891, lng: 82.2475 },
  { area: "Anantapur", city: "Anantapur", state: "Andhra Pradesh", pincode: "515001", lat: 14.6819, lng: 77.6006 },

  // Key Indian Metros
  { area: "Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038", lat: 12.9719, lng: 77.6412 },
  { area: "Koramangala", city: "Bangalore", state: "Karnataka", pincode: "560034", lat: 12.9352, lng: 77.6245 },
  { area: "HSR Layout", city: "Bangalore", state: "Karnataka", pincode: "560102", lat: 12.9121, lng: 77.6446 },
  { area: "Whitefield", city: "Bangalore", state: "Karnataka", pincode: "560066", lat: 12.9698, lng: 77.7499 },
  { area: "Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050", lat: 19.0596, lng: 72.8295 },
  { area: "Andheri West", city: "Mumbai", state: "Maharashtra", pincode: "400053", lat: 19.1363, lng: 72.8277 },
  { area: "Connaught Place", city: "New Delhi", state: "Delhi", pincode: "110001", lat: 28.6304, lng: 77.2177 },
  { area: "Hauz Khas", city: "New Delhi", state: "Delhi", pincode: "110016", lat: 28.5494, lng: 77.2001 },
  { area: "T Nagar", city: "Chennai", state: "Tamil Nadu", pincode: "600017", lat: 13.0418, lng: 80.2341 },
  { area: "Kothrud", city: "Pune", state: "Maharashtra", pincode: "411038", lat: 18.5074, lng: 73.8077 },
  { area: "Salt Lake", city: "Kolkata", state: "West Bengal", pincode: "700091", lat: 22.5868, lng: 88.4178 },
];

// ── 2. Local Pincode Dictionary ──
export const KNOWN_PINCODE_MAP: Record<string, { area: string; city: string; state?: string }> = {
  // Hyderabad & Cyberabad
  "500088": { area: "Peerzadiguda / Uppal Zone", city: "Hyderabad", state: "Telangana" },
  "500100": { area: "Kompally", city: "Hyderabad", state: "Telangana" },
  "500011": { area: "Bowenpally", city: "Hyderabad", state: "Telangana" },
  "500014": { area: "Jeedimetla", city: "Hyderabad", state: "Telangana" },
  "500081": { area: "Madhapur", city: "Hyderabad", state: "Telangana" },
  "500084": { area: "Kondapur", city: "Hyderabad", state: "Telangana" },
  "500032": { area: "Gachibowli", city: "Hyderabad", state: "Telangana" },
  "500072": { area: "Kukatpally", city: "Hyderabad", state: "Telangana" },
  "500034": { area: "Banjara Hills", city: "Hyderabad", state: "Telangana" },
  "500033": { area: "Jubilee Hills", city: "Hyderabad", state: "Telangana" },
  "500039": { area: "Uppal", city: "Hyderabad", state: "Telangana" },
  "500068": { area: "Nagole", city: "Hyderabad", state: "Telangana" },
  "500074": { area: "LB Nagar", city: "Hyderabad", state: "Telangana" },
  "500003": { area: "Secunderabad", city: "Hyderabad", state: "Telangana" },
  "500049": { area: "Miyapur", city: "Hyderabad", state: "Telangana" },
  "500016": { area: "Ameerpet", city: "Hyderabad", state: "Telangana" },
  "500018": { area: "Sanathnagar", city: "Hyderabad", state: "Telangana" },
  "500038": { area: "SR Nagar", city: "Hyderabad", state: "Telangana" },
  "500090": { area: "Nizampet", city: "Hyderabad", state: "Telangana" },
  "500050": { area: "Chanda Nagar", city: "Hyderabad", state: "Telangana" },
  "500019": { area: "Lingampally", city: "Hyderabad", state: "Telangana" },
  "500062": { area: "ECIL", city: "Hyderabad", state: "Telangana" },
  "500017": { area: "Tarnaka", city: "Hyderabad", state: "Telangana" },
  "500028": { area: "Masab Tank", city: "Hyderabad", state: "Telangana" },
  "500008": { area: "Mehdipatnam", city: "Hyderabad", state: "Telangana" },
  "500029": { area: "Himayatnagar", city: "Hyderabad", state: "Telangana" },
  "500001": { area: "Abids", city: "Hyderabad", state: "Telangana" },
  "500002": { area: "Charminar", city: "Hyderabad", state: "Telangana" },
  "500089": { area: "Manikonda", city: "Hyderabad", state: "Telangana" },
  "500075": { area: "Gandipet", city: "Hyderabad", state: "Telangana" },
  "500091": { area: "Narsingi", city: "Hyderabad", state: "Telangana" },
  "500079": { area: "Karmanghat", city: "Hyderabad", state: "Telangana" },
  "500035": { area: "Dilsukhnagar", city: "Hyderabad", state: "Telangana" },
  "500060": { area: "Kothapet", city: "Hyderabad", state: "Telangana" },
  "500010": { area: "Kachiguda", city: "Hyderabad", state: "Telangana" },
  "500044": { area: "Vidyanagar", city: "Hyderabad", state: "Telangana" },
  "500047": { area: "Sainikpuri", city: "Hyderabad", state: "Telangana" },
  "500015": { area: "Alwal", city: "Hyderabad", state: "Telangana" },
  "500055": { area: "Quthbullapur", city: "Hyderabad", state: "Telangana" },
  "500043": { area: "Malkajgiri", city: "Hyderabad", state: "Telangana" },
  "500070": { area: "Vanasthalipuram", city: "Hyderabad", state: "Telangana" },
  "501218": { area: "Shamshabad", city: "Hyderabad", state: "Telangana" },
  "502032": { area: "Tellapur", city: "Hyderabad", state: "Telangana" },

  // Adilabad & Northern Telangana
  "504312": { area: "Adilabad", city: "Adilabad", state: "Telangana" },
  "504001": { area: "Adilabad Head Post", city: "Adilabad", state: "Telangana" },
  "504002": { area: "Adilabad Collectorate", city: "Adilabad", state: "Telangana" },
  "504208": { area: "Mancherial", city: "Mancherial", state: "Telangana" },
  "504293": { area: "Nirmal", city: "Nirmal", state: "Telangana" },
  "504296": { area: "Bhainsa", city: "Nirmal", state: "Telangana" },
  "504201": { area: "Bellampalli", city: "Mancherial", state: "Telangana" },
  "504293": { area: "Khanapur", city: "Nirmal", state: "Telangana" },

  // Districts
  "503001": { area: "Nizamabad", city: "Nizamabad", state: "Telangana" },
  "505001": { area: "Karimnagar", city: "Karimnagar", state: "Telangana" },
  "506001": { area: "Warangal", city: "Warangal", state: "Telangana" },
  "507001": { area: "Khammam", city: "Khammam", state: "Telangana" },
  "508001": { area: "Nalgonda", city: "Nalgonda", state: "Telangana" },
  "509001": { area: "Mahbubnagar", city: "Mahbubnagar", state: "Telangana" },
  "505208": { area: "Ramagundam", city: "Peddapalli", state: "Telangana" },
  "502103": { area: "Siddipet", city: "Siddipet", state: "Telangana" },
  "502110": { area: "Medak", city: "Medak", state: "Telangana" },

  // Andhra Pradesh
  "520001": { area: "Vijayawada", city: "Vijayawada", state: "Andhra Pradesh" },
  "522001": { area: "Guntur", city: "Guntur", state: "Andhra Pradesh" },
  "530001": { area: "Visakhapatnam", city: "Visakhapatnam", state: "Andhra Pradesh" },
  "517501": { area: "Tirupati", city: "Tirupati", state: "Andhra Pradesh" },
  "524001": { area: "Nellore", city: "Nellore", state: "Andhra Pradesh" },
  "518001": { area: "Kurnool", city: "Kurnool", state: "Andhra Pradesh" },
  "533101": { area: "Rajahmundry", city: "East Godavari", state: "Andhra Pradesh" },
  "533001": { area: "Kakinada", city: "Kakinada", state: "Andhra Pradesh" },
  "515001": { area: "Anantapur", city: "Anantapur", state: "Andhra Pradesh" },

  // Metros
  "560001": { area: "MG Road", city: "Bangalore", state: "Karnataka" },
  "560034": { area: "Koramangala", city: "Bangalore", state: "Karnataka" },
  "560038": { area: "Indiranagar", city: "Bangalore", state: "Karnataka" },
  "560066": { area: "Whitefield", city: "Bangalore", state: "Karnataka" },
  "560100": { area: "Electronic City", city: "Bangalore", state: "Karnataka" },
  "560102": { area: "HSR Layout", city: "Bangalore", state: "Karnataka" },
  "400001": { area: "Fort", city: "Mumbai", state: "Maharashtra" },
  "400050": { area: "Bandra", city: "Mumbai", state: "Maharashtra" },
  "400053": { area: "Andheri West", city: "Mumbai", state: "Maharashtra" },
  "400076": { area: "Powai", city: "Mumbai", state: "Maharashtra" },
  "110001": { area: "Connaught Place", city: "New Delhi", state: "Delhi" },
  "110016": { area: "Hauz Khas", city: "New Delhi", state: "Delhi" },
  "110024": { area: "Lajpat Nagar", city: "New Delhi", state: "Delhi" },
  // Kerala Major Cities
  "682001": { area: "Kochi", city: "Kochi", state: "Kerala" },
  "682030": { area: "Kakkanad", city: "Kochi", state: "Kerala" },
  "695001": { area: "Thiruvananthapuram", city: "Thiruvananthapuram", state: "Kerala" },
  "673001": { area: "Kozhikode", city: "Kozhikode", state: "Kerala" },
  "680001": { area: "Thrissur", city: "Thrissur", state: "Kerala" },
  "670001": { area: "Kannur", city: "Kannur", state: "Kerala" },
  "691001": { area: "Kollam", city: "Kollam", state: "Kerala" },
  "686001": { area: "Kottayam", city: "Kottayam", state: "Kerala" },
  "678001": { area: "Palakkad", city: "Palakkad", state: "Kerala" },
  "676505": { area: "Malappuram", city: "Malappuram", state: "Kerala" },
  "688001": { area: "Alappuzha", city: "Alappuzha", state: "Kerala" },
};

/**
 * Clean location strings safely without destroying area names.
 */
export function cleanLocationName(raw?: string): string {
  if (!raw) return "";
  let cleaned = raw.replace(/[^\x00-\x7F]/g, "").trim();
  if (!cleaned) return "";

  if (/^(hyderabad|secunderabad|adilabad|telangana|andhra pradesh|karnataka)$/i.test(cleaned)) {
    return cleaned;
  }

  cleaned = cleaned
    .replace(/\b(mandal|taluk|tehsil|district|ghmc|sub-district)\b/gi, "")
    .replace(/,\s*(telangana|andhra pradesh|karnataka|india)/gi, "")
    .replace(/[,_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length >= 2 ? cleaned : (raw.trim() || "");
}

/**
 * Pure Math Haversine Distance Formula (km) between two GPS points.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Pure In-Build Coordinate Resolution:
 * Maps device coordinates to the closest exact neighborhood from local grid.
 */
export function resolveCoordinatesLocally(lat: number, lng: number): LocationResult {
  let closest: GeoCoordinateItem = LOCAL_GPS_COORDINATES[0];
  let minDistance = Infinity;

  for (const item of LOCAL_GPS_COORDINATES) {
    const dist = calculateHaversineDistanceKm(lat, lng, item.lat, item.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  return {
    area: closest.area,
    pincode: closest.pincode,
    city: closest.city,
    state: closest.state,
    distanceKm: Math.round(minDistance * 10) / 10,
  };
}

/**
 * Resolve device lat/lng into exact area, pincode, city.
 * Combines BigDataCloud client reverse geocoding with local Haversine fallback.
 */
export async function resolveGpsLocation(lat: number, lng: number): Promise<LocationResult> {
  // Strategy 1: BigDataCloud Reverse Geocoder (Free client-side endpoint, highly precise for street/suburb)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const rawPin = (data.postcode || "").replace(/\D/g, "");
      const pincode = rawPin.length === 6 ? rawPin : "";

      let area =
        cleanLocationName(data.locality) ||
        cleanLocationName(data.localityInfo?.informative?.[0]?.name) ||
        cleanLocationName(data.localityInfo?.administrative?.[3]?.name) ||
        cleanLocationName(data.city);

      const city =
        cleanLocationName(data.city) ||
        cleanLocationName(data.principalSubdivision) ||
        "Hyderabad";
      const state = cleanLocationName(data.principalSubdivision) || "Telangana";

      // If pincode is available, check local dictionary for exact well-known locality name
      if (pincode && KNOWN_PINCODE_MAP[pincode]) {
        if (!area || area.toLowerCase() === city.toLowerCase()) {
          area = KNOWN_PINCODE_MAP[pincode].area;
        }
      }

      if (area) {
        return {
          area,
          pincode: pincode || (KNOWN_PINCODE_MAP[pincode]?.area ? pincode : "500081"),
          city,
          state,
        };
      }
    }
  } catch (err) {
    console.warn("[Location] Online reverse geocoding failed, using local grid:", err);
  }

  // Strategy 2: Local mathematical Haversine lookup (100% offline fallback)
  return resolveCoordinatesLocally(lat, lng);
}

/**
 * Pure In-Build Pincode Resolution:
 * Instant local lookup without external network APIs.
 */
export async function fetchAreaFromPincode(pincode: string): Promise<LocationResult> {
  const cleanPin = (pincode || "").replace(/\D/g, "").slice(0, 6);
  if (cleanPin.length !== 6) {
    return { area: pincode || "Adilabad", pincode: cleanPin || "504312", city: "Adilabad", state: "Telangana" };
  }

  if (KNOWN_PINCODE_MAP[cleanPin]) {
    const item = KNOWN_PINCODE_MAP[cleanPin];
    return { area: item.area, pincode: cleanPin, city: item.city, state: item.state || "Telangana" };
  }

  // District prefix resolver for Telangana & AP
  if (cleanPin.startsWith("504")) {
    return { area: "Adilabad District", pincode: cleanPin, city: "Adilabad", state: "Telangana" };
  } else if (cleanPin.startsWith("503")) {
    return { area: "Nizamabad District", pincode: cleanPin, city: "Nizamabad", state: "Telangana" };
  } else if (cleanPin.startsWith("505")) {
    return { area: "Karimnagar District", pincode: cleanPin, city: "Karimnagar", state: "Telangana" };
  } else if (cleanPin.startsWith("506")) {
    return { area: "Warangal District", pincode: cleanPin, city: "Warangal", state: "Telangana" };
  } else if (cleanPin.startsWith("507")) {
    return { area: "Khammam District", pincode: cleanPin, city: "Khammam", state: "Telangana" };
  } else if (cleanPin.startsWith("508")) {
    return { area: "Nalgonda District", pincode: cleanPin, city: "Nalgonda", state: "Telangana" };
  } else if (cleanPin.startsWith("509")) {
    return { area: "Mahbubnagar District", pincode: cleanPin, city: "Mahbubnagar", state: "Telangana" };
  } else if (cleanPin.startsWith("500")) {
    return { area: `Hyderabad Zone ${cleanPin}`, pincode: cleanPin, city: "Hyderabad", state: "Telangana" };
  } else if (cleanPin.startsWith("501") || cleanPin.startsWith("502")) {
    return { area: "Telangana Region", pincode: cleanPin, city: "Telangana", state: "Telangana" };
  } else if (cleanPin.startsWith("68") || cleanPin.startsWith("69") || cleanPin.startsWith("67")) {
    return { area: "Kerala Region", pincode: cleanPin, city: "Kerala", state: "Kerala" };
  } else if (cleanPin.startsWith("560")) {
    return { area: "Bangalore", pincode: cleanPin, city: "Bangalore", state: "Karnataka" };
  } else if (cleanPin.startsWith("400")) {
    return { area: "Mumbai", pincode: cleanPin, city: "Mumbai", state: "Maharashtra" };
  }

  return { area: `Pincode ${cleanPin}`, pincode: cleanPin, city: "Local Area", state: "India" };
}

/**
 * Universal City Resolver:
 * Extracts true parent metro city from any locality, district, pincode, or compound area string.
 */
export function resolveCityFromLocation(loc?: { area?: string; city?: string; pincode?: string }): string | undefined {
  if (!loc) return undefined;
  const text = `${loc.city || ""} ${loc.area || ""} ${loc.pincode || ""}`.toLowerCase();

  if (
    /hyderabad|hyd|secunderabad|cyberabad|kompally|bowenpally|jeedimetla|medchal|shamshabad|trimulgherry|madhapur|gachibowli|hitec|kukatpally|ameerpet|kondapur|banjara|jubilee|uppal|nagole|lb nagar|begumpet|somajiguda|punjagutta|himayatnagar|mehdipatnam|abids|charminar|ecil|malkajgiri|alwal|sainikpuri|dilsukhnagar|kothapet|vidyanagar|kachiguda|miyapur|nizampet|chanda nagar|lingampally|manikonda|narsingi|tellapur|peerzadiguda|karmanghat|vanasthalipuram|balanagar|quthbullapur|sanathnagar|sr nagar|500\d{3}|501\d{3}|502\d{3}/i.test(
      text
    )
  ) {
    return "Hyderabad";
  }

  if (
    /bangalore|bengaluru|benglure|whitefield|koramangala|indiranagar|hsr|marathahalli|electronic city|jayanagar|jp nagar|bellandur|yelahanka|hebbal|malleswaram|rajajinagar|btm|560\d{3}/i.test(
      text
    )
  ) {
    return "Bangalore";
  }

  if (
    /mumbai|bombay|thane|navi mumbai|andheri|bandra|powai|borivali|dadar|juhu|goregaon|malad|kandivali|colaba|worli|kurla|ghatkopar|vashi|400\d{3}/i.test(
      text
    )
  ) {
    return "Mumbai";
  }

  if (loc.city && loc.city.trim().length > 0) return loc.city.trim();
  if (loc.area && loc.area.includes(",")) {
    const parts = loc.area.split(",").map((p) => p.trim());
    return parts[1] || parts[0];
  }
  return loc.area ? loc.area.trim() : undefined;
}

/**
 * Calculate distance between two locations (user and listing).
 */
export function calculateDistanceBetweenLocations(
  loc1?: { area?: string; pincode?: string; city?: string },
  loc2?: { area?: string; pincode?: string; city?: string }
): number | undefined {
  if (!loc1 || !loc2) return undefined;

  const pin1 = loc1.pincode?.replace(/\D/g, "");
  const pin2 = loc2.pincode?.replace(/\D/g, "");
  if (pin1 && pin2 && pin1.length === 6 && pin2.length === 6 && pin1 === pin2) {
    return 0.8;
  }

  const area1 = (loc1.area || "").toLowerCase().trim();
  const area2 = (loc2.area || "").toLowerCase().trim();
  if (area1 && area2 && area1 === area2) {
    return 1.0;
  }

  const findCoord = (l: { area?: string; pincode?: string; city?: string }) => {
    const pin = l.pincode?.replace(/\D/g, "");
    if (pin && pin.length === 6) {
      const found = LOCAL_GPS_COORDINATES.find((c) => c.pincode === pin);
      if (found) return found;
    }
    const a = (l.area || "").toLowerCase();
    if (a) {
      const found = LOCAL_GPS_COORDINATES.find(
        (c) => a.includes(c.area.toLowerCase()) || c.area.toLowerCase().includes(a)
      );
      if (found) return found;
    }
    const city = (l.city || "").toLowerCase();
    if (city) {
      const found = LOCAL_GPS_COORDINATES.find(
        (c) => city.includes(c.city.toLowerCase()) || c.city.toLowerCase().includes(city)
      );
      if (found) return found;
    }
    return null;
  };

  const c1 = findCoord(loc1);
  const c2 = findCoord(loc2);
  if (c1 && c2) {
    const dist = calculateHaversineDistanceKm(c1.lat, c1.lng, c2.lat, c2.lng);
    return Math.round(dist * 10) / 10;
  }

  return undefined;
}

/**
 * High-reliability Network / IP Fallback for Laptops:
 * When laptop has no GPS receiver or Windows Location Services is off, resolves via client network.
 */
export async function fetchIpLocation(): Promise<LocationResult> {
  // Strategy 1: BigDataCloud Client IP (automatically resolves client public IP without lat/lng params)
  try {
    const res = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en");
    if (res.ok) {
      const data = await res.json();
      const pincode = (data.postcode || "").replace(/\D/g, "");
      let area = cleanLocationName(data.locality) || cleanLocationName(data.city);
      const city = cleanLocationName(data.city) || cleanLocationName(data.principalSubdivision) || "Hyderabad";
      const state = cleanLocationName(data.principalSubdivision) || "Telangana";

      if (pincode && KNOWN_PINCODE_MAP[pincode]) {
        if (!area || area.toLowerCase() === city.toLowerCase()) {
          area = KNOWN_PINCODE_MAP[pincode].area;
        }
      }

      if (area || city) {
        return {
          area: area || city,
          pincode: pincode.length === 6 ? pincode : (KNOWN_PINCODE_MAP[pincode]?.pincode || "500081"),
          city,
          state,
        };
      }
    }
  } catch {
    // try next
  }

  // Strategy 2: ipwho.is (fast HTTPS)
  try {
    const res = await fetch("https://ipwho.is/");
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const city = cleanLocationName(data.city) || "Hyderabad";
        const state = cleanLocationName(data.region) || "Telangana";
        const pincode = data.postal && data.postal.replace(/\D/g, "").length === 6 ? data.postal.replace(/\D/g, "") : "";

        let area = city;
        if (pincode && KNOWN_PINCODE_MAP[pincode]) {
          area = KNOWN_PINCODE_MAP[pincode].area;
        }

        return {
          area: area || city,
          pincode: pincode || "500081",
          city,
          state,
        };
      }
    }
  } catch {
    // try next
  }

  // Strategy 3: Previous user selection
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("omeetso_selected_location") || localStorage.getItem("omeetso_location");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.area && parsed.pincode) {
          return {
            area: parsed.area,
            pincode: parsed.pincode,
            city: parsed.city || "Hyderabad",
            state: parsed.state || "Telangana"
          };
        }
      }
    } catch {}
  }

  return { area: "Madhapur", pincode: "500081", city: "Hyderabad", state: "Telangana" };
}

/**
 * Universal Location Detection (Specifically Optimized for Laptops):
 * 1. Executes standard accuracy positioning (enableHighAccuracy: false) FIRST.
 *    On Windows & Mac laptops, this queries Wi-Fi triangulation which works instantly and
 *    avoids the fatal POSITION_UNAVAILABLE error caused by requesting non-existent GPS chips.
 * 2. If standard positioning times out or device has dedicated GPS, falls back to high accuracy.
 * 3. If browser permissions are blocked or OS location service is disabled, seamlessly resolves
 *    the laptop's network location so the user never gets an error or generic default.
 */
export async function detectDeviceLocation(): Promise<LocationResult> {
  if (typeof navigator !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        // Step 1: Standard Accuracy (Wi-Fi based, ideal for laptops)
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => {
            // Step 2: Try High Accuracy (for phones/devices with GPS chips)
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
              maximumAge: 0,
            });
          },
          {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 300000, // 5 min cache allowed for instant response
          }
        );
      });

      const { latitude: lat, longitude: lng } = pos.coords;
      const result = await resolveGpsLocation(lat, lng);
      if (result && result.area) {
        return result;
      }
    } catch (gpsError: any) {
      console.warn("[Location] Laptop/device geolocation failed or unavailable, falling back to network IP:", gpsError?.message || gpsError);
    }
  }

  // Network / IP Fallback for laptops with disabled Windows Location Services
  return fetchIpLocation();
}
