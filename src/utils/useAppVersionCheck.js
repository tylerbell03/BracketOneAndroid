import { useState, useEffect } from "react";
import { Platform, Linking } from "react-native";
import Constants from "expo-constants";
import { apiCall } from "./api";

/**
 * Compares two semantic version strings (e.g., "1.0.42" vs "1.0.41")
 * Returns:
 *  -1 if version1 < version2
 *   0 if version1 === version2
 *   1 if version1 > version2
 */
function compareVersions(version1, version2) {
  const parts1 = version1.split(".").map(Number);
  const parts2 = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0;
}

export default function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      // Get current app version from app.json
      const currentVersion = Constants.expoConfig?.version || "1.0.0";

      // Fetch version config from backend
      const versionConfig = await apiCall("/api/app-version");

      const {
        minimumVersion,
        latestVersion,
        updateMessage: message,
        forceUpdate,
      } = versionConfig;

      // Check if current version is below minimum required
      const isBelowMinimum =
        compareVersions(currentVersion, minimumVersion) < 0;

      // Check if update is available
      const isOutdated = compareVersions(currentVersion, latestVersion) < 0;

      if (isBelowMinimum && forceUpdate) {
        // Force update required
        setUpdateRequired(true);
        setUpdateAvailable(true);
        setUpdateMessage(
          message ||
            "This version is no longer supported. Please update to continue using BracketOne.",
        );
      } else if (isOutdated) {
        // Optional update available
        setUpdateRequired(false);
        setUpdateAvailable(true);
        setUpdateMessage(
          message || "A new version of BracketOne is available!",
        );
      } else {
        // App is up to date
        setUpdateAvailable(false);
        setUpdateRequired(false);
      }
    } catch (error) {
      console.error("Error checking app version:", error);
      // Don't block the app if version check fails
      setUpdateAvailable(false);
      setUpdateRequired(false);
    } finally {
      setLoading(false);
    }
  };

  const openAppStore = () => {
    // iOS App Store URL with actual BracketOne App Store ID
    const appStoreUrl = Platform.select({
      ios: "https://apps.apple.com/app/id6760902736",
      android:
        "https://play.google.com/store/apps/details?id=com.createinc.f79c05fb36254b4cad559f1e0c0df7c7",
      default: "https://bracketone.us",
    });

    Linking.openURL(appStoreUrl).catch((err) => {
      console.error("Error opening app store:", err);
    });
  };

  return {
    updateAvailable,
    updateRequired,
    updateMessage,
    loading,
    openAppStore,
    recheckVersion: checkVersion,
  };
}
