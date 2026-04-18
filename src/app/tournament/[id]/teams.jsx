import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Animated,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  Trophy,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react-native";
import { Image } from "expo-image";
import { apiCall } from "@/utils/api";
import { formatGameDateTime } from "@/utils/divisionFormatters";

export default function TeamsPage() {
  const { id: tournamentId, division, grade } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedDivision, setSelectedDivision] = useState(division || "all");
  const [selectedGrade, setSelectedGrade] = useState(grade || "all");
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  const { data: tournamentData, isLoading: tournamentLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => apiCall(`/api/tournaments/${tournamentId}`),
    enabled: !!tournamentId,
  });

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams", tournamentId],
    queryFn: () => apiCall(`/api/teams?tournament_id=${tournamentId}`),
    enabled: !!tournamentId,
  });

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["games", tournamentId],
    queryFn: async () => {
      const result = await apiCall(`/api/games?tournament_id=${tournamentId}`);
      // Debug: Check raw data from API
      if (result?.games?.[0]) {
        console.log("=== TEAMS TAB DEBUG ===");
        console.log("First game raw data:", result.games[0]);
        console.log("game_time value:", result.games[0].game_time);
        console.log("game_time type:", typeof result.games[0].game_time);
        console.log("Is Date?:", result.games[0].game_time instanceof Date);
      }
      return result;
    },
    enabled: !!tournamentId,
  });

  useEffect(() => {
    if (refreshing) {
      animationRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      animationRef.current.start();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      spinValue.setValue(0);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [refreshing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] }),
      queryClient.invalidateQueries({ queryKey: ["teams", tournamentId] }),
      queryClient.invalidateQueries({ queryKey: ["games", tournamentId] }),
    ]);
    setRefreshing(false);
  };

  if (tournamentLoading || teamsLoading || gamesLoading) {
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
  const teams = teamsData?.teams || [];
  const allGames = gamesData?.games || [];

  const divisions = [
    "all",
    ...new Set(teams.map((t) => t.division).filter(Boolean)),
  ];
  const grades = [
    "all",
    ...new Set(teams.map((t) => t.grade).filter(Boolean)),
  ].sort((a, b) => {
    if (a === "all") return -1;
    if (b === "all") return 1;
    return Number(a) - Number(b);
  });

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      !search ||
      team.name?.toLowerCase().includes(search.toLowerCase()) ||
      team.coach_name?.toLowerCase().includes(search.toLowerCase());
    const matchesDivision =
      selectedDivision === "all" || team.division === selectedDivision;
    const matchesGrade = selectedGrade === "all" || team.grade == selectedGrade;
    return matchesSearch && matchesDivision && matchesGrade;
  });

  const getGradeLabel = (grade) => {
    if (grade == 15) return "MS";
    if (grade == 0) return "JV";
    if (grade == 14) return "Varsity";
    return `${grade}th`;
  };

  const getHeaderTitle = () => {
    if (division && division !== "all" && grade && grade !== "all") {
      return `${division} ${getGradeLabel(grade)} Teams`;
    }
    return "Teams";
  };

  const toggleTeam = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  const getTeamGames = (teamId) => {
    return allGames.filter(
      (g) => g.home_team_id === teamId || g.away_team_id === teamId,
    );
  };

  const getTeamRecord = (teamId, teamGames) => {
    const wins = teamGames.filter(
      (g) =>
        g.status === "completed" &&
        ((g.home_team_id === teamId && g.home_score > g.away_score) ||
          (g.away_team_id === teamId && g.away_score > g.home_score)),
    ).length;

    const losses = teamGames.filter(
      (g) =>
        g.status === "completed" &&
        ((g.home_team_id === teamId && g.home_score < g.away_score) ||
          (g.away_team_id === teamId && g.away_score < g.home_score)),
    ).length;

    return { wins, losses };
  };

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
              {getHeaderTitle()}
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>
              {tournament?.name}
            </Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={{ marginLeft: 8 }}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <RefreshCw size={20} color="#f97316" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1f2937",
              borderRadius: 8,
              paddingHorizontal: 12,
            }}
          >
            <Search size={16} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search teams or coaches..."
              placeholderTextColor="#9ca3af"
              style={{
                flex: 1,
                color: "white",
                paddingVertical: 10,
                paddingHorizontal: 8,
                fontSize: 14,
              }}
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        >
          {divisions.map((div) => (
            <TouchableOpacity
              key={div}
              onPress={() => setSelectedDivision(div)}
              style={{
                backgroundColor:
                  selectedDivision === div ? "#f97316" : "transparent",
                borderWidth: 1,
                borderColor: selectedDivision === div ? "#f97316" : "#374151",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: selectedDivision === div ? "white" : "#9ca3af",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {div === "all" ? "All Divisions" : div}
              </Text>
            </TouchableOpacity>
          ))}
          {grades.map((grade) => (
            <TouchableOpacity
              key={grade}
              onPress={() => setSelectedGrade(grade)}
              style={{
                backgroundColor:
                  selectedGrade === grade ? "#f97316" : "transparent",
                borderWidth: 1,
                borderColor: selectedGrade === grade ? "#f97316" : "#374151",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: selectedGrade === grade ? "white" : "#9ca3af",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {grade === "all" ? "All Grades" : getGradeLabel(grade)}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#f97316"
          />
        }
      >
        {filteredTeams.map((team) => {
          const isExpanded = expandedTeamId === team.id;
          const teamGames = getTeamGames(team.id);
          const { wins, losses } = getTeamRecord(team.id, teamGames);

          return (
            <View key={team.id} style={{ marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => toggleTeam(team.id)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: "#1f2937",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isExpanded ? "#f97316" : "#374151",
                  borderBottomLeftRadius: isExpanded ? 0 : 12,
                  borderBottomRightRadius: isExpanded ? 0 : 12,
                  padding: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      flex: 1,
                      color: "white",
                    }}
                  >
                    {team.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {team.division && (
                      <View
                        style={{
                          backgroundColor: "#f97316",
                          borderRadius: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 10,
                            fontWeight: "600",
                          }}
                        >
                          {team.division} {getGradeLabel(team.grade)}
                        </Text>
                      </View>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={20} color="#9ca3af" />
                    ) : (
                      <ChevronDown size={20} color="#9ca3af" />
                    )}
                  </View>
                </View>
                {team.coach_name && (
                  <Text
                    style={{ fontSize: 14, color: "#9ca3af", marginTop: 2 }}
                  >
                    Coach: {team.coach_name}
                  </Text>
                )}
                {team.pool && (
                  <Text
                    style={{ fontSize: 14, color: "#9ca3af", marginTop: 2 }}
                  >
                    Pool {team.pool}
                  </Text>
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View
                  style={{
                    backgroundColor: "#1a2332",
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderColor: "#f97316",
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    padding: 12,
                  }}
                >
                  {/* Stats Row */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#1f2937",
                        borderRadius: 10,
                        padding: 12,
                        alignItems: "center",
                      }}
                    >
                      <Trophy size={18} color="#10b981" />
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "white",
                          marginTop: 4,
                        }}
                      >
                        {wins}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                        Wins
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#1f2937",
                        borderRadius: 10,
                        padding: 12,
                        alignItems: "center",
                      }}
                    >
                      <TrendingUp size={18} color="#ef4444" />
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "white",
                          marginTop: 4,
                        }}
                      >
                        {losses}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                        Losses
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#1f2937",
                        borderRadius: 10,
                        padding: 12,
                        alignItems: "center",
                      }}
                    >
                      <Users size={18} color="#f97316" />
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "white",
                          marginTop: 4,
                        }}
                      >
                        {teamGames.length}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                        Games
                      </Text>
                    </View>
                  </View>

                  {/* Games List */}
                  {teamGames.length === 0 ? (
                    <View
                      style={{
                        backgroundColor: "#1f2937",
                        borderRadius: 10,
                        padding: 16,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 13, color: "#9ca3af" }}>
                        No games scheduled yet
                      </Text>
                    </View>
                  ) : (
                    teamGames.map((game) => {
                      const isHome = game.home_team_id === team.id;
                      const opponentId = isHome
                        ? game.away_team_id
                        : game.home_team_id;
                      const opponent = teams.find((t) => t.id === opponentId);
                      const opponentName = opponent?.name || "TBD";
                      const teamScore = isHome
                        ? game.home_score
                        : game.away_score;
                      const opponentScore = isHome
                        ? game.away_score
                        : game.home_score;
                      const won =
                        game.status === "completed" &&
                        teamScore > opponentScore;
                      const lost =
                        game.status === "completed" &&
                        teamScore < opponentScore;

                      return (
                        <View
                          key={game.id}
                          style={{
                            backgroundColor: "#1f2937",
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 6,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "white",
                                marginBottom: 2,
                              }}
                            >
                              vs {opponentName}
                            </Text>
                            {game.game_time && (
                              <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                                {formatGameDateTime(game.game_time)}
                              </Text>
                            )}
                            {game.court_location && (
                              <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                                {game.court_location}
                              </Text>
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
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                minWidth: 70,
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "bold",
                                  color: won
                                    ? "#10b981"
                                    : lost
                                      ? "#ef4444"
                                      : "white",
                                }}
                              >
                                {teamScore} - {opponentScore}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: "600",
                                  color: won
                                    ? "#10b981"
                                    : lost
                                      ? "#ef4444"
                                      : "#9ca3af",
                                  marginTop: 1,
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
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
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
                      );
                    })
                  )}
                </View>
              )}
            </View>
          );
        })}

        {filteredTeams.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ fontSize: 16, color: "#9ca3af" }}>
              No teams found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
