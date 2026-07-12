import { useState } from "react";
import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import {
  Trophy,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { formatGameDateTime } from "@/utils/divisionFormatters";

function openMaps(address) {
  const encoded = encodeURIComponent(address);
  const url =
    Platform.OS === "ios" ? `maps:0,0?q=${encoded}` : `geo:0,0?q=${encoded}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  });
}

export function TeamsSection({
  teams,
  games = [],
  tournamentId,
  division,
  grade,
}) {
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  const toggleTeam = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  const getTeamGames = (teamId) => {
    return games.filter(
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
    <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: "white",
          marginBottom: 12,
        }}
      >
        Teams
      </Text>

      {teams.map((team) => {
        const isExpanded = expandedTeamId === team.id;
        const teamGames = getTeamGames(team.id);
        const { wins, losses } = getTeamRecord(team.id, teamGames);

        return (
          <View key={team.id} style={{ marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => toggleTeam(team.id)}
              activeOpacity={0.7}
              style={{
                backgroundColor: "#1f2937",
                borderRadius: isExpanded ? 12 : 12,
                borderWidth: 1,
                borderColor: isExpanded ? "#f97316" : "#374151",
                borderBottomLeftRadius: isExpanded ? 0 : 12,
                borderBottomRightRadius: isExpanded ? 0 : 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "white" }}
                >
                  {team.name}
                </Text>
                {team.coach_name && (
                  <Text
                    style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
                  >
                    Coach: {team.coach_name}
                  </Text>
                )}
                {team.pool && (
                  <Text
                    style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
                  >
                    Pool {team.pool}
                  </Text>
                )}
              </View>
              {isExpanded ? (
                <ChevronUp size={20} color="#9ca3af" />
              ) : (
                <ChevronDown size={20} color="#9ca3af" />
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
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>Wins</Text>
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
                      game.status === "completed" && teamScore > opponentScore;
                    const lost =
                      game.status === "completed" && teamScore < opponentScore;

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
                            <TouchableOpacity
                              onPress={() => openMaps(game.court_location)}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
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
    </View>
  );
}
