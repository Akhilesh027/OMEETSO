export const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || "https://api.omeetso.in";
export const API_BASE = `${BACKEND_URL}/api/v1`;
export const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || BACKEND_URL;

/**
 * Returns the base URL of the client-facing user marketplace/frontend app.
 * Resolves to explicit VITE_FRONTEND_URL / VITE_SITE_URL if configured,
 * or localhost:5173 when developing locally,
 * and falls back to production https://omeetso.in.
 */
export const getFrontendBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_FRONTEND_URL || (import.meta as any).env?.VITE_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `http://${hostname}:5173`;
    }
  }

  return "https://omeetso.in";
};

export const FRONTEND_URL = getFrontendBaseUrl();


