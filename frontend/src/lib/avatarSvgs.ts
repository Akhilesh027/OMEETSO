// Modern, sleek Vector Male, Female, and Neutral User Avatar Icons (Instant Data URIs)

export const MALE_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="bgM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="100%" stop-color="#DBEAFE"/>
    </linearGradient>
    <linearGradient id="shirtM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="skinM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FED7AA"/>
      <stop offset="100%" stop-color="#FDBA74"/>
    </linearGradient>
    <linearGradient id="hairM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#bgM)"/>
  <!-- Body / Shoulders -->
  <path d="M22,122 C25,93 42,79 64,79 C86,79 103,93 106,122 Z" fill="url(#shirtM)"/>
  <!-- Collar V -->
  <path d="M64,91 L53,79 L75,79 Z" fill="#FFFFFF"/>
  <!-- Neck -->
  <path d="M55,66 L73,66 L73,81 L55,81 Z" fill="url(#skinM)"/>
  <!-- Head -->
  <ellipse cx="64" cy="51" rx="18" ry="21" fill="url(#skinM)"/>
  <!-- Ears -->
  <circle cx="45" cy="52" r="4.5" fill="url(#skinM)"/>
  <circle cx="83" cy="52" r="4.5" fill="url(#skinM)"/>
  <!-- Hair -->
  <path d="M43,47 C42,30 51,21 64,21 C77,21 86,30 85,47 C81,36 74,30 64,30 C54,30 47,36 43,47 Z" fill="url(#hairM)"/>
  <path d="M44,42 C49,33 56,31 66,31 C75,31 81,35 84,42 C81,36 75,32 64,32 C53,32 47,36 44,42 Z" fill="url(#hairM)"/>
  <!-- Eyes -->
  <circle cx="56" cy="50" r="2.2" fill="#1E293B"/>
  <circle cx="72" cy="50" r="2.2" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M58,59 Q64,63 70,59" stroke="#C2410C" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;

export const FEMALE_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="bgF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF1F2"/>
      <stop offset="100%" stop-color="#FFE4E6"/>
    </linearGradient>
    <linearGradient id="shirtF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#BE123C"/>
    </linearGradient>
    <linearGradient id="skinF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FED7AA"/>
      <stop offset="100%" stop-color="#FDBA74"/>
    </linearGradient>
    <linearGradient id="hairF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#bgF)"/>
  <!-- Long Hair Behind -->
  <path d="M37,48 C35,74 39,95 44,104 C48,104 49,83 49,68 L79,68 C79,83 80,104 84,104 C89,95 93,74 91,48 C89,26 78,18 64,18 C50,18 39,26 37,48 Z" fill="url(#hairF)"/>
  <!-- Body / Shoulders -->
  <path d="M24,122 C27,93 43,79 64,79 C85,79 101,93 104,122 Z" fill="url(#shirtF)"/>
  <!-- Collar -->
  <path d="M64,90 L54,79 L74,79 Z" fill="#FFFFFF"/>
  <!-- Neck -->
  <path d="M56,64 L72,64 L72,81 L56,81 Z" fill="url(#skinF)"/>
  <!-- Head -->
  <ellipse cx="64" cy="50" rx="17" ry="20" fill="url(#skinF)"/>
  <!-- Ears -->
  <circle cx="46" cy="51" r="4" fill="url(#skinF)"/>
  <circle cx="82" cy="51" r="4" fill="url(#skinF)"/>
  <!-- Hair Front/Sides -->
  <path d="M43,44 C43,27 51,19 64,19 C77,19 85,27 85,44 C81,32 73,27 64,27 C55,27 47,32 43,44 Z" fill="url(#hairF)"/>
  <path d="M43,39 C42,53 44,68 46,73 C48,62 47,49 49,42 Z" fill="url(#hairF)"/>
  <path d="M85,39 C86,53 84,68 82,73 C80,62 81,49 79,42 Z" fill="url(#hairF)"/>
  <!-- Eyes -->
  <circle cx="56" cy="49" r="2.2" fill="#1E293B"/>
  <circle cx="72" cy="49" r="2.2" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M58,58 Q64,62 70,58" stroke="#BE123C" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;

export const NEUTRAL_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="bgN" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="iconN" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#64748B"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#bgN)"/>
  <circle cx="64" cy="46" r="20" fill="url(#iconN)"/>
  <path d="M26,116 C28,88 44,74 64,74 C84,74 100,88 102,116 Z" fill="url(#iconN)"/>
</svg>`;

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MALE_AVATAR_DATA_URI = svgToDataUri(MALE_AVATAR_SVG);
export const FEMALE_AVATAR_DATA_URI = svgToDataUri(FEMALE_AVATAR_SVG);
export const NEUTRAL_AVATAR_DATA_URI = svgToDataUri(NEUTRAL_AVATAR_SVG);
export const DEFAULT_AVATAR_DATA_URI = MALE_AVATAR_DATA_URI;

export function isStockPhoto(url?: string | null): boolean {
  if (!url) return false;
  // If it's an Unsplash person photo from seeds, replace with icon
  if (url.includes("images.unsplash.com/photo-")) {
    return true;
  }
  return false;
}

export function isPhotoUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.startsWith("data:image/svg+xml")) return false;
  if (isStockPhoto(url)) return false;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:image/")) {
    return true;
  }
  return false;
}

const FEMALE_FIRST_NAMES = new Set([
  "priya", "sneha", "kavita", "ananya", "pooja", "aarti", "sunita", "deepa",
  "neha", "divya", "anjali", "ritu", "swati", "shreya", "megha", "tanvi",
  "shruti", "aditi", "radha", "lakshmi", "rekha", "sonia", "geeta", "asha",
  "sapna", "monika", "anita", "pallavi", "archana", "simran", "jyoti",
  "preeti", "ruchika", "vandana", "shweta", "bhavna", "komal", "garima",
  "mansi", "khushboo", "payal", "aakanksha", "kriti", "nisha", "poonam",
  "parul", "alka", "kanika", "isha", "chhavi", "tanya", "riya", "vidya",
  "rashmi", "urmila", "seema", "manju", "sarita", "deepika", "sakshi", "puja",
  "shilpa", "mamta", "roshni", "madhu", "meenakshi", "namrata", "sangeeta"
]);

export function detectGenderByName(name?: string, fallbackGender?: string): "male" | "female" {
  if (fallbackGender && (fallbackGender.toLowerCase() === "female" || fallbackGender.toLowerCase() === "f")) {
    return "female";
  }
  if (fallbackGender && (fallbackGender.toLowerCase() === "male" || fallbackGender.toLowerCase() === "m")) {
    return "male";
  }
  if (!name || !name.trim()) return "male";
  const firstName = name.trim().split(/\s+/)[0].toLowerCase();
  if (FEMALE_FIRST_NAMES.has(firstName)) return "female";
  return "male";
}

export function getCleanAvatar(avatar?: string | null, genderOrName?: string): string {
  if (!avatar || !avatar.trim() || isStockPhoto(avatar) || avatar.includes("bgN")) {
    const gender = detectGenderByName(genderOrName, genderOrName);
    return gender === "female" ? FEMALE_AVATAR_DATA_URI : MALE_AVATAR_DATA_URI;
  }
  return avatar;
}
