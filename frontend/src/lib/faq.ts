export type Faq = {
  id: string;
  category: string;
  title: string;
  summary: string;
  steps: string[];
  keywords: string[];
  relatedRoutes: { label: string; to: string }[];
};

export const FAQ_CATEGORIES: { id: string; label: string }[] = [
  { id: "buying", label: "Buying" },
  { id: "selling", label: "Selling" },
  { id: "quick_sell", label: "Quick Sell" },
  { id: "detailed_sell", label: "Detailed Sell" },
  { id: "stores", label: "Stores" },
  { id: "chats", label: "Chats" },
  { id: "offers", label: "Offers" },
  { id: "promotions", label: "Promotions" },
  { id: "advertisements", label: "Advertisements" },
  { id: "wallet", label: "Wallet" },
  { id: "account", label: "Account" },
  { id: "verification", label: "Verification" },
  { id: "safety", label: "Safety" },
];

export const ALL_FAQS: Faq[] = [
  {
    id: "buy-contact-seller", category: "buying",
    title: "How do I contact a seller?",
    summary: "Open a listing and start a chat inside Omeetso.",
    steps: [
      "Open a product listing you're interested in.",
      "Tap Chat with seller.",
      "Send your questions inside the Omeetso chat.",
      "Keep the conversation on Omeetso for safety.",
    ],
    keywords: ["contact", "seller", "message", "chat"],
    relatedRoutes: [{ label: "Chats", to: "/chats" }, { label: "Safety Centre", to: "/safety" }],
  },
  {
    id: "buy-offers-work", category: "buying",
    title: "How do offers work?",
    summary: "Send a fair price and wait for the seller's response.",
    steps: [
      "Tap Make an offer on a listing.",
      "Enter your price and optional message.",
      "The seller can accept, reject or send a counteroffer.",
      "Accepted offers appear in your Offers tab.",
    ],
    keywords: ["offer", "price", "negotiate"],
    relatedRoutes: [{ label: "Offers", to: "/offers" }],
  },
  {
    id: "buy-payments", category: "buying",
    title: "Is Omeetso involved in payment?",
    summary: "Omeetso does not collect or hold product payments.",
    steps: [
      "Payments are handled directly between buyers and sellers.",
      "Prefer meeting in person and paying only after inspection.",
      "Never share OTPs, PINs or banking credentials.",
    ],
    keywords: ["payment", "money", "upi", "cash"],
    relatedRoutes: [{ label: "Payment safety", to: "/safety/$topic" }],
  },
  {
    id: "buy-report-listing", category: "buying",
    title: "How do I report a listing?",
    summary: "Use the Report action on any listing or chat.",
    steps: [
      "Open the listing or related chat.",
      "Tap the menu icon and choose Report.",
      "Pick a reason and describe the issue.",
      "Submit — you'll get a mock reference for tracking.",
    ],
    keywords: ["report", "flag", "abuse", "fraud"],
    relatedRoutes: [{ label: "Report suspicious activity", to: "/safety/report" }],
  },
  {
    id: "sell-create-listing", category: "selling",
    title: "How do I create a listing?",
    summary: "Use Sell to publish a Quick or Detailed listing.",
    steps: [
      "Tap Sell in the bottom navigation.",
      "Choose Quick Sell for common items or Detailed Sell for more attributes.",
      "Add photos, price and description.",
      "Submit for review.",
    ],
    keywords: ["sell", "post", "list", "create"],
    relatedRoutes: [{ label: "Sell", to: "/sell" }, { label: "My Listings", to: "/listings" }],
  },
  {
    id: "sell-quick-sell", category: "quick_sell",
    title: "What is Quick Sell?",
    summary: "A fast 4-step flow to publish common items.",
    steps: [
      "Choose Quick Sell from the Sell screen.",
      "Add photos, title, price and location.",
      "Preview and submit.",
    ],
    keywords: ["quick sell", "fast", "post"],
    relatedRoutes: [{ label: "Quick Sell", to: "/sell/quick" }],
  },
  {
    id: "sell-review-time", category: "selling",
    title: "How long does listing review take?",
    summary: "Usually within 12 hours.",
    steps: [
      "New listings are reviewed for community safety.",
      "Most listings are approved within 12 hours.",
      "You'll be notified when your listing goes live.",
    ],
    keywords: ["review", "approval", "time"],
    relatedRoutes: [{ label: "My Listings", to: "/listings" }],
  },
  {
    id: "sell-mark-sold", category: "selling",
    title: "How do I mark a product sold?",
    summary: "Use the Manage screen for that listing.",
    steps: [
      "Open My Listings.",
      "Choose the listing and tap Manage.",
      "Mark as Sold and pick the buyer if applicable.",
    ],
    keywords: ["sold", "mark", "manage"],
    relatedRoutes: [{ label: "My Listings", to: "/listings" }],
  },
  {
    id: "store-create", category: "stores",
    title: "How do I create a store?",
    summary: "Open Sell → Store → Create Store.",
    steps: [
      "From Sell, choose Store.",
      "Complete the store creation steps: info, branding, category, location, contact and delivery.",
      "Submit for review.",
    ],
    keywords: ["store", "shop", "business"],
    relatedRoutes: [{ label: "Create store", to: "/store/create" }],
  },
  {
    id: "store-add-products", category: "stores",
    title: "How do I add products to my store?",
    summary: "Use Store Dashboard → Products.",
    steps: [
      "Open your Store Dashboard.",
      "Tap Products → Add product.",
      "Fill in details and publish.",
    ],
    keywords: ["store", "products"],
    relatedRoutes: [{ label: "Stores", to: "/stores" }],
  },
  {
    id: "store-verification", category: "verification",
    title: "How does store verification work?",
    summary: "Complete the six steps in the Store Verification screen.",
    steps: [
      "Verify mobile and business email.",
      "Submit store address and business details.",
      "Upload compliant store images.",
      "Accept the store policy to complete.",
    ],
    keywords: ["verification", "store", "badge"],
    relatedRoutes: [{ label: "Store verification", to: "/verification" }],
  },
  {
    id: "promo-boosts", category: "promotions",
    title: "How do boosts work?",
    summary: "Boosts increase visibility for a chosen duration.",
    steps: [
      "Choose a listing to promote.",
      "Pick a boost package and placements.",
      "Pay and your promotion becomes active.",
    ],
    keywords: ["boost", "promotion", "visibility"],
    relatedRoutes: [{ label: "Promotions", to: "/promotions" }],
  },
  {
    id: "promo-guarantee", category: "promotions",
    title: "Does promotion guarantee a sale?",
    summary: "No. Boosts improve visibility, not outcomes.",
    steps: [
      "Boosts help more nearby buyers see your listing.",
      "Sales still depend on price, product quality and communication.",
    ],
    keywords: ["boost", "guarantee"],
    relatedRoutes: [{ label: "Promotions", to: "/promotions" }],
  },
  {
    id: "promo-pause", category: "promotions",
    title: "How do I pause a campaign?",
    summary: "Use the campaign details screen.",
    steps: [
      "Open Advertisements or Promotions.",
      "Choose the campaign.",
      "Tap Pause and confirm.",
    ],
    keywords: ["pause", "campaign"],
    relatedRoutes: [{ label: "Ads", to: "/ads" }],
  },
  {
    id: "wallet-usage", category: "wallet",
    title: "What can wallet balance be used for?",
    summary: "Boosts, advertisements and Omeetso services.",
    steps: [
      "Wallet balance pays for promotions and ad campaigns.",
      "You cannot use wallet balance to buy products from other users.",
    ],
    keywords: ["wallet", "balance", "credits"],
    relatedRoutes: [{ label: "Wallet", to: "/wallet" }],
  },
  {
    id: "wallet-buy-products", category: "wallet",
    title: "Can wallet balance buy products?",
    summary: "No. Product payments happen between buyer and seller.",
    steps: [
      "Wallet is for Omeetso services only.",
      "Products are paid for directly between buyer and seller.",
    ],
    keywords: ["wallet", "buy"],
    relatedRoutes: [{ label: "Payment safety", to: "/safety/$topic" }],
  },
  {
    id: "wallet-refunds", category: "wallet",
    title: "How do refunds work?",
    summary: "Ended promotions return unused balance to your wallet.",
    steps: [
      "If you end a campaign early, unused budget is refunded to your wallet.",
      "For payment disputes, contact support.",
    ],
    keywords: ["refund", "wallet"],
    relatedRoutes: [{ label: "Support", to: "/support" }],
  },
];

export const POPULAR_FAQS = [
  ALL_FAQS.find((f) => f.id === "buy-payments")!,
  ALL_FAQS.find((f) => f.id === "sell-review-time")!,
  ALL_FAQS.find((f) => f.id === "store-verification")!,
  ALL_FAQS.find((f) => f.id === "promo-boosts")!,
];

export function getFaq(id: string) { return ALL_FAQS.find((f) => f.id === id); }
