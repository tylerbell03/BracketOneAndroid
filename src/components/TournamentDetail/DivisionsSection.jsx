import { View, Text } from "react-native";
import { DivisionCard } from "./DivisionCard";
import { getTeamCountForGrade } from "@/utils/tournamentUtils";
import { sortGrades } from "@/utils/gradeUtils";

export function DivisionsSection({ divisions, teams, tournamentId, errors }) {
  // All possible grades including split grades
  const allGrades = [
    ...Array.from({ length: 12 }, (_, i) => i + 1), // 1-12
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    107, // Split grades
    15, // Middle School
    16, // High School
    0, // JV
    14, // Varsity
  ];

  // Sort grades properly (1st, 1st/2nd, 2nd, 2nd/3rd, etc.)
  const grades = allGrades.sort(sortGrades);

  // Find Boys divisions that have teams
  const boysDivisions = grades
    .map((grade) => {
      const teamCount = getTeamCountForGrade(teams, "Boys", grade);
      return { division_type: "Boys", grade, teamCount, id: `Boys-${grade}` };
    })
    .filter((d) => d.teamCount > 0);

  // Find Girls divisions that have teams
  const girlsDivisions = grades
    .map((grade) => {
      const teamCount = getTeamCountForGrade(teams, "Girls", grade);
      return { division_type: "Girls", grade, teamCount, id: `Girls-${grade}` };
    })
    .filter((d) => d.teamCount > 0);

  return (
    <>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "white",
          marginBottom: 16,
        }}
      >
        Divisions
      </Text>

      {/* Empty state if no teams at all */}
      {teams.length === 0 && (
        <View
          style={{
            backgroundColor: "#1f2937",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#374151",
            padding: 24,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "#9ca3af", textAlign: "center" }}>
            No teams registered yet
          </Text>
        </View>
      )}

      {/* Show divisions if we have teams */}
      {boysDivisions.length > 0 && (
        <DivisionCard
          divisionType="Boys"
          divisionsList={boysDivisions}
          teams={teams}
          tournamentId={tournamentId}
        />
      )}

      {girlsDivisions.length > 0 && (
        <DivisionCard
          divisionType="Girls"
          divisionsList={girlsDivisions}
          teams={teams}
          tournamentId={tournamentId}
        />
      )}
    </>
  );
}
