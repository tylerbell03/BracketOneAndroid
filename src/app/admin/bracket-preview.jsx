import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BracketPreviewPage() {
  const insets = useSafeAreaInsets();
  const [selectedSize, setSelectedSize] = useState(10);

  const teamSizes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <Stack.Screen
        options={{
          title: "Bracket Preview",
          headerStyle: { backgroundColor: "#0b121c" },
          headerTintColor: "#ffffff",
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Team Size Selector */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: "#f97316",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Select Team Count
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {teamSizes.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setSelectedSize(size)}
                style={{
                  backgroundColor:
                    selectedSize === size ? "#f97316" : "#1f2937",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: selectedSize === size ? 0 : 1,
                  borderColor: "#374151",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: selectedSize === size ? "bold" : "normal",
                  }}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bracket Visualization */}
        <BracketVisualization teamCount={selectedSize} />
      </ScrollView>
    </View>
  );
}

// Helper functions
const getTeamsForSize = (teamCount) => {
  const teams = [];
  for (let i = 1; i <= teamCount; i++) {
    teams.push({ seed: i, name: `Team ${i}` });
  }
  return teams;
};

const calculateByes = (teamCount) => {
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teamCount)));
  const byeCount = nextPowerOf2 - teamCount;
  const byeSeeds = [];
  for (let i = 1; i <= byeCount; i++) {
    byeSeeds.push(i);
  }
  return byeSeeds;
};

// Generate matchups for any team count
const generateMatchups = (teamCount) => {
  const teams = getTeamsForSize(teamCount);
  const rounds = Math.ceil(Math.log2(teamCount));
  const matchups = [];
  const byeSeeds = calculateByes(teamCount);

  // Special handling for 10-team bracket (3 play-in games)
  if (teamCount === 10) {
    // Play-In Round: 3 games (teams 5-10)
    const playInGames = [
      { team1: teams[4], team2: teams[9] }, // 5 vs 10
      { team1: teams[5], team2: teams[8] }, // 6 vs 9
      { team1: teams[6], team2: teams[7] }, // 7 vs 8
    ];
    matchups.push(playInGames);

    // Quarterfinals: 4 games (byes 1-4 + play-in winners)
    const quarterGames = [
      { team1: teams[0], team2: null }, // 1 vs winner
      { team1: teams[1], team2: null }, // 2 vs winner
      { team1: teams[2], team2: null }, // 3 vs winner
      { team1: teams[3], team2: null }, // 4 vs TBD
    ];
    matchups.push(quarterGames);

    // Semifinals: 2 games
    matchups.push([
      { team1: null, team2: null },
      { team1: null, team2: null },
    ]);

    // Finals: 1 game
    matchups.push([{ team1: null, team2: null }]);

    return matchups;
  }

  const round1Games = [];

  // Get teams playing in round 1 (not on bye)
  const playingSeeds = teams
    .filter((t) => !byeSeeds.includes(t.seed))
    .map((t) => t.seed);

  // Create matchups by pairing from outside in
  for (let i = 0; i < playingSeeds.length / 2; i++) {
    const team1Seed = playingSeeds[i];
    const team2Seed = playingSeeds[playingSeeds.length - 1 - i];
    const team1 = teams.find((t) => t.seed === team1Seed);
    const team2 = teams.find((t) => t.seed === team2Seed);
    round1Games.push({ team1, team2 });
  }

  matchups.push(round1Games);

  // Subsequent rounds (placeholders)
  for (let round = 1; round < rounds; round++) {
    const gamesInRound = Math.ceil(teamCount / Math.pow(2, round + 1));
    const roundGames = [];
    for (let i = 0; i < gamesInRound; i++) {
      roundGames.push({ team1: null, team2: null });
    }
    matchups.push(roundGames);
  }

  return matchups;
};

// Calculate bracket structure
const getBracketStructure = (teamCount) => {
  // Special handling for 10-team bracket
  if (teamCount === 10) {
    return [
      { round: 0, name: "Play-In", games: 3 },
      { round: 1, name: "Round 1", games: 4 },
      { round: 2, name: "Semifinals", games: 2 },
      { round: 3, name: "Finals", games: 1 },
    ];
  }

  const rounds = Math.ceil(Math.log2(teamCount));
  const structure = [];

  for (let round = 0; round < rounds; round++) {
    const gamesInRound = Math.ceil(teamCount / Math.pow(2, round + 1));

    // Determine round name
    let roundName;
    if (round === rounds - 1) {
      roundName = "Finals";
    } else if (round === rounds - 2) {
      roundName = "Semifinals";
    } else if (round === rounds - 3) {
      roundName = "Quarterfinals";
    } else {
      roundName = "Round 1";
    }

    structure.push({
      round: round + 1,
      name: roundName,
      games: gamesInRound,
    });
  }

  return structure;
};

