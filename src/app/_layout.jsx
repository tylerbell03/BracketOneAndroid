import { useAuth } from "../utils/auth/useAuth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle } from "lucide-react-native";
import { Image } from "expo-image";
import { useNotifications } from "../utils/useNotifications";
import PWANavigation from "../components/PWANavigation";
import ErrorBoundary from "../components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function DataConsentModal({ visible, onAccept }) {
  const insets = useSafeAreaInsets();

  const openPrivacyPolicy = () => {
    import("react-native").then(({ Linking }) => {
      Linking.openURL("https://bracketone.us/privacy-policy").catch(() => {});
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 24,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Image
              source={{
                uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
              }}
              style={{
                width: 360,
                height: 160,
                marginBottom: 16,
              }}
              contentFit="contain"
            />
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "white",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Welcome to BracketOne
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              Your privacy matters to us
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#1f2937",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#374151",
              padding: 20,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "white",
                marginBottom: 16,
              }}
            >
              Data Collection & Privacy
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#d1d5db",
                lineHeight: 22,
                marginBottom: 16,
              }}
            >
              BracketOne is a spectator app for following basketball
              tournaments. Here's what data we may collect:
            </Text>

            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <CheckCircle
                  size={20}
                  color="#10b981"
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    Favorite Teams
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#9ca3af", lineHeight: 20 }}
                  >
                    We store your favorite teams on your device so you can
                    quickly follow their games and scores.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <CheckCircle
                  size={20}
                  color="#10b981"
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    Push Notifications
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#9ca3af", lineHeight: 20 }}
                  >
                    If enabled, we collect a device token to send you score
                    updates and game reminders. You can opt out anytime in
                    Settings.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <CheckCircle
                  size={20}
                  color="#10b981"
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    Usage Analytics
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#9ca3af", lineHeight: 20 }}
                  >
                    We track page views and app usage to improve our services
                    and user experience.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <CheckCircle
                  size={20}
                  color="#10b981"
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    Your Control
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#9ca3af", lineHeight: 20 }}
                  >
                    You can manage notifications and clear your local data
                    anytime from the Settings tab.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(249, 115, 22, 0.3)",
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 13, color: "#d1d5db", lineHeight: 20 }}>
              <Text style={{ fontWeight: "600", color: "#f97316" }}>
                Important:
              </Text>{" "}
              We never sell your personal information to third parties. Read our
              full{" "}
              <Text
                style={{
                  fontWeight: "600",
                  color: "#f97316",
                  textDecorationLine: "underline",
                }}
                onPress={openPrivacyPolicy}
              >
                Privacy Policy
              </Text>{" "}
              for complete details.
            </Text>
          </View>

          <TouchableOpacity
            onPress={onAccept}
            style={{
              backgroundColor: "#f97316",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
              I Understand & Accept
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 12,
              color: "#6b7280",
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            By continuing, you agree to our data collection practices as
            described above and in our Privacy Policy.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function RootLayout() {
  const { initiate } = useAuth();
  const [consentGiven, setConsentGiven] = useState(null);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useNotifications();

  useEffect(() => {
    const init = async () => {
      try {
        initiate();
        const consent = await AsyncStorage.getItem("data_consent_given");
        setConsentGiven(consent === "true");
      } catch (error) {
        console.error("Initialization error:", error);
        setConsentGiven(false);
      }
    };
    init();
  }, [initiate]);

  useEffect(() => {
    // Wait a tiny moment for custom splash to render, then hide native splash
    const hideNative = setTimeout(() => {
      SplashScreen.hideAsync().catch(console.error);
    }, 100);

    return () => clearTimeout(hideNative);
  }, []);

  useEffect(() => {
    // Hide custom splash after consent is loaded and brief display
    if (consentGiven !== null) {
      const timer = setTimeout(() => {
        setShowCustomSplash(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [consentGiven]);

  // Show custom splash screen while loading
  if (showCustomSplash && consentGiven !== null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0c111b",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={{
            uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
          }}
          style={{
            width: 200,
            height: 200,
          }}
          contentFit="contain"
        />
        <View style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
            Made for directors.
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#f97316" }}>
            Loved by fans.
          </Text>
        </View>
      </View>
    );
  }

  // Show loading screen while checking consent
  if (consentGiven === null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0c111b",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={{
            uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
          }}
          style={{
            width: 200,
            height: 200,
          }}
          contentFit="contain"
        />
        <View style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
            Made for directors.
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#f97316" }}>
            Loved by fans.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{ headerShown: false, animation: "none" }}
            initialRouteName="index"
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="tournament/[id]" />
            <Stack.Screen name="team/[id]" />
            <Stack.Screen name="game/[id]" />
          </Stack>
          <PWANavigation />
        </GestureHandlerRootView>

        {consentGiven === false && (
          <DataConsentModal
            visible={true}
            onAccept={async () => {
              try {
                await AsyncStorage.setItem("data_consent_given", "true");
                setConsentGiven(true);
              } catch (error) {
                console.error("Error saving consent:", error);
              }
            }}
          />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
