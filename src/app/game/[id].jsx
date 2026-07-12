import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ChevronLeft, MapPin, Calendar, Clock } from "lucide-react-native";
import { Image } from "expo-image";
import { apiCall } from "../../utils/api";
import {
  formatGameDate,
  formatGameTimeOnly,
} from "../../utils/divisionFormatters";

function openMaps(address) {
  const encoded = encodeURIComponent(address);
  const url =
    Platform.OS === "ios" ? `maps:0,0?q=${encoded}` : `geo:0,0?q=${encoded}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  });
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: gameData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["game", id],
    queryFn: () => apiCall(`/api/games/${id}`),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: "#9ca3af", marginTop: 16 }}>Loading game...</Text>
      </View>
    );
  }

  const game = gameData?.game;

  if (!game) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
        <StatusBar style="light" />
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <ChevronLeft size={24} color="#f97316" />
            <Text style={{ fontSize: 16, color: "#f97316" }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, color: "white", textAlign: "center" }}>
            Game not found
          </Text>
        </View>
      </View>
    );
  }

  const homeWon = game.home_score > game.away_score;
  const awayWon = game.away_score > game.home_score;
  const isTie = game.home_score === game.away_score;

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: "#0b121c",
          borderBottomWidth: 1,
          borderBottomColor: "#1f2937",
        }}
      >
        {/* BracketOne Logo */}
        <Image
          source={{
            uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
          }}
          style={{
            width: 360,
            height: 160,
            alignSelf: "center",
            marginBottom: -20,
          }}
          contentFit="contain"
        />

        {/* Tagline */}
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: "white", textAlign: "center" }}>
            Made for directors.{" "}
            <Text style={{ color: "#f97316" }}>Loved by fans.</Text>
          </Text>
        </View>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Game Details
        </Text>

        <View
          style={{
            backgroundColor:
              game.status === "completed"
                ? "rgba(16, 185, 129, 0.2)"
                : "#374151",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 4,
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: game.status === "completed" ? "#10b981" : "#9ca3af",
            }}
          >
            {game.status === "completed"
              ? "Final"
              : game.status === "in_progress"
                ? "In Progress"
                : "Scheduled"}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
      >
        {/* Scoreboard */}
        <View
          style={{
            backgroundColor: "#1f2937",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#374151",
            padding: 24,
            marginBottom: 24,
          }}
        >
          {/* Home Team */}
          <TouchableOpacity
            onPress={() => router.push(`/team/${game.home_team_id}`)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "white",
                flex: 1,
              }}
            >
              {game.home_team_name || "Home Team"}
            </Text>
            <View
              style={{
                backgroundColor: homeWon
                  ? "rgba(16, 185, 129, 0.2)"
                  : "#374151",
                borderRadius: 8,
                paddingHorizontal: 20,
                paddingVertical: 12,
                minWidth: 60,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: homeWon ? "#10b981" : "white",
                  textAlign: "center",
                }}
              >
                {game.home_score}
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={{
              height: 1,
              backgroundColor: "#374151",
              marginBottom: 20,
            }}
          />

          {/* Away Team */}
          <TouchableOpacity
            onPress={() => router.push(`/team/${game.away_team_id}`)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "white",
                flex: 1,
              }}
            >
              {game.away_team_name || "Away Team"}
            </Text>
            <View
              style={{
                backgroundColor: awayWon
                  ? "rgba(16, 185, 129, 0.2)"
                  : "#374151",
                borderRadius: 8,
                paddingHorizontal: 20,
                paddingVertical: 12,
                minWidth: 60,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: awayWon ? "#10b981" : "white",
                  textAlign: "center",
                }}
              >
                {game.away_score}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Game Info */}
        <View
          style={{
            backgroundColor: "#1f2937",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#374151",
            padding: 16,
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
            Game Information
          </Text>

          {game.game_time && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <Calendar size={20} color="#9ca3af" />
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                {formatGameDate(game.game_time)}
              </Text>
            </View>
          )}

          {game.game_time && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <Clock size={20} color="#9ca3af" />
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                {formatGameTimeOnly(game.game_time)}
              </Text>
            </View>
          )}

          {game.court_location && (
            <TouchableOpacity
              onPress={() => openMaps(game.court_location)}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <MapPin size={20} color="#60a5fa" />
              <Text
                style={{
                  fontSize: 14,
                  color: "#60a5fa",
                  textDecorationLine: "underline",
                }}
              >
                {game.court_location}
              </Text>
            </TouchableOpacity>
          )}

          {game.bracket_division && (
            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: "#374151",
              }}
            >
              <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                Division
              </Text>
              <Text style={{ fontSize: 14, color: "white" }}>
                {game.bracket_division} {game.bracket_grade}th Grade
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
