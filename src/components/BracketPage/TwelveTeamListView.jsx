import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Format time without timezone conversion
function formatScheduledTime(timeStr) {
  if (!timeStr) return "";

  const dateStr = timeStr.split("T")[0];
  const timePart =
    timeStr.split("T")[1]?.split(".")[0] || timeStr.split("T")[1];

  if (!dateStr || !timePart) return "";

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour24, minute] = timePart.split(":").map(Number);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const tempDate = new Date(Date.UTC(year, month - 1, day));
  const dayName = days[tempDate.getUTCDay()];

  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const minuteStr = minute.toString().padStart(2, "0");

  return `${dayName}, ${month}/${day}, ${hour12}:${minuteStr} ${ampm}`;
}

function GameCard({ matchup, teams }) {
  const team1 = teams.find((t) => t.id === matchup.team1_id);
  const team2 = teams.find((t) => t.id === matchup.team2_id);

  const team1Name = matchup.team1_seed || team1?.name || "TBD";
  const team2Name = matchup.team2_seed || team2?.name || "TBD";

  const team1Won = matchup.winner_id === matchup.team1_id;
  const team2Won = matchup.winner_id === matchup.team2_id;

  return (
    <View
      style={{
        backgroundColor: "#1f2937",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
    >
      {/* Team 1 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 8,
          backgroundColor: team1Won ? "rgba(34, 197, 94, 0.15)" : "transparent",
          paddingHorizontal: 8,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            color: team1Won ? "#22c55e" : "#ffffff",
            fontSize: 17,
            fontWeight: team1Won ? "700" : "400",
            flex: 1,
          }}
        >
          {team1Name}
        </Text>
        {matchup.game_id && (
          <Text
            style={{
              color: team1Won ? "#22c55e" : "#9ca3af",
              fontSize: 19,
              fontWeight: "600",
              marginLeft: 12,
            }}
          >
            {matchup.team1_score ?? "-"}
          </Text>
        )}
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "#374151",
          marginVertical: 4,
        }}
      />

      {/* Team 2 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 8,
          backgroundColor: team2Won ? "rgba(34, 197, 94, 0.15)" : "transparent",
          paddingHorizontal: 8,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            color: team2Won ? "#22c55e" : "#ffffff",
            fontSize: 17,
            fontWeight: team2Won ? "700" : "400",
            flex: 1,
          }}
        >
          {team2Name}
        </Text>
        {matchup.game_id && (
          <Text
            style={{
              color: team2Won ? "#22c55e" : "#9ca3af",
              fontSize: 19,
              fontWeight: "600",
              marginLeft: 12,
            }}
          >
            {matchup.team2_score ?? "-"}
          </Text>
        )}
      </View>

      {/* Game info if scheduled */}
      {matchup.scheduled_time && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: "#9ca3af", fontSize: 13 }}>
            {formatScheduledTime(matchup.scheduled_time)}
            {matchup.scheduled_court && ` • ${matchup.scheduled_court}`}
          </Text>
        </View>
      )}
    </View>
  );
}

export function TwelveTeamListView({ allMatchups, teams }) {
  const insets = useSafeAreaInsets();

  // Separate play-in and round 1 matchups
  const playInMatchups = allMatchups
    .filter((m) => m.round === 0)
    .sort((a, b) => a.position - b.position);

  const round1Matchups = allMatchups
    .filter((m) => m.round === 1)
    .sort((a, b) => a.position - b.position);

  // Determine bracket type and mapping
  const is15Team = playInMatchups.length === 7;

  // For 15-team brackets: play-in position → round 1 position
  // 0→0, 1→1, 2→1, 3→2, 4→2, 5→3, 6→3
  const playInToRound1 = is15Team
    ? { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3 }
    : null;

  // Build layout rows
  const layoutRows = [];

  if (is15Team) {
    // For 15-team brackets, group play-ins by their destination quarterfinal
    for (let r1Pos = 0; r1Pos < round1Matchups.length; r1Pos++) {
      // Find all play-in games that feed into this R1 game
      const connectedPlayIns = playInMatchups.filter(
        (pi) => playInToRound1[pi.position] === r1Pos,
      );

      layoutRows.push({
        playIns: connectedPlayIns, // Can be 1 or 2 games
        round1: round1Matchups[r1Pos],
      });
    }
  } else {
    // For 12-team brackets: 1-to-1 mapping
    for (let i = 0; i < round1Matchups.length; i++) {
      layoutRows.push({
        playIns: playInMatchups[i] ? [playInMatchups[i]] : [],
        round1: round1Matchups[i],
      });
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
        paddingTop: 16,
      }}
    >
      {/* Headers Row */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          marginBottom: 16,
        }}
      >
        {/* Play-In Header */}
        <View style={{ flex: 1, marginRight: 8 }}>
          <View
            style={{
              backgroundColor: "#7c3aed",
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderBottomWidth: 4,
              borderBottomColor: "#a78bfa",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 15,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Play-In Games
            </Text>
            <Text
              style={{
                color: "#e9d5ff",
                fontSize: 12,
                textAlign: "center",
                marginTop: 2,
              }}
            >
              Preliminary Round
            </Text>
          </View>
        </View>

        {/* Round 1 Header */}
        <View style={{ flex: 1, marginLeft: 8 }}>
          <View
            style={{
              backgroundColor: "#f97316",
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderBottomWidth: 4,
              borderBottomColor: "#fb923c",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 15,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Quarterfinals
            </Text>
            <Text
              style={{
                color: "#fed7aa",
                fontSize: 12,
                textAlign: "center",
                marginTop: 2,
              }}
            >
              Round 1
            </Text>
          </View>
        </View>
      </View>

      {/* Game Rows */}
      <View style={{ paddingHorizontal: 16 }}>
        {layoutRows.map((row, index) => (
          <View key={index} style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row" }}>
              {/* Play-In Games Column - can show 1 or 2 games stacked */}
              <View style={{ flex: 1, marginRight: 8 }}>
                {row.playIns.length > 0 ? (
                  row.playIns.map((playIn, piIndex) => (
                    <View key={playIn.id}>
                      <GameCard matchup={playIn} teams={teams} />
                      {/* Connector line */}
                      {piIndex === row.playIns.length - 1 && (
                        <View
                          style={{
                            position: "absolute",
                            right: -16,
                            top: "50%",
                            width: 16,
                            height: 2,
                            backgroundColor: "#7c3aed",
                          }}
                        />
                      )}
                    </View>
                  ))
                ) : (
                  <View style={{ marginBottom: 12 }} />
                )}
              </View>

              {/* Round 1 Game Column */}
              <View style={{ flex: 1, marginLeft: 8 }}>
                <GameCard matchup={row.round1} teams={teams} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
