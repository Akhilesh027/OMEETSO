export interface SearchResultItem {
  id: string;
  category: "Users" | "Listings" | "Stores" | "Campaigns" | "Payments" | "Tickets" | "Safety Reports";
  title: string;
  subtitle: string;
  badge?: string;
  route: string;
  matches: string[];
}

export const MOCK_SEARCH_INDEX: SearchResultItem[] = [];
