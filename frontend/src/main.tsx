import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import "./styles.css";
import { initNativeApp } from "./lib/capacitor";

// Initialize native mobile plugins if running inside Capacitor (Android/iOS)
initNativeApp();

const queryClient = new QueryClient();
const router = getRouter(queryClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

// Gracefully dismiss the initial loading splash screen once portal is ready
if (typeof window !== "undefined" && (window as unknown as { __dismissOmeetsoSplash?: (ms: number) => void }).__dismissOmeetsoSplash) {
  (window as unknown as { __dismissOmeetsoSplash: (ms: number) => void }).__dismissOmeetsoSplash(2800);
}

