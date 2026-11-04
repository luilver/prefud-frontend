/**
 * Centralized API & Service Endpoints Configuration
 *
 * Automatically resolves from environment variables with cross-fallback support:
 * 1. Checks specific variable (e.g. VITE_BASE_URL, VITE_PANTRY_URL, VITE_SOCKET_URL)
 * 2. Falls back to counterpart if one is set (e.g. VITE_BASE_URL falls back to VITE_PANTRY_URL)
 * 3. Falls back to default production endpoint only if neither is provided.
 */

const DEFAULT_HTTP_URL = "https://pantry-ms-brain.onrender.com";
const DEFAULT_SOCKET_URL = "wss://pantry-ms-brain.onrender.com";

// Base API URL for auth, security, user profile, orders, addresses
export const API_BASE_URL: string =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_PANTRY_URL ||
  DEFAULT_HTTP_URL;

// Pantry & AI meal planner URL for meal plans, pantry, recipes, drinks, reels
export const PANTRY_API_URL: string =
  import.meta.env.VITE_PANTRY_URL ||
  import.meta.env.VITE_BASE_URL ||
  DEFAULT_HTTP_URL;

// WebSocket / SSE connection URL
export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_BASE_URL
    ? import.meta.env.VITE_BASE_URL.replace(/^http:/, "ws:").replace(/^https:/, "wss:")
    : DEFAULT_SOCKET_URL);

// Payments microservice URL
export const PAYMENTS_URL: string =
  import.meta.env.VITE_PAYMENTS || "https://zora-ms-stripe-1.onrender.com";

