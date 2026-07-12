import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Switch,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Trash2,
  ExternalLink,
  ChevronRight,
  UserX,
  Mail,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/utils/auth";
import useUser from "@/utils/auth/useUser";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { signOut } = useAuth();
  const { data: user, loading: userLoading } = useUser();

  useEffect(() => {
    loadNotificationPreference();
  }, []);

  const loadNotificationPreference = async () => {
    try {
      const preference = await AsyncStorage.getItem("notification_preference");
      setNotificationsEnabled(preference === "granted");
    } catch (error) {
      console.error("Error loading notification preference:", error);
    }
  };

  const handleNotificationToggle = async (value) => {
    try {
      await AsyncStorage.setItem(
        "notification_preference",
        value ? "granted" : "denied",
      );
      setNotificationsEnabled(value);

      if (value) {
        Alert.alert(
          "Notifications Enabled",
          "You'll receive score updates and game reminders for your favorite teams. You can also manage notifications in your device settings.",
          [{ text: "OK" }],
        );
      } else {
        Alert.alert(
          "Notifications Disabled",
          "You won't receive any notifications from BracketOne. You can re-enable them anytime.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.error("Error updating notification preference:", error);
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://bracketone.us/privacy-policy").catch((err) =>
      console.error("Failed to open privacy policy:", err),
    );
  };

  const openTermsOfService = () => {
    Linking.openURL("https://bracketone.us/terms").catch((err) =>
      console.error("Failed to open terms of service:", err),
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear App Data",
      "This will remove your favorite teams, notification preferences, and other locally stored data. Tournament data will not be affected.\n\nAre you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: executeClearData,
        },
      ],
    );
  };

  const executeClearData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      // Keep consent so the modal doesn't show again
      const keysToRemove = keys.filter((key) => key !== "data_consent_given");
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      setNotificationsEnabled(false);
      Alert.alert(
        "Data Cleared",
        "All local app data has been cleared. Your favorite teams and notification preferences have been reset.",
      );
    } catch (error) {
      console.error("Error clearing data:", error);
      Alert.alert("Error", "Failed to clear app data. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "You need to be signed in to delete your account.",
        [{ text: "OK" }],
      );
      return;
    }

    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data including:\n\n• Your tournaments\n• Teams you've created\n• Games and schedules\n• Favorite teams and tournaments\n• All personal information\n\nThis action cannot be undone.\n\nAre you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ],
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Final Confirmation",
      "Please confirm one last time that you want to permanently delete your account and all data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete Everything",
          style: "destructive",
          onPress: executeDeleteAccount,
        },
      ],
    );
  };

  const executeDeleteAccount = async () => {
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }

      // Clear all local data
      await AsyncStorage.clear();

      // Sign out
      await signOut();

      Alert.alert(
        "Account Deleted",
        "Your account and all associated data have been permanently deleted.",
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert(
        "Error",
        error.message ||
          "Failed to delete account. Please try again or contact support.",
      );
    }
  };

  const openSupportEmail = () => {
    Linking.openURL("mailto:support@bracketone.us").catch((err) =>
      console.error("Failed to open email:", err),
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#9ca3af",
          marginBottom: 12,
          marginLeft: 4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: "#1f2937",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#374151",
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    iconColor = "#f97316",
    rightElement,
    isLast = false,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#374151",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${iconColor}20`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Icon size={20} color={iconColor} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement ||
        (showChevron && <ChevronRight size={20} color="#9ca3af" />)}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: "#0b121c",
          borderBottomWidth: 1,
          borderBottomColor: "#1f2937",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <SettingsIcon size={28} color="#f97316" />
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "white",
            }}
          >
            Settings
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: "#9ca3af" }}>
          Manage your preferences
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* Notifications Section */}
        <SettingSection title="Notifications">
          <SettingItem
            icon={Bell}
            title="Push Notifications"
            subtitle="Receive score updates and game reminders for your favorite teams"
            onPress={() => handleNotificationToggle(!notificationsEnabled)}
            showChevron={false}
            isLast
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: "#374151", true: "#f9731680" }}
                thumbColor={notificationsEnabled ? "#f97316" : "#9ca3af"}
              />
            }
          />
        </SettingSection>

        {/* Privacy & Legal Section */}
        <SettingSection title="Privacy & Legal">
          <SettingItem
            icon={Shield}
            title="Privacy Policy"
            subtitle="View how we collect and protect your data"
            onPress={openPrivacyPolicy}
            iconColor="#10b981"
            rightElement={<ExternalLink size={20} color="#9ca3af" />}
          />
          <SettingItem
            icon={Shield}
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={openTermsOfService}
            iconColor="#10b981"
            rightElement={<ExternalLink size={20} color="#9ca3af" />}
            isLast
          />
        </SettingSection>

        {/* Support Section */}
        <SettingSection title="Support">
          <SettingItem
            icon={Mail}
            title="Contact Support"
            subtitle="Email us at support@bracketone.us"
            onPress={openSupportEmail}
            iconColor="#3b82f6"
            rightElement={<ExternalLink size={20} color="#9ca3af" />}
            isLast
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data Management">
          <SettingItem
            icon={Trash2}
            title="Clear App Data"
            subtitle="Remove favorite teams, preferences, and other local data"
            onPress={handleClearData}
            iconColor="#ef4444"
            showChevron={false}
            isLast={!user}
          />
          {user && (
            <SettingItem
              icon={UserX}
              title="Delete Account"
              subtitle="Permanently delete your account and all associated data"
              onPress={handleDeleteAccount}
              iconColor="#dc2626"
              showChevron={false}
              isLast
            />
          )}
        </SettingSection>

        {/* App Info */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: 24,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            BracketOne Mobile
          </Text>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            Version {Constants.expoConfig?.version || "1.0.0"}
          </Text>
          <Text style={{ fontSize: 11, color: "#4b5563", marginTop: 8 }}>
            © {new Date().getFullYear()} BracketOne. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
