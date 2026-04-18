import { View, Text, TouchableOpacity } from "react-native";
import {
  CARD_W,
  CARD_H,
  formatGameDateTime,
  getChampionshipLabel,
} from "@/utils/bracketLayoutUtils";
import { openMaps } from "@/utils/mapsUtils";

export function MatchupCard({ matchup, team1, team2 }) {
  // Defensive checks for all data
  if (!matchup) {
    return (
      <View
        style={{
          width: CARD_W,
          height: CARD_H,
          backgroundColor: "rgba(147, 51, 234, 0.1)",
          borderWidth: 1.5,
          borderColor: "rgba(168, 85, 247, 0.4)",
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#6b7280", fontSize: 14 }}>Loading...</Text>
      </View>
    );
  }

  const courtInfo = matchup.court_location || matchup.scheduled_court || null;
  const dateTimeStr = formatGameDateTime(matchup) || null;
  const hasGame = !!matchup.game_id;
  const homeScore = matchup.home_score ?? 0;
  const awayScore = matchup.away_score ?? 0;
  const isTeam1Home = matchup.game_home_team_id === matchup.team1_id;
  const team1Score = isTeam1Home ? homeScore : awayScore;
  const team2Score = isTeam1Home ? awayScore : homeScore;
  const championshipLabel = getChampionshipLabel(matchup);

  return (
    <View
      style={{
        width: CARD_W,
        height: CARD_H,
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        borderWidth: 1.5,
        borderColor: "rgba(168, 85, 247, 0.4)",
        borderRadius: 10,
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      {/* Championship label */}
      {championshipLabel ? (
        <View
          style={{
            alignItems: "center",
            paddingBottom: 4,
            marginBottom: 2,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(168, 85, 247, 0.15)",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#c084fc",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {championshipLabel}
          </Text>
        </View>
      ) : null}

      {/* Game info bar */}
      {dateTimeStr || courtInfo ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 6,
            paddingBottom: 4,
            marginBottom: 2,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(168, 85, 247, 0.15)",
          }}
        >
          {dateTimeStr ? (
            <Text style={{ fontSize: 13, color: "#a78bfa", fontWeight: "600" }}>
              {dateTimeStr}
            </Text>
          ) : (
            <View />
          )}
          {courtInfo ? (
            <TouchableOpacity onPress={() => openMaps(courtInfo)}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  color: "#60a5fa",
                  fontWeight: "500",
                  maxWidth: 100,
                  textDecorationLine: "underline",
                }}
              >
                {courtInfo}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Team 1 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 4,
          paddingHorizontal: 6,
          backgroundColor:
            matchup.winner_id && matchup.winner_id === team1?.id
              ? "rgba(16, 185, 129, 0.35)"
              : "transparent",
          borderRadius: 4,
        }}
      >
        {matchup.team1_seed ? (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#a855f7",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 6,
            }}
          >
            <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
              {matchup.team1_seed}
            </Text>
          </View>
        ) : null}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight:
              matchup.winner_id && matchup.winner_id === team1?.id
                ? "700"
                : "500",
            color: "white",
          }}
        >
          {team1?.name || "TBD"}
        </Text>
        {hasGame ? (
          <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
            {team1Score}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "rgba(168, 85, 247, 0.25)",
          marginVertical: 4,
          marginHorizontal: 6,
        }}
      />

      {/* Team 2 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 4,
          paddingHorizontal: 6,
          backgroundColor:
            matchup.winner_id && matchup.winner_id === team2?.id
              ? "rgba(16, 185, 129, 0.35)"
              : "transparent",
          borderRadius: 4,
        }}
      >
        {matchup.team2_seed ? (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#a855f7",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 6,
            }}
          >
            <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
              {matchup.team2_seed}
            </Text>
          </View>
        ) : null}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight:
              matchup.winner_id && matchup.winner_id === team2?.id
                ? "700"
                : "500",
            color: "white",
          }}
        >
          {team2?.name || "TBD"}
        </Text>
        {hasGame ? (
          <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
            {team2Score}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
