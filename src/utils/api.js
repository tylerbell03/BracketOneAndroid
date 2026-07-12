import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { authKey } from "./auth/store";

const __DEV__ = process.env.NODE_ENV === "development";

/**
 * Sanitize URL for logging by removing sensitive query parameters
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL
 */
function sanitizeUrlForLogging(url) {
  if (__DEV__) {
    // In development, show full URL for debugging
    return url;
  }

  try {
    const urlObj = new URL(url);
    // Remove sensitive query parameters
    const sensitiveParams = [
      "deviceFingerprint",
      "token",
      "jwt",
      "session",
      "email",
      "phone",
    ];
    sensitiveParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, "[REDACTED]");
      }
    });
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, just return path portion
    return url.split("?")[0];
  }
}

/**
 * Constructs a full API URL for mobile API calls.
 * Per Anything platform docs: "All fetch calls inside of the expo app that are
 * relative will automatically route to the web app api."
 *
 * We use EXPO_PUBLIC_BASE_URL (set by the platform) when available,
 * otherwise fall back to relative paths.
 */
export function apiUrl(path) {
  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Use platform-provided base URL if available and non-empty
  const baseUrl = (
    process.env.EXPO_PUBLIC_BASE_URL ||
    process.env.EXPO_PUBLIC_PROXY_BASE_URL ||
    ""
  ).trim();

  if (baseUrl) {
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    // Enforce HTTPS in production
    if (!__DEV__ && !cleanBase.startsWith("https://")) {
      throw new Error("Production API must use HTTPS");
    }

    return `${cleanBase}${cleanPath}`;
  }

  // Relative path — the Anything platform auto-routes these to the web API
  return cleanPath;
}

/**
 * Get the current JWT token from secure storage
 * @returns {Promise<string|null>} JWT token or null
 */
async function getJWT() {
  try {
    const storedAuth = await SecureStore.getItemAsync(authKey);
    if (!storedAuth) return null;
    const auth = JSON.parse(storedAuth);
    return auth?.jwt || null;
  } catch (error) {
    return null;
  }
}

/**
 * Clear authentication on 401 errors
 */
async function handleUnauthorized() {
  try {
    await SecureStore.deleteItemAsync(authKey);
    // Optionally trigger a re-auth UI event here
    if (__DEV__) {
      console.warn("[API] Session expired - auth cleared");
    }
  } catch (error) {
    console.error("[API] Failed to clear auth:", error);
  }
}

/**
 * Attempt to refresh the auth token
 * @returns {Promise<boolean>} True if refresh succeeded
 */
async function refreshToken() {
  try {
    const response = await fetch(apiUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.jwt && data.user) {
        await SecureStore.setItemAsync(authKey, JSON.stringify(data));
        return true;
      }
    }
    return false;
  } catch (error) {
    if (__DEV__) {
      console.warn("[API] Token refresh failed:", error);
    }
    return false;
  }
}

/**
 * Check if an error is a transient network error worth retrying
 */
function isTransientError(error) {
  const msg = error?.message?.toLowerCase() || "";
  return (
    msg.includes("tls") ||
    msg.includes("ssl") ||
    msg.includes("network") ||
    msg.includes("fetch failed") ||
    msg.includes("connection") ||
    msg.includes("timeout") ||
    msg.includes("econnreset") ||
    msg.includes("socket")
  );
}

/**
 * Retry a function with exponential backoff
 */
async function withRetry(fn, maxRetries = 3, baseDelayMs = 500) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries && isTransientError(error)) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        if (__DEV__) {
          console.warn(
            `[API] Transient error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}):`,
            error.message,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  throw lastError;
}

/**
 * Makes an API call to the backend
 * @param {string} path - The API path (e.g., '/api/tournaments')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} - The JSON response
 */
export async function apiCall(path, options = {}) {
  const url = apiUrl(path);

  // Get JWT token and add to headers
  const jwt = await getJWT();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  // Only retry GETs — never retry state-changing requests
  const shouldRetry = method === "GET";

  const doFetch = async () => {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newJwt = await getJWT();
        if (newJwt) headers.Authorization = `Bearer ${newJwt}`;
        const retryResponse = await fetch(url, {
          ...options,
          credentials: "include",
          headers,
        });
        if (retryResponse.ok) return await retryResponse.json();
      }
      await handleUnauthorized();
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API] ${response.status} ${sanitizeUrlForLogging(url)}:`,
        errorText,
      );
      throw new Error(
        `Request failed with status ${response.status}: ${errorText.substring(0, 100)}`,
      );
    }

    return await response.json();
  };

  try {
    return shouldRetry ? await withRetry(doFetch) : await doFetch();
  } catch (error) {
    console.error(
      `[API] Error for ${sanitizeUrlForLogging(path)}:`,
      error.message,
    );
    throw error;
  }
}
