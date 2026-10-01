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

  const isNearby = minDistance <= 10;

  return {
    area: isNearby ? closest.area : closest.city,
    pincode: isNearby ? closest.pincode : "",
    city: closest.city,
    state: closest.state,
    distanceKm: Math.round(minDistance * 10) / 10,
  };
}

export interface LocationSuggestion {
  id: string;
  area: string;
  city: string;
  state?: string;
  pincode: string;
  displayName: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
  source?: "gps" | "postal" | "osm" | "local";
}

export const POPULAR_LOCATIONS: LocationSuggestion[] = [
  { id: "pop-1", area: "Madhapur", city: "Hyderabad", state: "Telangana", pincode: "500081", displayName: "Madhapur", secondaryText: "Hyderabad, Telangana", source: "local" },
  { id: "pop-2", area: "Gachibowli", city: "Hyderabad", state: "Telangana", pincode: "500032", displayName: "Gachibowli", secondaryText: "Hyderabad, Telangana", source: "local" },
  { id: "pop-3", area: "Kondapur", city: "Hyderabad", state: "Telangana", pincode: "500084", displayName: "Kondapur", secondaryText: "Hyderabad, Telangana", source: "local" },
  { id: "pop-4", area: "Kukatpally", city: "Hyderabad", state: "Telangana", pincode: "500072", displayName: "Kukatpally", secondaryText: "Hyderabad, Telangana", source: "local" },
  { id: "pop-5", area: "Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034", displayName: "Banjara Hills", secondaryText: "Hyderabad, Telangana", source: "local" },
  { id: "pop-6", area: "Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: "500033", displayName: "Jubilee Hills", secondaryText: "Hyderabad, Telangana", source: "local" },
  { id: "pop-7", area: "Secunderabad", city: "Hyderabad", state: "Telangana", pincode: "500003", displayName: "Secunderabad", secondaryText: "Hyderabad, Telangana", source: "local" },
  { id: "pop-8", area: "Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038", displayName: "Indiranagar", secondaryText: "Bangalore, Karnataka", source: "local" },
  { id: "pop-9", area: "Koramangala", city: "Bangalore", state: "Karnataka", pincode: "560034", displayName: "Koramangala", secondaryText: "Bangalore, Karnataka", source: "local" },
  { id: "pop-10", area: "Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050", displayName: "Bandra West", secondaryText: "Mumbai, Maharashtra", source: "local" },
  { id: "pop-11", area: "Connaught Place", city: "New Delhi", state: "Delhi", pincode: "110001", displayName: "Connaught Place", secondaryText: "New Delhi, Delhi", source: "local" },
  { id: "pop-12", area: "Adilabad", city: "Adilabad", state: "Telangana", pincode: "504312", displayName: "Adilabad", secondaryText: "Adilabad, Telangana", source: "local" },
];

/**
 * Resolve device lat/lng into exact area, pincode, city.
 * Combines OpenStreetMap Nominatim (gold standard for Indian postcodes),
 * Komoot Photon reverse geocoder, BigDataCloud, and local Haversine fallback.
 */
export async function resolveGpsLocation(lat: number, lng: number): Promise<LocationResult> {
  // Strategy 1: OpenStreetMap Nominatim Reverse Geocoding (Highest accuracy for exact Indian Postal pincodes)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      const rawPin = (addr.postcode || "").replace(/\D/g, "");
      const pincode = rawPin.length === 6 ? rawPin : "";

      let area = cleanLocationName(
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.city_district ||
        addr.quarter ||
        addr.village ||
        addr.hamlet ||
        addr.town ||
        nomData.name
      );

      const city = cleanLocationName(
        addr.city ||
        addr.town ||
        addr.county ||
        addr.state_district ||
        "Hyderabad"
      );
      const state = cleanLocationName(addr.state || "Telangana");

      // Cross-reference with India Post or Known Pincode dictionary if pincode is present
      if (pincode && KNOWN_PINCODE_MAP[pincode]) {
        if (!area || area.toLowerCase() === city.toLowerCase()) {
          area = KNOWN_PINCODE_MAP[pincode].area;
        }
      }

      if (area || pincode) {
        return {
          area: area || city,
          pincode,
          city,
          state,
        };
      }
    }
  } catch (err) {
    console.warn("[Location] Nominatim reverse geocoding failed, trying Photon:", err);
  }

  // Strategy 2: Komoot Photon Reverse Geocoding (Supports CORS and exact OSM tags)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const photonRes = await fetch(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (photonRes.ok) {
      const photonData = await photonRes.json();
      const feat = photonData.features?.[0];
      if (feat && feat.properties) {
        const props = feat.properties;
        const rawPin = (props.postcode || "").replace(/\D/g, "");
        const pincode = rawPin.length === 6 ? rawPin : "";
        const area = cleanLocationName(props.name || props.district || props.city || props.street);
        const city = cleanLocationName(props.city || props.district || props.county || "Hyderabad");
        const state = cleanLocationName(props.state || "Telangana");

        if (area || pincode) {
          return {
            area: area || city,
            pincode,
            city,
            state,
          };
        }
      }
    }
  } catch (err) {
    console.warn("[Location] Photon reverse geocoding failed, trying BigDataCloud:", err);
  }

  // Strategy 3: BigDataCloud Reverse Geocoder
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
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

      if (pincode && KNOWN_PINCODE_MAP[pincode]) {
        if (!area || area.toLowerCase() === city.toLowerCase()) {
          area = KNOWN_PINCODE_MAP[pincode].area;
        }
      }

      if (area || pincode) {
        return {
          area: area || city,
          pincode,
          city,
          state,
        };
      }
    }
  } catch (err) {
    console.warn("[Location] BigDataCloud reverse geocoding failed, checking local grid:", err);
  }

  // Strategy 4: Local mathematical Haversine lookup (100% offline fallback)
  return resolveCoordinatesLocally(lat, lng);
}

