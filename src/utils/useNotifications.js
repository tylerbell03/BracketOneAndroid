import { useState, useEffect, useRef } from "react";
import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const PUSH_TOKEN_KEY = "secure_expo_push_token";

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Check if user has already made a decision about notifications
    checkNotificationPreference().then((shouldRequest) => {
      if (shouldRequest) {
        registerForPushNotificationsAsync().then((token) => {
          if (token) {
            setExpoPushToken(token);
            sendTokenToBackend(token);
          }
        });
      }
    });

    // Listen for notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Listen for notification taps
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        // Navigate to appropriate screen based on notification data
        if (data?.gameId) {
          // Navigation handled by router - no logging in production
        } else if (data?.teamId) {
          // Navigation handled by router - no logging in production
        }
      });

    return () => {
      try {
        if (
          notificationListener.current &&
          typeof Notifications.removeNotificationSubscription === "function"
        ) {
          Notifications.removeNotificationSubscription(
            notificationListener.current,
          );
        }
        if (
          responseListener.current &&
          typeof Notifications.removeNotificationSubscription === "function"
        ) {
          Notifications.removeNotificationSubscription(
            responseListener.current,
          );
        }
      } catch (error) {
        console.log("Error cleaning up notification listeners:", error);
      }
    };
  }, []);

  return { expoPushToken, notification };
}

// Check if user has already made a decision about notifications
async function checkNotificationPreference() {
  try {
    const preference = await AsyncStorage.getItem("notification_preference");

    // If user hasn't decided yet, show explanation dialog
    if (preference === null) {
      return new Promise((resolve) => {
        Alert.alert(
          "Stay Updated on Your Games",
          "BracketOne can send you notifications for:\n\n• Score updates for your favorite teams\n• Game reminders before your team plays\n• Tournament schedule changes\n\nTo enable notifications, we'll collect and store a unique notification token from your device. This token is used solely to send you notifications and is not shared with third parties or used for tracking across other apps.\n\nYou can manage these preferences anytime in Settings or your device settings. See our Privacy Policy for more details.",
          [
            {
              text: "Not Now",
              style: "cancel",
              onPress: async () => {
                await AsyncStorage.setItem("notification_preference", "denied");
                resolve(false);
              },
            },
            {
              text: "Enable Notifications",
              onPress: async () => {
                await AsyncStorage.setItem(
                  "notification_preference",
                  "granted",
                );
                resolve(true);
              },
            },
          ],
          { cancelable: false },
        );
      });
    }

    return preference === "granted";
  } catch (error) {
    console.error("Error checking notification preference:", error);
    return false;
  }
}

async function registerForPushNotificationsAsync() {
  let token;

  try {
    // Check if we already have a stored token in SecureStore
    const storedToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    if (storedToken) {
      return storedToken;
    }

    // Set up Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#f97316",
      });

      // Create channels for different notification types
      await Notifications.setNotificationChannelAsync("score-updates", {
        name: "Score Updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#f97316",
        description: "Notifications for score updates on your favorite teams",
      });

      await Notifications.setNotificationChannelAsync("game-reminders", {
        name: "Game Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#f97316",
        description: "Reminders for upcoming games of your favorite teams",
      });
    }

    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;

      // Update preference based on user's decision
      await AsyncStorage.setItem(
        "notification_preference",
        finalStatus === "granted" ? "granted" : "denied",
      );
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    // Get the Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || Constants.expoConfig?.projectId,
    });

    token = tokenData.data;

    // Store token securely in SecureStore
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }

  return token;
}

async function sendTokenToBackend(token) {
  try {
    const response = await fetch("/api/notifications/register-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        token,
        deviceType: Platform.OS,
      }),
    });

    if (!response.ok) {
      console.error("Failed to register push token with backend");
    }
  } catch (error) {
    console.error("Error sending token to backend:", error);
  }
}

/**
 * Delete push token from device and backend
 * Called when user disables notifications
 */
export async function deletePushToken() {
  try {
    // Get the stored token
    const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);

    if (token) {
      // Delete from backend
      try {
        await fetch("/api/notifications/register-token", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "include",
          body: JSON.stringify({ token }),
        });
      } catch (error) {
        console.error("Error deleting token from backend:", error);
        // Continue to delete locally even if backend fails
      }

      // Delete from SecureStore
      await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
    }
  } catch (error) {
    console.error("Error deleting push token:", error);
    throw error;
  }
}

export async function scheduleLocalNotification(
  title,
  body,
  data,
  triggerSeconds = 1,
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        seconds: triggerSeconds,
      },
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}
