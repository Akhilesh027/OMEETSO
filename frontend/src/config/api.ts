const rawBackendUrl = (import.meta.env.VITE_API_URL || "https://api.omeetso.in ").trim().replace(/\/+$/, "");
export const BACKEND_URL = rawBackendUrl;
export const API_BASE = `${BACKEND_URL}/api/v1`;
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || rawBackendUrl).trim().replace(/\/+$/, "");


