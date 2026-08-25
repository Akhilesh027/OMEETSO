export const BACKEND_URL = (import.meta as any).env?.VITE_API_URL || "https://api.omeetso.in";
export const API_BASE = `${BACKEND_URL}/api/v1`;
export const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || BACKEND_URL;

