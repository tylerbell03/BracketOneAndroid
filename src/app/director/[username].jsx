import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Share2,
  Trophy,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react-native";

export default function DirectorPublicProfilePage() {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, error } = useQuery({
    queryKey: ["director-public", username],
    queryFn: async () => {
      const response = await fetch(`/api/director/${username}/tournaments`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Director not found");
        }
        throw new Error("Failed to fetch director profile");
      }
      return response.json();
    },
  });

  const handleShare = async () => {
    try {
      const url = `https://bracketone.us/director/${username}`;
      await Linking.openURL(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      );
    } catch (error) {
      Alert.alert("Share", "Unable to share profile");
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0b121c",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#9ca3af" }}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
        <StatusBar style="light" />
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 16 }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
          }}
        >
          <Trophy size={64} color="#4b5563" />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "white",
              marginTop: 16,
            }}
          >
            Director Not Found
          </Text>
          <Text style={{ color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
            {error?.message === "Director not found"
              ? "This director profile doesn't exist"
              : "Failed to load director profile"}
          </Text>
        </View>
      </View>
    );
  }

  const { director, tournaments } = data;
  const accentColor = director.profile_color || "#f97316";

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <StatusBar style="light" />

      {/* Header with Back Button */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Hero Section */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          {/* Director Avatar */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: accentColor,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontSize: 36, fontWeight: "bold" }}>
              {director.username[0].toUpperCase()}
            </Text>
          </View>

          {/* Director Info */}
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "white",
              marginBottom: 8,
            }}
          >
            @{director.username}
          </Text>

          {director.bio && (
            <Text
              style={{
                fontSize: 16,
                color: "#d1d5db",
                marginTop: 8,
                lineHeight: 24,
              }}
            >
              {director.bio}
            </Text>
          )}

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            <Trophy size={20} color={accentColor} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#e5e7eb" }}>
              {tournaments.length}
            </Text>
            <Text style={{ fontSize: 16, color: "#9ca3af" }}>
              {tournaments.length === 1 ? "Tournament" : "Tournaments"}
            </Text>
          </View>

          {/* Share Button */}
          <TouchableOpacity
            onPress={handleShare}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: `${accentColor}20`,
              borderColor: `${accentColor}50`,
              borderWidth: 2,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 24,
            }}
          >
            <Share2 size={20} color={accentColor} />
            <Text style={{ color: accentColor, fontWeight: "600" }}>
              Share Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tournaments Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "white",
              marginBottom: 16,
            }}
          >
            Tournaments
          </Text>

          {tournaments.length === 0 ? (
            <View
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#374151",
                padding: 32,
                alignItems: "center",
              }}
            >
              <Trophy size={48} color="#4b5563" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "white",
                  marginTop: 16,
                }}
              >
                No tournaments yet
              </Text>
              <Text
                style={{ color: "#9ca3af", marginTop: 8, textAlign: "center" }}
              >
                This director hasn't created any public tournaments yet
              </Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {tournaments.map((tournament) => (
                <TouchableOpacity
                  key={tournament.id}
                  onPress={() => router.push(`/tournament/${tournament.id}`)}
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#374151",
                    padding: 16,
                  }}
                >
                  {tournament.logo_url && (
                    <View
                      style={{
                        width: "100%",
                        height: 128,
                        borderRadius: 8,
                        backgroundColor: "#374151",
                        marginBottom: 12,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={tournament.logo_url}
                        alt={tournament.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </View>
                  )}

                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "white",
                      marginBottom: 12,
                    }}
                  >
                    {tournament.name}
                  </Text>

                  {tournament.location && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <MapPin size={16} color="#9ca3af" />
                      <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                        {tournament.location}
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Calendar size={16} color="#9ca3af" />
                    <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                      {new Date(tournament.start_date).toLocaleDateString(
                        "en-US",
                        { timeZone: "UTC" },
                      )}{" "}
                      -{" "}
                      {new Date(tournament.end_date).toLocaleDateString(
                        "en-US",
                        { timeZone: "UTC" },
                      )}
                    </Text>
                  </View>

                  {tournament.description && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#9ca3af",
                        marginBottom: 12,
                      }}
                      numberOfLines={2}
                    >
                      {tournament.description}
                    </Text>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: accentColor,
                      }}
                    >
                      View Tournament
                    </Text>
                    <ExternalLink size={16} color={accentColor} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
