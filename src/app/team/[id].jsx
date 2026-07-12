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
import { ChevronLeft, Users, Trophy, TrendingUp } from "lucide-react-native";
import { Image } from "expo-image";
import { apiCall } from "../../utils/api";
import { formatGameDateTime } from "../../utils/divisionFormatters";

function openMaps(address) {
  const encoded = encodeURIComponent(address);
  const url =
    Platform.OS === "ios" ? `maps:0,0?q=${encoded}` : `geo:0,0?q=${encoded}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  });
}

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: teamData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["team", id],
    queryFn: () => apiCall(`/api/teams/${id}`),
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
        <Text style={{ color: "#9ca3af", marginTop: 16 }}>Loading team...</Text>
      </View>
    );
  }

  const team = teamData?.team;
  const games = teamData?.games || [];

  if (!team) {
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
            Team not found
          </Text>
        </View>
      </View>
    );
  }

  const wins = games.filter(
    (g) =>
      (g.home_team_id === team.id && g.home_score > g.away_score) ||
      (g.away_team_id === team.id && g.away_score > g.home_score),
  ).length;

  const losses = games.filter(
    (g) =>
      (g.home_team_id === team.id && g.home_score < g.away_score) ||
      (g.away_team_id === team.id && g.away_score < g.home_score),
  ).length;

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
            fontSize: 24,
            fontWeight: "bold",
            color: "white",
            marginBottom: 8,
          }}
        >
          {team.name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {team.division && (
            <View
              style={{
                backgroundColor: "rgba(249, 115, 22, 0.2)",
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#f97316" }}
              >
                {team.division} {team.grade}th
              </Text>
            </View>
          )}
          {team.pool && (
            <View
              style={{
                backgroundColor: "#374151",
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#9ca3af" }}
              >
                Pool {team.pool}
              </Text>
            </View>
          )}
        </View>

        {team.coach_name && (
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>
            Coach: {team.coach_name}
          </Text>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
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
        {/* Stats */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#1f2937",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#374151",
              padding: 16,
              alignItems: "center",
            }}
          >
            <Trophy size={24} color="#10b981" />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "white",
                marginTop: 8,
              }}
            >
              {wins}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Wins</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#1f2937",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#374151",
              padding: 16,
              alignItems: "center",
            }}
          >
            <TrendingUp size={24} color="#ef4444" />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "white",
                marginTop: 8,
              }}
            >
              {losses}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Losses</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#1f2937",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#374151",
              padding: 16,
              alignItems: "center",
            }}
          >
            <Users size={24} color="#f97316" />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "white",
                marginTop: 8,
              }}
            >
              {games.length}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Games</Text>
          </View>
        </View>

        {/* Games List */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
            marginBottom: 16,
          }}
        >
          Games
        </Text>

        {games.length === 0 && (
          <View
            style={{
              backgroundColor: "#1f2937",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#374151",
              padding: 24,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 16, color: "#9ca3af", textAlign: "center" }}
            >
              No games scheduled yet
            </Text>
          </View>
        )}

        {games.map((game) => {
          const isHome = game.home_team_id === team.id;
          const opponent = isHome ? game.away_team_name : game.home_team_name;
          const teamScore = isHome ? game.home_score : game.away_score;
          const opponentScore = isHome ? game.away_score : game.home_score;
          const won = teamScore > opponentScore;
          const lost = teamScore < opponentScore;

          return (
            <TouchableOpacity
              key={game.id}
              onPress={() => router.push(`/game/${game.id}`)}
              style={{
                backgroundColor: "#1f2937",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#374151",
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "white",
                      marginBottom: 4,
                    }}
                  >
                    vs {opponent}
                  </Text>
                  {game.game_time && (
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                      {formatGameDateTime(game.game_time)}
                    </Text>
                  )}
                  {game.court_location && (
                    <TouchableOpacity
                      onPress={() => openMaps(game.court_location)}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#60a5fa",
                          textDecorationLine: "underline",
                        }}
                      >
                        {game.court_location}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {game.status === "completed" ? (
                  <View
                    style={{
                      backgroundColor: won
                        ? "rgba(16, 185, 129, 0.2)"
                        : lost
                          ? "rgba(239, 68, 68, 0.2)"
                          : "#374151",
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      minWidth: 80,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: won ? "#10b981" : lost ? "#ef4444" : "white",
                      }}
                    >
                      {teamScore} - {opponentScore}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: won ? "#10b981" : lost ? "#ef4444" : "#9ca3af",
                        marginTop: 2,
                      }}
                    >
                      {won ? "WIN" : lost ? "LOSS" : "TIE"}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: "#374151",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#9ca3af",
                      }}
                    >
                      {game.status === "in_progress"
                        ? "In Progress"
                        : "Scheduled"}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
