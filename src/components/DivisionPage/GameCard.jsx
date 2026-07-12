import { View, Text, Linking, TouchableOpacity, Platform } from "react-native";
import { Clock, MapPin } from "lucide-react-native";
import {
  getStatusLabel,
  getStatusColor,
  formatGameTime,
} from "@/utils/divisionFormatters";

function openMaps(address) {
  const encoded = encodeURIComponent(address);
  const url =
    Platform.OS === "ios" ? `maps:0,0?q=${encoded}` : `geo:0,0?q=${encoded}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://maps.google.com/?q=${encoded}`);
  });
}

export function GameCard({ game, teams, courts = [], isBracket = false }) {
  const homeTeam = teams.find((t) => t.id === game.home_team_id);
  const awayTeam = teams.find((t) => t.id === game.away_team_id);
  const homeWon =
    game.status === "completed" && game.home_score > game.away_score;
  const awayWon =
    game.status === "completed" && game.away_score > game.home_score;
  const timeInfo = formatGameTime(game.game_time);

  const matchedCourt = game.court_location
    ? courts.find((c) => c.name === game.court_location)
    : null;
  const courtAddress = matchedCourt?.address || null;

  const baseColor = isBracket ? "#a855f7" : "#f97316";
  const bgColor = isBracket
    ? "rgba(147, 51, 234, 0.1)"
    : "rgba(249, 115, 22, 0.1)";

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: baseColor,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
      }}
    >
      {isBracket && (
        <View
          style={{
            backgroundColor: "rgba(168, 85, 247, 0.2)",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
            alignSelf: "flex-start",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: "#c4b5fd",
            }}
          >
            BRACKET GAME
          </Text>
        </View>
      )}
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
            fontWeight: "600",
            color: homeWon ? "#22c55e" : "white",
            flex: 1,
          }}
        >
          {homeTeam?.name || "TBD"}
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: homeWon ? "#22c55e" : "white",
            minWidth: 40,
            textAlign: "right",
          }}
        >
          {game.home_score || 0}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: awayWon ? "#22c55e" : "white",
            flex: 1,
          }}
        >
          {awayTeam?.name || "TBD"}
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: awayWon ? "#22c55e" : "white",
            minWidth: 40,
            textAlign: "right",
          }}
        >
          {game.away_score || 0}
        </Text>
      </View>

      {/* Always show date, time, and court */}
      {(timeInfo || game.court_location) && (
        <View style={{ marginTop: 8 }}>
          {timeInfo && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: game.court_location ? 4 : 0,
              }}
            >
              <Clock size={14} color="#9ca3af" />
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                {timeInfo.date} • {timeInfo.time}
              </Text>
            </View>
          )}
          {game.court_location && (
            <TouchableOpacity
              onPress={() => openMaps(courtAddress || game.court_location)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MapPin size={14} color="#60a5fa" />
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
          {courtAddress && (
            <TouchableOpacity onPress={() => openMaps(courtAddress)}>
              <Text
                style={{
                  fontSize: 11,
                  color: "#60a5fa",
                  textAlign: "right",
                  marginTop: 4,
                  textDecorationLine: "underline",
                }}
              >
                {courtAddress}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Status badge */}
      <View
        style={{
          marginTop: 12,
          borderTopWidth: 1,
          borderTopColor: isBracket
            ? "rgba(168, 85, 247, 0.3)"
            : "rgba(249, 115, 22, 0.3)",
          paddingTop: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor:
                game.status === "completed"
                  ? "rgba(16, 185, 129, 0.2)"
                  : game.status === "in_progress"
                    ? "rgba(245, 158, 11, 0.2)"
                    : "rgba(156, 163, 175, 0.2)",
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: getStatusColor(game.status),
              }}
            >
              {getStatusLabel(game.status)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
