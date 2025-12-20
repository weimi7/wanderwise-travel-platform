// Helper utilities for API calls used by admin frontend
// - Normalizes API base lookup across NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_API_URL
// - Provides buildUrl, getAuthHeaders, and safe JSON parsing for fetch responses

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000" ||
  process.env.NEXT_PUBLIC_API_URL || "";

/**
 * buildUrl(path)
 * Ensures API_BASE (if present) is used without double slashes.
 * path must start with a leading slash (e.g. '/api/admin/users').
 */
export function buildUrl(path) {
  if (!path) return path;
  if (!API_BASE) return path;
  return `${API_BASE.replace(/\/$/, "")}${path}`;
}

/**
 * getAuthHeaders(token?)
 * Accepts an explicit token (useful for server-side injection) or falls back to common
 * localStorage keys used by the app. Returns an object that can be spread into headers.
 */
export function getAuthHeaders(token) {
  if (token) return { Authorization: `Bearer ${token}` };

  if (typeof window === "undefined") return {};

  const fallbackKeys = ["token", "authToken", "accessToken"];
  const t = fallbackKeys.reduce((acc, k) => acc || localStorage.getItem(k), null);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/**
 * safeJsonResponse(res)
 * Tries to read/res.json() safely and returns {} when there's no JSON body.
 * This avoids throwing on empty responses or plain-text errors.
 */
export async function safeJsonResponse(res) {
  // When using fetch: res may have no body (204/empty) or non-json body.
  try {
    // Use text() then JSON.parse to avoid thrown errors from res.json()
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      // Not JSON, return raw text under `.raw`
      return { raw: text };
    }
  } catch (err) {
    // Reading body failed for some reason
    return {};
  }
}