/**
 * Universal Pincode Resolution:
 * 1. Instant local dictionary lookup
 * 2. Real-time official India Post API for all 19,000+ Indian pincodes
 * 3. District prefix fallback
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

  // Real-time India Post API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        return {
          area: po.Name,
          pincode: cleanPin,
          city: po.District || po.Division || po.Circle || "India",
          state: po.State || "India"
        };
      }
    }
  } catch {
    // fallback
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
 * High-reliability Network / IP Fallback for Laptops and Desktop PCs:
 * 1. Resolves client network public IP to coordinates and postal codes using ipwho.is & ipapi.co.
 * 2. Runs reverse geocoding on the resolved coordinates to get the real neighborhood & pincode.
 */
export async function fetchIpLocation(): Promise<LocationResult> {
  // Strategy 1: ipwho.is (fast HTTPS, returns postal and lat/lng)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const city = cleanLocationName(data.city) || "Hyderabad";
        const state = cleanLocationName(data.region) || "Telangana";
        const rawPin = (data.postal || "").replace(/\D/g, "");
        const ipPin = rawPin.length === 6 ? rawPin : "";

        // If coordinates are provided by IP provider, reverse geocode to get true street/suburb & postal code
        if (data.latitude && data.longitude) {
          try {
            const resolved = await resolveGpsLocation(data.latitude, data.longitude);
            if (resolved && (resolved.pincode || resolved.area)) {
              return {
                area: resolved.area || city,
                pincode: resolved.pincode || ipPin,
                city: resolved.city || city,
                state: resolved.state || state,
              };
            }
          } catch {
            // continue with raw IP fields
          }
        }

        let area = city;
        if (ipPin && KNOWN_PINCODE_MAP[ipPin]) {
          area = KNOWN_PINCODE_MAP[ipPin].area;
        }

        if (area || ipPin) {
          return {
            area,
            pincode: ipPin,
            city,
            state,
          };
        }
      }
    }
  } catch {
    // try next
  }

  // Strategy 2: ipapi.co (HTTPS, returns postal code & lat/lng)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.city) {
        const city = cleanLocationName(data.city) || "Hyderabad";
        const state = cleanLocationName(data.region) || "Telangana";
        const rawPin = (data.postal || "").replace(/\D/g, "");
        const ipPin = rawPin.length === 6 ? rawPin : "";

        if (data.latitude && data.longitude) {
          try {
            const resolved = await resolveGpsLocation(data.latitude, data.longitude);
            if (resolved && (resolved.pincode || resolved.area)) {
              return {
                area: resolved.area || city,
                pincode: resolved.pincode || ipPin,
                city: resolved.city || city,
                state: resolved.state || state,
              };
            }
          } catch {
            // continue
          }
        }

        let area = city;
        if (ipPin && KNOWN_PINCODE_MAP[ipPin]) {
          area = KNOWN_PINCODE_MAP[ipPin].area;
        }

        return {
          area,
          pincode: ipPin,
          city,
          state,
        };
      }
    }
  } catch {
    // try next
  }

  // Strategy 3: BigDataCloud Client IP
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const rawPin = (data.postcode || "").replace(/\D/g, "");
      const pincode = rawPin.length === 6 ? rawPin : "";
      let area = cleanLocationName(data.locality) || cleanLocationName(data.city);
      const city = cleanLocationName(data.city) || cleanLocationName(data.principalSubdivision) || "Hyderabad";
      const state = cleanLocationName(data.principalSubdivision) || "Telangana";

      if (pincode && KNOWN_PINCODE_MAP[pincode]) {
        if (!area || area.toLowerCase() === city.toLowerCase()) {
          area = KNOWN_PINCODE_MAP[pincode].area;
        }
      }

      if (area || pincode) {
        return {
          area: area || city,
          pincode,
          city,
          state,
        };
      }
    }
  } catch {
    // try next
  }

  // Strategy 4: Previous user selection
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("omeetso_selected_location") || localStorage.getItem("omeetso_location");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.area) {
          return {
            area: parsed.area,
            pincode: parsed.pincode || "",
            city: parsed.city || parsed.area,
            state: parsed.state || "",
          };
        }
      }
    } catch {}
  }

  return { area: "Hyderabad", pincode: "", city: "Hyderabad", state: "Telangana" };
}

