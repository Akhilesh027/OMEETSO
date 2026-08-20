import type { Profile } from "../types";

export const users: Profile[] = [
  { id: "u1", name: "Rahul K.", mobile: "+91 98••••1234", accountType: "individual", createdAt: Date.now() - 86400000 * 30 },
  { id: "u2", name: "Priya S.", mobile: "+91 98••••4567", accountType: "individual", createdAt: Date.now() - 86400000 * 90 },
  { id: "u3", name: "Home Store", mobile: "+91 98••••7890", accountType: "business", createdAt: Date.now() - 86400000 * 120 },
];
