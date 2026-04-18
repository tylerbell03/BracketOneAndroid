import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Users, Calendar, Trophy } from "lucide-react-native";
import { getGradeLabel, getTeamCountForGrade } from "@/utils/tournamentUtils";

export function DivisionCard({
  divisionType,
  divisionsList,
  teams,
  tournamentId,
}) {
  if (divisionsList.length === 0) return null;

  // Helper to validate and navigate
  const handleNavigation = (path) => {
    if (!tournamentId || tournamentId === "undefined") {
      return;
    }
    if (!divisionType || divisionType === "undefined") {
      return;
    }
    router.push(path);
  };

  return (
    <View
      style={{
        backgroundColor: "#1f2937",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#374151",
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "white",
          marginBottom: 12,
        }}
      >
        {divisionType}
      </Text>
      {divisionsList.map((division) => {
        const teamCount = getTeamCountForGrade(
          teams,
          divisionType,
          division.grade,
        );

        // Skip invalid grades
        if (!division.grade && division.grade !== 0) {
          return null;
        }

        return (
          <View key={division.id} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "white",
                marginBottom: 10,
              }}
            >
              {getGradeLabel(division.grade)} ({teamCount} teams)
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() =>
                  handleNavigation(
                    `/tournament/${tournamentId}/teams?division=${encodeURIComponent(divisionType)}&grade=${division.grade}`,
                  )
                }
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                  borderWidth: 1,
                  borderColor: "#4ade80",
                }}
              >
                <Users size={16} color="#4ade80" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#4ade80",
                  }}
                >
                  Teams
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  handleNavigation(
                    `/tournament/${tournamentId}/division/${encodeURIComponent(divisionType)}?grade=${division.grade}`,
                  )
                }
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                  borderWidth: 1,
                  borderColor: "#f97316",
                }}
              >
                <Calendar size={16} color="#f97316" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#f97316",
                  }}
                >
                  Games
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  handleNavigation(
                    `/tournament/${tournamentId}/bracket/${encodeURIComponent(divisionType)}?grade=${division.grade}`,
                  )
                }
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                  borderWidth: 1,
                  borderColor: "#c084fc",
                }}
              >
                <Trophy size={16} color="#c084fc" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#c084fc",
                  }}
                >
                  Bracket
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}
