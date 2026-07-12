import { View, ScrollView, RefreshControl, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useUser from "../../../../utils/auth/useUser";
import { useDivisionPageData } from "../../../../hooks/useDivisionPageData";
import { getGradeLabel } from "../../../../utils/divisionFormatters";
import { LoadingState } from "../../../../components/DivisionPage/LoadingState";
import { DivisionHeader } from "../../../../components/DivisionPage/DivisionHeader";
import { PoolSection } from "../../../../components/DivisionPage/PoolSection";
import { BracketGamesSection } from "../../../../components/DivisionPage/BracketGamesSection";

export default function DivisionPage() {
  const { id: tournamentId, division, grade } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Always call hooks unconditionally - now includes poolStandings from server
  const {
    tournament,
    games,
    teams,
    courts,
    poolStandings,
    isLoading,
    refetch,
  } = useDivisionPageData(tournamentId, division, grade);

  // Defensive checks for missing parameters AFTER hooks
  const hasMissingParams = !tournamentId || !division || !grade;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
    setRefreshing(false);
  };

  if (hasMissingParams) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: "#ef4444",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Missing Information
          </Text>
          <Text
            style={{
              color: "#9ca3af",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Cannot load division page without:
          </Text>
          {!tournamentId && (
            <Text style={{ color: "#9ca3af", fontSize: 12 }}>
              • Tournament ID
            </Text>
          )}
          {!division && (
            <Text style={{ color: "#9ca3af", fontSize: 12 }}>• Division</Text>
          )}
          {!grade && (
            <Text style={{ color: "#9ca3af", fontSize: 12 }}>• Grade</Text>
          )}
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: "#ef4444",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Error Loading Division
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  try {
    const isOwner = tournament?.owner_id === user?.id || user?.is_admin;

    const divisionGames = games.filter(
      (g) =>
        (g.bracket_division === division && g.bracket_grade == grade) ||
        teams.some(
          (t) =>
            (t.id === g.home_team_id || t.id === g.away_team_id) &&
            t.division === division &&
            t.grade == grade,
        ),
    );

    const divisionTeams = teams.filter(
      (t) => t.division === division && t.grade == grade,
    );

    const poolGames = divisionGames.filter((g) => !g.bracket_division);
    const bracketGames = divisionGames.filter(
      (g) => g.bracket_division && g.bracket_grade != null,
    );

    // Get pool names from poolStandings (server-sorted) instead of local teams
    const pools = Object.keys(poolStandings).sort();

    const gradeLabel = getGradeLabel(grade);

    return (
      <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
        <Stack.Screen options={{ headerShown: false }} />

        <DivisionHeader
          division={division}
          gradeLabel={gradeLabel}
          tournamentName={tournament?.name}
          onRefresh={onRefresh}
          insets={insets}
          isRefreshing={refreshing}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Pool Sections - now using server-sorted standings */}
          {pools.map((pool, poolIdx) => {
            // Get sorted teams from server
            const sortedPoolTeams = poolStandings[pool] || [];
            const poolPoolGames = poolGames.filter((g) => {
              const homeTeam = divisionTeams.find(
                (t) => t.id === g.home_team_id,
              );
              const awayTeam = divisionTeams.find(
                (t) => t.id === g.away_team_id,
              );
              return homeTeam?.pool === pool || awayTeam?.pool === pool;
            });

            return (
              <View
                key={pool}
                style={{
                  marginTop: poolIdx === 0 ? 12 : 28,
                  paddingHorizontal: 16,
                }}
              >
                <PoolSection
                  pool={pool}
                  poolTeams={sortedPoolTeams}
                  poolGames={poolPoolGames}
                  teams={teams}
                  courts={courts}
                  tournament={tournament}
                  isLastPool={poolIdx === pools.length - 1}
                />
              </View>
            );
          })}

          <BracketGamesSection
            bracketGames={bracketGames}
            teams={teams}
            courts={courts}
          />
        </ScrollView>
      </View>
    );
  } catch (err) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              color: "#ef4444",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Render Error
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 14, textAlign: "center" }}>
            {err.message}
          </Text>
        </View>
      </View>
    );
  }
}
