const getBackendUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Default to https://api.omeetso.in unless explicit port specified
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const explicit = (import.meta.env.VITE_API_URL || "").trim();
      if (explicit && (explicit.includes("localhost") || explicit.includes("127.0.0.1"))) {
        return explicit.replace(/\/+$/, "");
      }
      return "https://api.omeetso.in";
    }
  }
  const envUrl = (import.meta.env.VITE_API_URL || "https://api.omeetso.in").trim();
  return envUrl.replace(/\/+$/, "");
};

const rawBackendUrl = getBackendUrl();
export const BACKEND_URL = rawBackendUrl;
export const API_BASE = `${BACKEND_URL}/api/v1`;
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || rawBackendUrl).trim().replace(/\/+$/, "");
