import { View, Text, TouchableOpacity } from "react-native";
import { CARD_W, CARD_H, formatGameDateTime } from "@/utils/bracketLayoutUtils";
import { openMaps } from "@/utils/mapsUtils";

// Matches the web BRACKET_COLORS palette (1-indexed)
const BRACKET_COLORS = [
  {
    bg: "rgba(147,51,234,0.1)",
    border: "rgba(168,85,247,0.4)",
    label: "#c084fc",
    time: "#a78bfa",
    seed: "#a855f7",
    divider: "rgba(168,85,247,0.25)",
    infoBorder: "rgba(168,85,247,0.15)",
  },
  {
    bg: "rgba(37,99,235,0.1)",
    border: "rgba(59,130,246,0.4)",
    label: "#60a5fa",
    time: "#60a5fa",
    seed: "#3b82f6",
    divider: "rgba(59,130,246,0.25)",
    infoBorder: "rgba(59,130,246,0.15)",
  },
  {
    bg: "rgba(22,163,74,0.1)",
    border: "rgba(34,197,94,0.4)",
    label: "#4ade80",
    time: "#4ade80",
    seed: "#22c55e",
    divider: "rgba(34,197,94,0.25)",
    infoBorder: "rgba(34,197,94,0.15)",
  },
  {
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(239,68,68,0.4)",
    label: "#f87171",
    time: "#f87171",
    seed: "#ef4444",
    divider: "rgba(239,68,68,0.25)",
    infoBorder: "rgba(239,68,68,0.15)",
  },
  {
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(245,158,11,0.4)",
    label: "#fbbf24",
    time: "#fbbf24",
    seed: "#f59e0b",
    divider: "rgba(245,158,11,0.25)",
    infoBorder: "rgba(245,158,11,0.15)",
  },
  {
    bg: "rgba(219,39,119,0.1)",
    border: "rgba(236,72,153,0.4)",
    label: "#f472b6",
    time: "#f472b6",
    seed: "#ec4899",
    divider: "rgba(236,72,153,0.25)",
    infoBorder: "rgba(236,72,153,0.15)",
  },
];
const DEFAULT_COLOR = BRACKET_COLORS[0]; // purple for non-split

function getBracketColor(champNum) {
  if (champNum == null) return DEFAULT_COLOR;
  return BRACKET_COLORS[(champNum - 1) % BRACKET_COLORS.length];
}

export function MatchupCard({
  matchup,
  team1,
  team2,
  championshipLabel,
  gameNumber = null,
  colorIndex = null,
}) {
  // Defensive checks for all data
  if (!matchup) {
    return (
      <View
        style={{
          width: CARD_W,
          height: CARD_H,
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          borderWidth: 1.5,
          borderColor: "rgba(59, 130, 246, 0.4)",
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#6b7280", fontSize: 14 }}>Loading...</Text>
      </View>
    );
  }

  // colorIndex prop overrides championship_bracket_num-based color when provided
  const c =
    colorIndex != null
      ? BRACKET_COLORS[colorIndex % BRACKET_COLORS.length]
      : getBracketColor(matchup.championship_bracket_num);
  const courtInfo = matchup.court_location || matchup.scheduled_court || null;
  const dateTimeStr = formatGameDateTime(matchup) || null;
  const hasGame = !!matchup.game_id;
  const homeScore = matchup.home_score ?? 0;
  const awayScore = matchup.away_score ?? 0;
  const isTeam1Home = matchup.game_home_team_id === matchup.team1_id;
  const team1Score = isTeam1Home ? homeScore : awayScore;
  const team2Score = isTeam1Home ? awayScore : homeScore;
  // championshipLabel is now passed as a prop (custom name from the division record)

  return (
    <View
      style={{
        width: CARD_W,
        height: CARD_H,
        backgroundColor: c.bg,
        borderWidth: 1.5,
        borderColor: c.border,
        borderRadius: 10,
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      {/* Game number badge */}
      {gameNumber != null && (
        <View
          style={{
            position: "absolute",
            top: 4,
            left: 6,
            backgroundColor: "rgba(78,52,0,0.85)",
            borderRadius: 4,
            paddingHorizontal: 5,
            paddingVertical: 2,
            zIndex: 10,
          }}
        >
          <Text style={{ color: "#d97706", fontSize: 9, fontWeight: "700" }}>
            G{gameNumber}
          </Text>
        </View>
      )}

      {/* Championship label */}
      {championshipLabel ? (
        <View
          style={{
            alignItems: "center",
            paddingBottom: 4,
            marginBottom: 2,
            borderBottomWidth: 1,
            borderBottomColor: c.infoBorder,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: c.label,
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
            borderBottomColor: c.infoBorder,
          }}
        >
          {dateTimeStr ? (
            <Text
              style={{
                fontSize: 13,
                color: c.time,
                fontWeight: "600",
                paddingLeft: gameNumber != null ? 24 : 0,
              }}
            >
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
              ? "rgba(16,185,129,0.35)"
              : "transparent",
          borderRadius: 4,
        }}
      >
        {matchup.team1_seed && team1 && matchup.team1_seed.length <= 3 ? (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: c.seed,
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
        {team1 ? (
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
            {team1.name}
          </Text>
        ) : (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 14,
              fontStyle: "italic",
              color: "#9ca3af",
            }}
          >
            {matchup.team1_seed && matchup.team1_seed !== "TBD"
              ? matchup.team1_seed
              : "TBD"}
          </Text>
        )}
        {hasGame ? (
          <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
            {team1Score}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: c.divider,
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
              ? "rgba(16,185,129,0.35)"
              : "transparent",
          borderRadius: 4,
        }}
      >
        {matchup.team2_seed && team2 && matchup.team2_seed.length <= 3 ? (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: c.seed,
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
        {team2 ? (
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
            {team2.name}
          </Text>
        ) : (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 14,
              fontStyle: "italic",
              color: "#9ca3af",
            }}
          >
            {matchup.team2_seed && matchup.team2_seed !== "TBD"
              ? matchup.team2_seed
              : "TBD"}
          </Text>
        )}
        {hasGame ? (
          <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
            {team2Score}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
