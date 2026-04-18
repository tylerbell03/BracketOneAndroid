/**
 * JWT utility functions for parsing and validating tokens
 */

/**
 * Parse JWT token and return payload
 * @param {string} token - JWT token to parse
 * @returns {object|null} Decoded payload or null if invalid
 */
export function parseJWT(token) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if expired or invalid
 */
export function isJWTExpired(token) {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

/**
 * Validate JWT token structure and expiry
 * @param {string} token - JWT token to validate
 * @returns {boolean} True if valid and not expired
 */
export function isJWTValid(token) {
  if (!token) return false;
  const payload = parseJWT(token);
  if (!payload) return false;
  return !isJWTExpired(token);
}
