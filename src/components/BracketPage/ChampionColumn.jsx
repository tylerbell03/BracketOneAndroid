import { View, Text } from "react-native";
import {
  CHAMP_W,
  HEADER_H,
  CONN_W,
  LINE_CLR,
  LINE_W,
} from "@/utils/bracketLayoutUtils";

export function ChampionColumn({ championTeam, finalsYCenter }) {
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
