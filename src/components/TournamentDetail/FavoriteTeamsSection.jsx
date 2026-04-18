import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import {
  Star,
  ChevronDown,
  ChevronUp,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { getTeamGames, getTeamRecord } from "@/utils/tournamentUtils";
import { formatGameDateTime } from "@/utils/divisionFormatters";

export function FavoriteTeamsSection({
  favoriteTeamIds,
  teams,
  games,
  onResetFavorites,
}) {
  const [expandedFavoriteId, setExpandedFavoriteId] = useState(null);

  if (favoriteTeamIds.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Star size={20} color="#facc15" fill="#facc15" />
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
            Your Favorite Teams
          </Text>
        </View>
        <TouchableOpacity onPress={onResetFavorites}>
          <Text style={{ fontSize: 13, color: "#9ca3af" }}>Change</Text>
        </TouchableOpacity>
      </View>
      {favoriteTeamIds
        .map((teamId) => teams.find((t) => t.id === teamId))
        .filter(Boolean)
        .sort((a, b) => {
          const nameCompare = a.name.localeCompare(b.name);
          if (nameCompare !== 0) return nameCompare;
          return Number(a.grade || 0) - Number(b.grade || 0);
        })
        .map((team) => {
          const isExpanded = expandedFavoriteId === team.id;
          const teamGames = getTeamGames(team.id, games);
          const { wins, losses } = getTeamRecord(team.id, teamGames);
          const gradeLabel =
            team.grade == 0
              ? "JV"
              : team.grade == 14
                ? "Varsity"
                : team.grade == 15
                  ? "Middle School"
                  : team.grade == 16
                    ? "High School"
                    : `Grade ${team.grade}`;
          return (
            <View key={team.id} style={{ marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() =>
                  setExpandedFavoriteId(isExpanded ? null : team.id)
                }
                activeOpacity={0.7}
                style={{
                  backgroundColor: "#1f2937",
                  borderRadius: isExpanded ? 12 : 12,
                  borderWidth: 1,
                  borderColor: isExpanded ? "#f97316" : "#374151",
                  borderBottomLeftRadius: isExpanded ? 0 : 12,
                  borderBottomRightRadius: isExpanded ? 0 : 12,
                  padding: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "white",
                        marginBottom: 2,
                      }}
                    >
                      {team.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                      {team.division} {gradeLabel}
                      {team.pool ? ` • Pool ${team.pool}` : ""}
                      {team.coach_name ? ` • Coach: ${team.coach_name}` : ""}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Star size={16} color="#facc15" fill="#facc15" />
                    {isExpanded ? (
                      <ChevronUp size={20} color="#9ca3af" />
                    ) : (
                      <ChevronDown size={20} color="#9ca3af" />
                    )}
                  </View>
                </View>
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
                        <TouchableOpacity
                          key={game.id}
                          onPress={() => router.push(`/game/${game.id}`)}
                          activeOpacity={0.7}
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
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#9ca3af",
                                }}
                              >
                                {formatGameDateTime(game.game_time)}
                              </Text>
                            )}
                            {game.court_location && (
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#9ca3af",
                                }}
                              >
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
                        </TouchableOpacity>
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
