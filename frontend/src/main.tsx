import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import "./styles.css";

// Purge legacy mock data cache from localStorage
if (typeof localStorage !== "undefined") {
  const legacyKeys = [
    "omeetso_user_listings",
    "omeetso_listing_drafts",
    "omeetso_quick_sell_draft",
    "omeetso_detailed_sell_draft",
    "omeetso_listing_analytics"
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));
}

const queryClient = new QueryClient();
const router = getRouter(queryClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
