import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { Image } from "expo-image";
import { apiCall } from "../../../utils/api";

function openMaps(address) {
  const encoded = encodeURIComponent(address);
  const url =
    Platform.OS === "ios" ? `maps:0,0?q=${encoded}` : `geo:0,0?q=${encoded}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  });
}

export default function CourtSchedulesPage() {
  const { id: tournamentId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState("Saturday");

  const { data: tournamentData, isLoading: tournamentLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => apiCall(`/api/tournaments/${tournamentId}`),
    enabled: !!tournamentId,
  });

  const { data: courtsData = [], isLoading: courtsLoading } = useQuery({
    queryKey: ["courts", tournamentId],
    queryFn: () => apiCall(`/api/tournaments/${tournamentId}/courts`),
    enabled: !!tournamentId,
  });

  const { data: gamesData = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["games", tournamentId],
    queryFn: () => apiCall(`/api/games?tournament_id=${tournamentId}`),
    enabled: !!tournamentId,
  });

  const { data: teamsData = [] } = useQuery({
    queryKey: ["teams", tournamentId],
    queryFn: () => apiCall(`/api/teams?tournament_id=${tournamentId}`),
    enabled: !!tournamentId,
  });

  if (tournamentLoading || courtsLoading || gamesLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0b121c",
        }}
      >
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const tournament = tournamentData?.tournament;
  const courts = courtsData?.courts || [];
  const games = gamesData?.games || [];
  const teams = teamsData?.teams || [];

  // Generate day tabs using UTC to match web app
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const days = [];
  if (tournament?.start_date && tournament?.end_date) {
    const sp = tournament.start_date.split("T")[0].split("-").map(Number);
    const ep = tournament.end_date.split("T")[0].split("-").map(Number);
    const start = new Date(Date.UTC(sp[0], sp[1] - 1, sp[2]));
    const end = new Date(Date.UTC(ep[0], ep[1] - 1, ep[2]));
    const cur = new Date(start);
    while (cur.getTime() <= end.getTime()) {
      days.push(dayNames[cur.getUTCDay()]);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  }

  // Parse game time without timezone conversion
  const formatTime = (gameTime) => {
    if (!gameTime) return "TBD";
    const timeStr = gameTime.split("T")[1]?.split(".")[0] || "";
    if (!timeStr) return "TBD";
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const dayGames = games
    .filter((g) => {
      if (!g.game_time) return false;
      const dp = g.game_time.split("T")[0].split("-").map(Number);
      const d = new Date(Date.UTC(dp[0], dp[1] - 1, dp[2]));
      return dayNames[d.getUTCDay()] === selectedDay;
    })
    .sort((a, b) => (a.game_time || "").localeCompare(b.game_time || ""));

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ paddingTop: insets.top, backgroundColor: "#0b121c" }}>
        {/* BracketOne Logo */}
        <Image
          source={{
            uri: "https://ucarecdn.com/1dfead7a-9786-4b38-ac16-2856cb3caf11/-/format/auto/",
          }}
          style={{
            width: 360,
            height: 160,
            alignSelf: "center",
            marginTop: 8,
            marginBottom: -20,
          }}
          contentFit="contain"
        />

        {/* Tagline */}
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: "white", textAlign: "center" }}>
            Made for directors.{" "}
            <Text style={{ color: "#f97316" }}>Loved by fans.</Text>
          </Text>
        </View>

        <View
          style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              Court Schedules
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>
              {tournament?.name}
            </Text>
          </View>
        </View>

        {/* Day Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        >
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={{
                backgroundColor:
                  selectedDay === day ? "#f97316" : "transparent",
                borderWidth: 1,
                borderColor: selectedDay === day ? "#f97316" : "#374151",
                borderRadius: 20,
                paddingHorizontal: 20,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: selectedDay === day ? "white" : "#9ca3af",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {courts.map((court) => {
          const courtGames = dayGames.filter(
            (g) => g.court_location === court.name,
          );

          if (courtGames.length === 0) return null;

          return (
            <View key={court.id} style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "white",
                  }}
                >
                  {court.name}
                </Text>
                {court.address && (
                  <TouchableOpacity onPress={() => openMaps(court.address)}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#60a5fa",
                        textDecorationLine: "underline",
                      }}
                    >
                      Directions
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {courtGames.map((game) => {
                const homeTeam = teams.find((t) => t.id === game.home_team_id);
                const awayTeam = teams.find((t) => t.id === game.away_team_id);
                const isBracketGame = !!game.bracket_division;

                return (
                  <View
                    key={game.id}
                    style={{
                      backgroundColor: isBracketGame
                        ? "rgba(147, 51, 234, 0.1)"
                        : "rgba(249, 115, 22, 0.1)",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isBracketGame
                        ? "rgba(168, 85, 247, 0.4)"
                        : "rgba(249, 115, 22, 0.4)",
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 6,
                      }}
                    >
                      {formatTime(game.game_time)}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        {homeTeam?.name || "TBD"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        {game.home_score || 0}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        {awayTeam?.name || "TBD"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        {game.away_score || 0}
                      </Text>
                    </View>
                    {isBracketGame && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#c084fc",
                          marginTop: 4,
                          fontWeight: "600",
                        }}
                      >
                        {game.bracket_division} Bracket
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {dayGames.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ fontSize: 16, color: "#9ca3af" }}>
              No games scheduled for {selectedDay}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
