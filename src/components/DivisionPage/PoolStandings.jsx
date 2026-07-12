import { View, Text } from "react-native";

export function PoolStandings({ sortedTeams }) {
  return (
    <View
      style={{
        backgroundColor: "#1f2937",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#374151",
        padding: 12,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          marginBottom: 8,
          color: "#f97316",
        }}
      >
        Standings
      </Text>
      {/* Table Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 6,
          borderBottomWidth: 1,
          borderBottomColor: "#374151",
          marginBottom: 2,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: "600",
            color: "#9ca3af",
          }}
        >
          Team
        </Text>
        <Text
          style={{
            width: 28,
            fontSize: 12,
            fontWeight: "600",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          W
        </Text>
        <Text
          style={{
            width: 28,
            fontSize: 12,
            fontWeight: "600",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          L
        </Text>
        <Text
          style={{
            width: 36,
            fontSize: 12,
            fontWeight: "600",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          PD
        </Text>
        <Text
          style={{
            width: 32,
            fontSize: 12,
            fontWeight: "600",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          PA
        </Text>
        <Text
          style={{
            width: 32,
            fontSize: 12,
            fontWeight: "600",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          PS
        </Text>
      </View>
      {/* Table Rows */}
      {sortedTeams.map((team, idx) => {
        const { wins, losses, ps, pa, pd } = team.stats;
        const pdColor = pd > 0 ? "#10b981" : pd < 0 ? "#ef4444" : "#9ca3af";
        return (
          <View
            key={team.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 7,
              borderBottomWidth: idx < sortedTeams.length - 1 ? 1 : 0,
              borderBottomColor: "#374151",
              backgroundColor:
                idx === 0 ? "rgba(249, 115, 22, 0.05)" : "transparent",
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                color: "white",
                fontWeight: idx === 0 ? "600" : "400",
              }}
              numberOfLines={1}
            >
              {idx + 1}. {team.name}
            </Text>
            <Text
              style={{
                width: 28,
                fontSize: 13,
                color: "white",
                textAlign: "center",
              }}
            >
              {wins}
            </Text>
            <Text
              style={{
                width: 28,
                fontSize: 13,
                color: "white",
                textAlign: "center",
              }}
            >
              {losses}
            </Text>
            <Text
              style={{
                width: 36,
                fontSize: 13,
                color: pdColor,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {pd > 0 ? "+" : ""}
              {pd}
            </Text>
            <Text
              style={{
                width: 32,
                fontSize: 13,
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              {pa}
            </Text>
            <Text
              style={{
                width: 32,
                fontSize: 13,
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              {ps}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