/**
 * Universal Device Geolocation (Optimized for both Phones and Laptops):
 * - Mobile: Uses dedicated GPS hardware with high accuracy.
 * - Laptop / PC: Queries Wi-Fi positioning first to avoid GPS chip sensor timeouts,
 *   and seamlessly resolves exact neighborhood and pincode via network coordinates.
 */
export async function detectDeviceLocation(): Promise<LocationResult> {
  if (typeof window === "undefined") {
    throw new Error("Geolocation is not supported in this environment.");
  }

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1 && window.innerWidth < 768);

  // Check if browser permission was explicitly blocked beforehand
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const perm = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      if (perm.state === "denied") {
        throw new Error(
          "PERMISSION_DENIED: Location access is blocked in your browser. Please allow location access in your address bar (lock / settings icon) and try again."
        );
      }
    } catch (e: any) {
      if (e?.message?.includes("PERMISSION_DENIED")) throw e;
    }
  }

  // 1. Try Browser Geolocation
  if (navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (isMobile) {
          // Phones have GPS chips: use high accuracy directly
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        } else {
          // Laptops don't have GPS chips: use Wi-Fi positioning (enableHighAccuracy: false)
          // to avoid Windows POSITION_UNAVAILABLE or Sensor timeout errors
          navigator.geolocation.getCurrentPosition(
            resolve,
            (err) => {
              if (err.code === 1) {
                reject(err); // User clicked Deny
                return;
              }
              // Second attempt on laptop with high accuracy
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 4000,
                maximumAge: 0,
              });
            },
            {
              enableHighAccuracy: false,
              timeout: 4500,
              maximumAge: 60000,
            }
          );
        }
      });

      const { latitude: lat, longitude: lng } = pos.coords;
      const result = await resolveGpsLocation(lat, lng);
      if (result && (result.area || result.pincode)) {
        return result;
      }
    } catch (err: any) {
      if (err.code === 1 || err?.message?.includes("PERMISSION_DENIED")) {
        throw new Error(
          "PERMISSION_DENIED: Location permission was denied. Please click the lock or settings icon in your browser address bar and allow location access."
        );
      }
      console.warn("[Location] Laptop/device hardware GPS unavailable, resolving via high-accuracy IP positioning:", err?.message || err);
    }
  }

  // 2. High-precision Network IP Fallback (for Laptops where Windows Location is off or no GPS chip)
  const ipResult = await fetchIpLocation();
  if (ipResult && (ipResult.area || ipResult.pincode)) {
    return ipResult;
  }

  throw new Error("Could not detect your location. Please type your area or 6-digit pincode in the search box.");
}