const MatchupCard = ({ team1, team2 }) => {
  return (
    <View
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#374151",
        padding: 12,
        minHeight: 80,
      }}
    >
      {/* Team 1 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 6,
          borderBottomWidth: 1,
          borderBottomColor: "#374151",
        }}
      >
        <Text
          style={{
            color: "#f97316",
            fontSize: 11,
            fontWeight: "bold",
            marginRight: 8,
            minWidth: 24,
          }}
        >
          {team1 ? `#${team1.seed}` : ""}
        </Text>
        <Text
          style={{
            color: team1 ? "white" : "#6b7280",
            fontSize: 13,
            fontWeight: team1 ? "600" : "normal",
          }}
        >
          {team1 ? team1.name : "TBD"}
        </Text>
      </View>

      {/* Team 2 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 6,
        }}
      >
        <Text
          style={{
            color: "#f97316",
            fontSize: 11,
            fontWeight: "bold",
            marginRight: 8,
            minWidth: 24,
          }}
        >
          {team2 ? `#${team2.seed}` : ""}
        </Text>
        <Text
          style={{
            color: team2 ? "white" : "#6b7280",
            fontSize: 13,
            fontWeight: team2 ? "600" : "normal",
          }}
        >
          {team2 ? team2.name : "TBD"}
        </Text>
      </View>
    </View>
  );
};

const BracketVisualization = ({ teamCount }) => {
  const matchups = generateMatchups(teamCount);
  const structure = getBracketStructure(teamCount);
  const teams = getTeamsForSize(teamCount);
  const byeSeeds = calculateByes(teamCount);

  return (
    <View style={{ backgroundColor: "#0f1419", borderRadius: 12, padding: 16 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
      >
        <View style={{ flexDirection: "row", gap: 24 }}>
          {structure.map((round, roundIndex) => (
            <View key={roundIndex} style={{ minWidth: 180 }}>
              <Text
                style={{
                  color: "#f97316",
                  fontWeight: "bold",
                  marginBottom: 12,
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                {round.name}
              </Text>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 10,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                {roundIndex === 0 && teamCount === 10
                  ? "Preliminary Round"
                  : `Round ${roundIndex + 1}`}
              </Text>
              <View style={{ gap: 12 }}>
                {matchups[roundIndex]?.map((matchup, gameIndex) => (
                  <MatchupCard
                    key={gameIndex}
                    team1={matchup.team1}
                    team2={matchup.team2}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {byeSeeds.length > 0 && teamCount !== 10 && (
        <View
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#f9731620",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#f9731650",
          }}
        >
          <Text
            style={{
              color: "#fb923c",
              fontWeight: "600",
              marginBottom: 8,
              fontSize: 12,
            }}
          >
            Byes (Auto-advance to Round 2)
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {byeSeeds.map((seed) => {
              const team = teams.find((t) => t.seed === seed);
              return (
                <View
                  key={seed}
                  style={{
                    backgroundColor: "#1f2937",
                    borderWidth: 1,
                    borderColor: "#f9731650",
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "600" }}
                  >
                    {team.name}
                  </Text>
                  <Text style={{ color: "#fb923c", fontSize: 10 }}>
                    #{seed}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {teamCount === 10 && (
        <View
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#f9731620",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#f9731650",
          }}
        >
          <Text
            style={{
              color: "#fb923c",
              fontWeight: "600",
              marginBottom: 8,
              fontSize: 12,
            }}
          >
            Byes to Round 1
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[1, 2, 3, 4].map((seed) => {
              const team = teams.find((t) => t.seed === seed);
              return (
                <View
                  key={seed}
                  style={{
                    backgroundColor: "#1f2937",
                    borderWidth: 1,
                    borderColor: "#f9731650",
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "600" }}
                  >
                    {team.name}
                  </Text>
                  <Text style={{ color: "#fb923c", fontSize: 10 }}>
                    #{seed}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};
