import { View, Text } from "react-native";
import {
  CARD_W,
  CARD_H,
  HEADER_H,
  BASE_SPACING,
  getRoundName,
} from "@/utils/bracketLayoutUtils";
import { MatchupCard } from "./MatchupCard";

export function RoundColumn({
  roundNum,
  roundMatchups,
  yCenters,
  teams,
  maxRound,
  roundNumbers,
  numTeams,
  championshipLabels = { c1: "Championship 1", c2: "Championship 2" },
  accentColor = "#c084fc",
  standalone = false,
  gameNumberMap = new Map(),
  colorIndex = null,
  customRoundLabel = null,
}) {
  // Defensive checks
  if (!roundMatchups || !Array.isArray(roundMatchups)) {
    return null;
  }

  if (!teams || !Array.isArray(teams)) {
    teams = [];
  }

  if (!yCenters || !Array.isArray(yCenters)) {
    yCenters = [];
  }

  return (
    <View style={{ width: CARD_W, position: "relative" }}>
      {/* Round header */}
      <View
        style={{
          height: HEADER_H,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {customRoundLabel ??
            getRoundName(
              roundNum,
              maxRound,
              roundNumbers,
              numTeams,
              standalone ? null : roundMatchups,
            )}
        </Text>
      </View>

      {/* Matchup cards positioned by computed Y */}
      {roundMatchups.map((matchup, i) => {
        if (!matchup || !matchup.id) return null;

        const team1 = teams.find((t) => t?.id === matchup.team1_id);
        const team2 = teams.find((t) => t?.id === matchup.team2_id);
        const yCenter = yCenters[i] ?? HEADER_H + i * BASE_SPACING + CARD_H / 2;

        // Resolve custom championship label for this matchup
        // In standalone mode the bracket already has a header — suppress per-card label
        const champNum = matchup.championship_bracket_num;
        const championshipLabel = standalone
          ? null
          : champNum === 1
            ? championshipLabels.c1
            : champNum === 2
              ? championshipLabels.c2
              : null;

        return (
          <View
            key={matchup.id}
            style={{
              position: "absolute",
              top: yCenter - CARD_H / 2,
              left: 0,
            }}
          >
            <MatchupCard
              matchup={matchup}
              team1={team1}
              team2={team2}
              championshipLabel={championshipLabel}
              gameNumber={gameNumberMap?.get(matchup.game_id) ?? null}
              colorIndex={colorIndex}
            />
          </View>
        );
      })}
    </View>
  );
}
