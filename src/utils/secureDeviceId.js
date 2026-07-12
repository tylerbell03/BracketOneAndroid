import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "secure_device_id";
const DEVICE_ID_FINGERPRINT_SUFFIX = "-mobile";

/**
 * Generate a reasonably secure device ID using improved entropy
 * @returns {string} Device ID
 */
function generateDeviceId() {
  // Use multiple random values for better entropy
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  const random3 = Math.random().toString(36).substring(2, 15);

  return `${timestamp}-${random1}${random2}${random3}`;
}

/**
 * Get or create a secure contest participation identifier stored in SecureStore
 * This identifier is used for contest integrity (tracking daily uploads and votes)
 * and is stored persistently on the device until manually reset by the user.
 * @returns {Promise<string>} Contest participation identifier
 */
export async function getDeviceId() {
  try {
    let storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (!storedId) {
      // Generate device ID with improved entropy
      storedId = generateDeviceId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, storedId);
    }

    return storedId;
  } catch (error) {
    console.error("Error accessing device ID:", error);
    // Fallback to generated ID (not persisted)
    return generateDeviceId();
  }
}

/**
 * Get device fingerprint for API calls
 * @returns {Promise<string>} Device fingerprint
 */
export async function getDeviceFingerprint() {
  const deviceId = await getDeviceId();
  return `${deviceId}${DEVICE_ID_FINGERPRINT_SUFFIX}`;
}

/**
 * Clear the contest participation identifier (for contest session reset)
 * This allows users to withdraw their consent and reset their contest participation
 * @returns {Promise<void>}
 */
export async function clearDeviceId() {
  try {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
  } catch (error) {
    console.error("Error clearing device ID:", error);
    throw error;
  }
}
