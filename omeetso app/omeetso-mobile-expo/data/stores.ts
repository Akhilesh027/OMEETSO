import type { Store } from "../types";

export const stores: Store[] = [
  {
    id: "s1",
    name: "Satish Electronics",
    logo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200",
    area: "Ameerpet",
    city: "Hyderabad",
    category: "Electronics",
    verified: true,
    followers: 1240,
    rating: 4.6,
  },
  {
    id: "s2",
    name: "Hyderabad Home Store",
    logo: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=200",
    area: "Kondapur",
    city: "Hyderabad",
    category: "Furniture",
    verified: true,
    followers: 860,
    rating: 4.4,
  },
  {
    id: "s3",
    name: "Miyapur Mobiles",
    logo: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=200",
    area: "Miyapur",
    city: "Hyderabad",
    category: "Mobiles",
    verified: false,
    followers: 420,
    rating: 4.1,
  },
];
