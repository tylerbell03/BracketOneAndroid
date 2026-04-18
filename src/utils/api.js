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
 * Makes an API call to the backend
 * @param {string} path - The API path (e.g., '/api/tournaments')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} - The JSON response
 */
export async function apiCall(path, options = {}) {
  const url = apiUrl(path);

  // Production diagnostic logging
  console.log(`[API] Calling: ${sanitizeUrlForLogging(url)}`);
  console.log(
    `[API] Base URL env: ${process.env.EXPO_PUBLIC_BASE_URL || "not set"}`,
  );
  console.log(
    `[API] Proxy URL env: ${process.env.EXPO_PUBLIC_PROXY_BASE_URL || "not set"}`,
  );

  // Get JWT token and add to headers
  const jwt = await getJWT();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if JWT exists
  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  // Add CSRF header for state-changing methods
  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Try to refresh the token once
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the original request with new token
        const newJwt = await getJWT();
        if (newJwt) {
          headers.Authorization = `Bearer ${newJwt}`;
        }

        const retryResponse = await fetch(url, {
          ...options,
          credentials: "include",
          headers,
        });

        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }

      // Refresh failed or retry failed, clear auth
      await handleUnauthorized();
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      // Log error even in production for diagnostics
      const errorText = await response.text();
      console.error(
        `[API] ${response.status} ${sanitizeUrlForLogging(url)}:`,
        errorText,
      );

      // Throw descriptive error message
      throw new Error(
        `Request failed with status ${response.status}: ${errorText.substring(0, 100)}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Log errors even in production
    console.error(
      `[API] Error for ${sanitizeUrlForLogging(path)}:`,
      error.message,
    );
    throw error;
  }
}
