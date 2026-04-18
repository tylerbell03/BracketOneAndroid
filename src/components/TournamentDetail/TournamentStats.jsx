import { View, Text } from "react-native";
import { Users, Trophy } from "lucide-react-native";

export function TournamentStats({ teamsCount, gamesCount }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#1f2937",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#374151",
          padding: 16,
          alignItems: "center",
        }}
      >
        <Users size={24} color="#f97316" />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "white",
            marginTop: 8,
          }}
        >
          {teamsCount}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>Teams</Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: "#1f2937",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#374151",
          padding: 16,
          alignItems: "center",
        }}
      >
        <Trophy size={24} color="#f97316" />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "white",
            marginTop: 8,
          }}
        >
          {gamesCount}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>Games</Text>
      </View>
    </View>
  );
}
