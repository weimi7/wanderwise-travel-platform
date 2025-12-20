// -----------------------------------------------------------------------------
// Helper Utilities for Itinerary Planner
// -----------------------------------------------------------------------------

/**
 * Debounce (sync function)
 * Ensures the function runs only after the user stops triggering it.
 * @param {Function} fn 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(fn, wait = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Debounce for async functions (useful for API calls)
 * Example: asyncDebounce(() => fetch(...))
 */
export function asyncDebounce(fn, wait = 400) {
  let timer = null;
  return (...args) => {
    return new Promise(resolve => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, wait);
    });
  };
}

/**
 * Compute number of days inclusively between two ISO date strings.
 * @param {string} startISO  - YYYY-MM-DD
 * @param {string} endISO    - YYYY-MM-DD
 * @returns {number}
 */
export function daysBetween(startISO, endISO) {
  if (!startISO || !endISO) return 0;

  const s = new Date(startISO);
  const e = new Date(endISO);

  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;

  // Normalize
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  const diffMs = e - s;
  if (diffMs < 0) return 0;

  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * Safe image fallback.
 * If URL missing/invalid → return placeholder.
 * @param {string} url
 */
export function safeImage(url) {
  if (!url || typeof url !== "string") {
    return "/placeholder.jpg";
  }
  return url.trim() === "" ? "/placeholder.jpg" : url;
}

/**
 * Format currency for budgets.
 * Example: formatCurrency(1500) → "$1,500"
 * @param {number|string} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  try {
    const num = Number(amount);
    if (isNaN(num)) return "$0";

    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    });
  } catch {
    return "$0";
  }
}
