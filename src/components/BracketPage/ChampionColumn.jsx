import { View, Text } from "react-native";
import {
  CHAMP_W,
  HEADER_H,
  CONN_W,
  LINE_CLR,
  LINE_W,
} from "@/utils/bracketLayoutUtils";

const CARD_H = 140;
const BLUE_LINE = "rgba(59, 130, 246, 0.5)";

function ChampCard({
  team,
  label,
  borderColor,
  bgColor,
  textColor,
  labelColor,
}) {
  return (
    <View
      style={{
        width: CHAMP_W - 10,
        backgroundColor: bgColor,
        borderWidth: 2,
        borderColor: borderColor,
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 6 }}>👑</Text>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: labelColor,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      {team ? (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
          }}
          numberOfLines={2}
        >
          {team.name}
        </Text>
      ) : (
        <Text style={{ fontSize: 12, color: textColor, fontStyle: "italic" }}>
          Winner TBD
        </Text>
      )}
    </View>
  );
}

export function ChampionColumn({
  // Non-split props
  championTeam,
  finalsYCenter,
  // Split props
  isSplit,
  c1ChampionTeam,
  c1YCenter,
  c2ChampionTeam,
  c2YCenter,
  c1Label = "Championship 1",
  c2Label = "Championship 2",
}) {
  if (isSplit) {
    return (
      <>
        {/* Connector column */}
        <View style={{ width: CONN_W, position: "relative" }}>
          {c1YCenter != null && (
            <View
              style={{
                position: "absolute",
                left: 0,
                top: c1YCenter - LINE_W / 2,
                width: CONN_W,
                height: LINE_W,
                backgroundColor: LINE_CLR,
              }}
            />
          )}
          {c2YCenter != null && (
            <View
              style={{
                position: "absolute",
                left: 0,
                top: c2YCenter - LINE_W / 2,
                width: CONN_W,
                height: LINE_W,
                backgroundColor: BLUE_LINE,
              }}
            />
          )}
        </View>

        {/* Champion cards column */}
        <View style={{ width: CHAMP_W, position: "relative" }}>
          {/* Header */}
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
                color: "#facc15",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              🏆 Champions
            </Text>
          </View>

          {/* C1 champion card */}
          {c1YCenter != null && (
            <View
              style={{
                position: "absolute",
                top: c1YCenter - CARD_H / 2,
                left: 0,
                width: CHAMP_W,
                alignItems: "center",
              }}
            >
              <ChampCard
                team={c1ChampionTeam}
                label={c1Label}
                borderColor="#eab308"
                bgColor="rgba(234, 179, 8, 0.15)"
                textColor="#facc15"
                labelColor="#facc15"
              />
            </View>
          )}

          {/* C2 champion card */}
          {c2YCenter != null && (
            <View
              style={{
                position: "absolute",
                top: c2YCenter - CARD_H / 2,
                left: 0,
                width: CHAMP_W,
                alignItems: "center",
              }}
            >
              <ChampCard
                team={c2ChampionTeam}
                label={c2Label}
                borderColor="#eab308"
                bgColor="rgba(234, 179, 8, 0.15)"
                textColor="#facc15"
                labelColor="#facc15"
              />
            </View>
          )}
        </View>
      </>
    );
  }

  // Non-split (original) champion display
  return (
    <>
      {/* Connector line from finals to champion */}
      <View style={{ width: CONN_W, position: "relative" }}>
        {finalsYCenter != null && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: finalsYCenter - LINE_W / 2,
              width: CONN_W,
              height: LINE_W,
              backgroundColor: LINE_CLR,
            }}
          />
        )}
      </View>

      {/* Champion display */}
      <View style={{ width: CHAMP_W, position: "relative" }}>
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
              color: "#facc15",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            🏆 Champion
          </Text>
        </View>

        {finalsYCenter != null && (
          <View
            style={{
              position: "absolute",
              top: finalsYCenter - 55,
              left: 0,
              width: CHAMP_W,
              alignItems: "center",
            }}
          >
            {championTeam ? (
              <View
                style={{
                  width: CHAMP_W - 10,
                  backgroundColor: "rgba(234, 179, 8, 0.15)",
                  borderWidth: 2,
                  borderColor: "#eab308",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 28, marginBottom: 8 }}>👑</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "white",
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {championTeam.name}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: "#facc15",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Tournament Winner
                </Text>
              </View>
            ) : (
              <View
                style={{
                  width: CHAMP_W - 10,
                  backgroundColor: "rgba(75, 85, 99, 0.3)",
                  borderWidth: 2,
                  borderColor: "#4b5563",
                  borderStyle: "dashed",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                    fontStyle: "italic",
                  }}
                >
                  Winner TBD
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
}
