// Vector Male, Female, and Neutral User Avatar SVGs for Backend Defaults

export const MALE_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="bgM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="100%" stop-color="#DBEAFE"/>
    </linearGradient>
    <linearGradient id="skinM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FED7AA"/>
      <stop offset="100%" stop-color="#FDBA74"/>
    </linearGradient>
    <linearGradient id="hairM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="shirtM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#bgM)"/>
  <path d="M22,120 C25,92 42,78 64,78 C86,78 103,92 106,120 Z" fill="url(#shirtM)"/>
  <path d="M64,88 L53,78 L75,78 Z" fill="#FFFFFF"/>
  <path d="M55,66 L73,66 L73,80 L55,80 Z" fill="url(#skinM)"/>
  <ellipse cx="64" cy="51" rx="18" ry="21" fill="url(#skinM)"/>
  <circle cx="45" cy="52" r="4.5" fill="url(#skinM)"/>
  <circle cx="83" cy="52" r="4.5" fill="url(#skinM)"/>
  <path d="M43,47 C42,31 51,22 64,22 C77,22 86,31 85,47 C81,37 74,31 64,31 C54,31 47,37 43,47 Z" fill="url(#hairM)"/>
  <path d="M44,43 C49,34 56,32 66,32 C75,32 81,36 84,43 C81,37 75,33 64,33 C53,33 47,37 44,43 Z" fill="url(#hairM)"/>
  <circle cx="56" cy="50" r="2.4" fill="#1E293B"/>
  <circle cx="72" cy="50" r="2.4" fill="#1E293B"/>
  <path d="M52,44 Q56,42 60,44" stroke="#334155" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M68,44 Q72,42 76,44" stroke="#334155" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M58,59 Q64,64 70,59" stroke="#C2410C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
</svg>`;

export const FEMALE_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="bgF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF1F2"/>
      <stop offset="100%" stop-color="#FFE4E6"/>
    </linearGradient>
    <linearGradient id="skinF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FED7AA"/>
      <stop offset="100%" stop-color="#FDBA74"/>
    </linearGradient>
    <linearGradient id="hairF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="shirtF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#BE123C"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#bgF)"/>
  <path d="M37,48 C35,74 39,95 44,104 C48,104 49,83 49,68 L79,68 C79,83 80,104 84,104 C89,95 93,74 91,48 C89,26 78,18 64,18 C50,18 39,26 37,48 Z" fill="url(#hairF)"/>
  <path d="M24,120 C27,92 43,78 64,78 C85,78 101,92 104,120 Z" fill="url(#shirtF)"/>
  <path d="M64,88 L54,78 L74,78 Z" fill="#FFFFFF"/>
  <path d="M56,64 L72,64 L72,80 L56,80 Z" fill="url(#skinF)"/>
  <ellipse cx="64" cy="50" rx="17" ry="20" fill="url(#skinF)"/>
  <circle cx="46" cy="51" r="4" fill="url(#skinF)"/>
  <circle cx="82" cy="51" r="4" fill="url(#skinF)"/>
  <path d="M43,44 C43,28 51,20 64,20 C77,20 85,28 85,44 C81,33 73,28 64,28 C55,28 47,33 43,44 Z" fill="url(#hairF)"/>
  <path d="M43,40 C42,53 44,68 46,73 C48,62 47,49 49,43 Z" fill="url(#hairF)"/>
  <path d="M85,40 C86,53 84,68 82,73 C80,62 81,49 79,43 Z" fill="url(#hairF)"/>
  <circle cx="56" cy="49" r="2.3" fill="#1E293B"/>
  <circle cx="72" cy="49" r="2.3" fill="#1E293B"/>
  <path d="M53,46 Q56,44 59,46" stroke="#1E293B" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M69,46 Q72,44 75,46" stroke="#1E293B" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M58,58 Q64,63 70,58" stroke="#BE123C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
</svg>`;

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MALE_AVATAR_DATA_URI = svgToDataUri(MALE_AVATAR_SVG);
export const FEMALE_AVATAR_DATA_URI = svgToDataUri(FEMALE_AVATAR_SVG);

export function isPhotoUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.startsWith("data:image/svg+xml")) return false;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:image/")) {
    return true;
  }
  return false;
}

export function detectGenderByName(name?: string, fallbackGender?: string): "male" | "female" {
  if (fallbackGender === "female" || fallbackGender === "male") return fallbackGender;
  if (!name) return "male";
  const femaleNamesRegex = /^(soumya|sowmya|neha|priya|anita|pooja|sneha|kavya|shreya|swathi|deepika|divya|ananya|aishwarya|radha|geetha|anjali|laxmi|lakshmi|rekha|madhavi|bhavani|swapna|keerthi|jyothi|lavanya|harika|tejaswini|pranathi|sruthi|sravani|vani|manasa|sirisha)/i;
  if (femaleNamesRegex.test(name.trim())) {
    return "female";
  }
  return "male";
}

export function getCleanAvatar(avatar?: string | null, genderOrName?: "male" | "female" | string): string {
  if (!avatar || isPhotoUrl(avatar)) {
    const gender = detectGenderByName(genderOrName, genderOrName);
    if (gender === "female") return FEMALE_AVATAR_DATA_URI;
    return MALE_AVATAR_DATA_URI;
  }
  return avatar;
}
