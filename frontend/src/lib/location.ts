// Centralized location and pincode resolution service for Omeetso

export interface LocationResult {
  area: string;
  pincode: string;
  city: string;
  state?: string;
}

// Known pincodes map for instant offline / fallback resolution (Hyderabad & Major AP/Telangana regions + key Indian metro hubs)
export const KNOWN_PINCODE_MAP: Record<string, { area: string; city: string; state?: string }> = {
  // Hyderabad / Cyberabad / Secunderabad
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
  "504312": { area: "Adilabad", city: "Adilabad", state: "Telangana" },

  // Bangalore
  "560001": { area: "MG Road", city: "Bangalore", state: "Karnataka" },
  "560034": { area: "Koramangala", city: "Bangalore", state: "Karnataka" },
  "560038": { area: "Indiranagar", city: "Bangalore", state: "Karnataka" },
  "560066": { area: "Whitefield", city: "Bangalore", state: "Karnataka" },
  "560100": { area: "Electronic City", city: "Bangalore", state: "Karnataka" },
  "560102": { area: "HSR Layout", city: "Bangalore", state: "Karnataka" },

  // Mumbai
  "400001": { area: "Fort", city: "Mumbai", state: "Maharashtra" },
  "400050": { area: "Bandra", city: "Mumbai", state: "Maharashtra" },
  "400053": { area: "Andheri West", city: "Mumbai", state: "Maharashtra" },
  "400076": { area: "Powai", city: "Mumbai", state: "Maharashtra" },

  // Delhi
  "110001": { area: "Connaught Place", city: "New Delhi", state: "Delhi" },
  "110016": { area: "Hauz Khas", city: "New Delhi", state: "Delhi" },
  "110024": { area: "Lajpat Nagar", city: "New Delhi", state: "Delhi" },
};

// Cache for pincode lookups during session
const pincodeCache = new Map<string, LocationResult>();

/**
 * Clean raw location names safely without destroying area names containing city names.
 */
export function cleanLocationName(raw?: string): string {
  if (!raw) return "";
  let cleaned = raw.replace(/[^\x00-\x7F]/g, "").trim();
  if (!cleaned) return "";

  // If the string is purely city or state name, return it as is
  if (/^(hyderabad|secunderabad|adilabad|telangana|andhra pradesh|karnataka)$/i.test(cleaned)) {
    return cleaned;
  }

  // Remove redundant trailing/leading city/state suffixes e.g., "Madhapur, Hyderabad" -> "Madhapur"
  cleaned = cleaned
    .replace(/,\s*(hyderabad|secunderabad|adilabad|telangana|andhra pradesh|india)/gi, "")
    .replace(/[,_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length >= 2 ? cleaned : "";
}

/**
 * Lookup area name from a 6-digit pincode using local database and India Post API.
 */
export async function fetchAreaFromPincode(pincode: string): Promise<LocationResult> {
  const cleanPin = pincode.replace(/\D/g, "").slice(0, 6);
  if (cleanPin.length !== 6) {
    return { area: pincode || "Custom Area", pincode: cleanPin, city: "Hyderabad" };
  }

  // 1. Check local dictionary first
  if (KNOWN_PINCODE_MAP[cleanPin]) {
    const item = KNOWN_PINCODE_MAP[cleanPin];
    return { area: item.area, pincode: cleanPin, city: item.city, state: item.state };
  }

  // 2. Check in-memory cache
  if (pincodeCache.has(cleanPin)) {
    return pincodeCache.get(cleanPin)!;
  }

  // 3. Query India Post API
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    const data = await res.json();
    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const po = data[0].PostOffice[0];
      const area = cleanLocationName(po.Name) || cleanLocationName(po.Block) || `Area ${cleanPin}`;
      const city = cleanLocationName(po.District) || cleanLocationName(po.State) || "Hyderabad";
      const state = cleanLocationName(po.State) || "Telangana";
      const result: LocationResult = { area, pincode: cleanPin, city, state };
      pincodeCache.set(cleanPin, result);
      return result;
    }
  } catch (err) {
    console.warn("Postal pincode lookup failed:", err);
  }

  // Fallback
  return { area: `Area ${cleanPin}`, pincode: cleanPin, city: "Hyderabad" };
}

/**
 * Resolve device lat/lng into accurate area, pincode, city using OpenStreetMap Nominatim + Postal API.
 */
export async function resolveGpsLocation(lat: number, lng: number): Promise<LocationResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`
    );
    const geo = await res.json();
    const addr = geo.address || {};

    const rawPin = addr.postcode ? addr.postcode.replace(/\D/g, "") : "";
    const pincode = rawPin.length === 6 ? rawPin : "";

    // Candidate area fields in order of specificity
    let suburb =
      cleanLocationName(addr.suburb) ||
      cleanLocationName(addr.neighbourhood) ||
      cleanLocationName(addr.residential) ||
      cleanLocationName(addr.quarter) ||
      cleanLocationName(addr.commercial) ||
      cleanLocationName(addr.industrial) ||
      cleanLocationName(addr.village) ||
      cleanLocationName(addr.hamlet) ||
      cleanLocationName(addr.locality) ||
      cleanLocationName(addr.city_district);

    let city =
      cleanLocationName(addr.city) ||
      cleanLocationName(addr.town) ||
      cleanLocationName(addr.county) ||
      cleanLocationName(addr.state_district) ||
      "Hyderabad";

    let state = cleanLocationName(addr.state) || "Telangana";

    // If suburb is missing or generic (equal to city or contains GHMC/Mandal), and we have a valid 6-digit pincode:
    if (
      (!suburb ||
        suburb.toLowerCase() === city.toLowerCase() ||
        suburb.toLowerCase().includes("mandal") ||
        suburb.toLowerCase().includes("ghmc")) &&
      pincode
    ) {
      const pinResolved = await fetchAreaFromPincode(pincode);
      if (pinResolved && pinResolved.area && !pinResolved.area.startsWith("Area ")) {
        suburb = pinResolved.area;
        city = pinResolved.city || city;
      }
    }

    const finalArea = suburb || city || "Madhapur";
    const finalPin = pincode || "500081";

    return {
      area: finalArea,
      pincode: finalPin,
      city,
      state,
    };
  } catch (err) {
    console.warn("GPS resolution failed, using fallback:", err);
    return { area: "Madhapur", pincode: "500081", city: "Hyderabad", state: "Telangana" };
  }
}
