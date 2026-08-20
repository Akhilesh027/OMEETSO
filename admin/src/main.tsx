import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastProvider } from "@/contexts/ToastContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import App from "./App";
import "./index.css";

// Purge legacy mock data cache from localStorage
if (typeof localStorage !== "undefined") {
  const legacyKeys = [
    "omeetso_admin_data_listings_v2",
    "omeetso_admin_data_stores_v2",
    "omeetso_admin_data_users_v2",
    "omeetso_admin_data_campaigns_v2",
    "omeetso_admin_data_tickets_v2",
    "omeetso_admin_data_safety_v2",
    "omeetso_admin_data_refunds_v2",
    "omeetso_admin_listings",
    "omeetso_admin_stores",
    "omeetso_user_listings"
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <AdminAuthProvider>
            <App />
          </AdminAuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