/**
 * Universal Location & Pincode Search Engine
 * Integrates:
 * 1. Fast offline local dictionary (0ms)
 * 2. Real-time Official India Post Pincode API
 * 3. Real-time India Post Office locality lookup API
 * 4. Komoot Photon OpenStreetMap Geocoding API
 * 5. OpenStreetMap Nominatim Geocoding API
 */
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const q = query.trim();
  if (!q) return [];

  const results: LocationSuggestion[] = [];
  const seenKeys = new Set<string>();

  const addResult = (item: LocationSuggestion) => {
    // Normalize key for deduplication
    const normArea = item.area.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normCity = (item.city || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const normPin = (item.pincode || "").replace(/\D/g, "");
    const key = `${normArea}_${normCity}_${normPin}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      results.push(item);
    }
  };

  const digits = q.replace(/\D/g, "");
  const isPincodeSearch = digits.length >= 2 && digits.length === q.length;

  // 1. Instant Local offline lookup
  if (isPincodeSearch) {
    for (const [pin, info] of Object.entries(KNOWN_PINCODE_MAP)) {
      if (pin.startsWith(digits)) {
        addResult({
          id: `local-pin-${pin}`,
          area: info.area,
          city: info.city,
          state: info.state || "Telangana",
          pincode: pin,
          displayName: info.area,
          secondaryText: `${info.city}${info.state ? `, ${info.state}` : ""}`,
          source: "local",
        });
      }
    }
    for (const item of LOCAL_GPS_COORDINATES) {
      if (item.pincode.startsWith(digits)) {
        addResult({
          id: `local-coord-${item.pincode}-${item.area}`,
          area: item.area,
          city: item.city,
          state: item.state,
          pincode: item.pincode,
          displayName: item.area,
          secondaryText: `${item.city}, ${item.state}`,
          lat: item.lat,
          lng: item.lng,
          source: "local",
        });
      }
    }
  } else {
    const lowerQ = q.toLowerCase();
    for (const item of LOCAL_GPS_COORDINATES) {
      if (
        item.area.toLowerCase().includes(lowerQ) ||
        item.city.toLowerCase().includes(lowerQ) ||
        item.state.toLowerCase().includes(lowerQ)
      ) {
        addResult({
          id: `local-coord-${item.area}-${item.pincode}`,
          area: item.area,
          city: item.city,
          state: item.state,
          pincode: item.pincode,
          displayName: item.area,
          secondaryText: `${item.city}, ${item.state}`,
          lat: item.lat,
          lng: item.lng,
          source: "local",
        });
      }
    }
    for (const [pin, info] of Object.entries(KNOWN_PINCODE_MAP)) {
      if (
        info.area.toLowerCase().includes(lowerQ) ||
        info.city.toLowerCase().includes(lowerQ)
      ) {
        addResult({
          id: `local-known-${pin}`,
          area: info.area,
          city: info.city,
          state: info.state || "Telangana",
          pincode: pin,
          displayName: info.area,
          secondaryText: `${info.city}${info.state ? `, ${info.state}` : ""}`,
          source: "local",
        });
      }
    }
  }

  // 2. Third-Party API 1: India Postal Pincode API (when 6 digits are typed)
  if (digits.length === 6) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://api.postalpincode.in/pincode/${digits}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0].PostOffice)) {
          for (const po of data[0].PostOffice) {
            const area = po.Name;
            const city = po.District || po.Division || po.Circle || "India";
            const state = po.State || "";
            const pin = po.Pincode || digits;
            addResult({
              id: `postal-${pin}-${area}`,
              area,
              city,
              state,
              pincode: pin,
              displayName: area,
              secondaryText: `${city}${state ? `, ${state}` : ""}`,
              source: "postal",
            });
          }
        }
      }
    } catch {
      // ignore network errors
    }
  }

  // 3. Third-Party API 2: India Post Office Search (when query is text with >= 3 characters)
  if (!isPincodeSearch && q.length >= 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0].PostOffice)) {
          for (const po of data[0].PostOffice.slice(0, 10)) {
            const area = po.Name;
            const city = po.District || po.Division || "India";
            const state = po.State || "";
            const pin = po.Pincode || "";
            addResult({
              id: `postal-po-${pin}-${area}`,
              area,
              city,
              state,
              pincode: pin,
              displayName: area,
              secondaryText: `${city}${state ? `, ${state}` : ""}`,
              source: "postal",
            });
          }
        }
      }
    } catch {
      // ignore network errors
    }
  }

  // 4. Third-Party API 3: Photon / OpenStreetMap Geocoding (Great for places, localities, landmarks)
  if (!isPincodeSearch && q.length >= 2) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10&lang=en`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.features)) {
          for (const feat of data.features) {
            const props = feat.properties || {};
            const isIndia = props.countrycode === "IN" || /india/i.test(props.country || "");
            if (!isIndia && props.countrycode && props.countrycode !== "IN") continue;

            const area = props.name || props.district || props.city || q;
            const city = props.city || props.district || props.county || props.state || "India";
            const state = props.state || "";
            const pincode = props.postcode ? props.postcode.replace(/\D/g, "") : "";
            const lat = feat.geometry?.coordinates?.[1];
            const lng = feat.geometry?.coordinates?.[0];

            const secondaryParts = [props.district, props.city, props.state]
              .filter(Boolean)
              .filter((v, idx, arr) => arr.indexOf(v) === idx && v.toLowerCase() !== area.toLowerCase());

            addResult({
              id: `photon-${feat.properties.osm_id || Math.random()}`,
              area,
              city,
              state,
              pincode: pincode.length === 6 ? pincode : "",
              displayName: area,
              secondaryText: secondaryParts.length > 0 ? secondaryParts.join(", ") : (state || "India"),
              lat,
              lng,
              source: "osm",
            });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 5. Third-Party API 4: OpenStreetMap Nominatim (if results are still low)
  if (results.length < 3 && q.length >= 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", India")}&addressdetails=1&limit=6&countrycodes=in`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          for (const item of list) {
            const addr = item.address || {};
            const area = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || addr.city || item.name || q;
            const city = addr.city || addr.town || addr.county || addr.state_district || "India";
            const state = addr.state || "";
            const pin = (addr.postcode || "").replace(/\D/g, "");

            addResult({
              id: `nominatim-${item.place_id}`,
              area,
              city,
              state,
              pincode: pin.length === 6 ? pin : "",
              displayName: area,
              secondaryText: `${city}${state ? `, ${state}` : ""}`,
              lat: item.lat ? parseFloat(item.lat) : undefined,
              lng: item.lon ? parseFloat(item.lon) : undefined,
              source: "osm",
            });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return results.slice(0, 25);
}

