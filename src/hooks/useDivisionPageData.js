import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/utils/api";

export function useDivisionPageData(tournamentId, division, grade) {
  const {
    data: tournamentData,
    isLoading: tournamentLoading,
    error: tournamentError,
  } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: async () => {
      const result = await apiCall(`/api/tournaments/${tournamentId}`);
      return result;
    },
    enabled: !!tournamentId,
  });

  const {
    data: gamesData = [],
    isLoading: gamesLoading,
    refetch: refetchGames,
    error: gamesError,
  } = useQuery({
    queryKey: ["games", tournamentId, division, grade],
    queryFn: async () => {
      const result = await apiCall(`/api/games?tournament_id=${tournamentId}`);
      return result;
    },
    enabled: !!tournamentId,
  });

  const {
    data: teamsData = [],
    isLoading: teamsLoading,
    refetch: refetchTeams,
    error: teamsError,
  } = useQuery({
    queryKey: ["teams", tournamentId, division, grade],
    queryFn: async () => {
      const result = await apiCall(`/api/teams?tournament_id=${tournamentId}`);
      return result;
    },
    enabled: !!tournamentId,
  });

  const {
    data: courtsData = [],
    isLoading: courtsLoading,
    error: courtsError,
  } = useQuery({
    queryKey: ["courts", tournamentId],
    queryFn: async () => {
      const result = await apiCall(`/api/tournaments/${tournamentId}/courts`);
      return result;
    },
    enabled: !!tournamentId,
  });

  // NEW: Fetch pool standings from server (same calculation as web app)
  const {
    data: poolStandingsData,
    isLoading: poolStandingsLoading,
    refetch: refetchPoolStandings,
  } = useQuery({
    queryKey: ["poolStandings", tournamentId, division, grade],
    queryFn: async () => {
      const result = await apiCall(
        `/api/standings/pools?tournamentId=${tournamentId}&division=${division}&grade=${grade}`,
      );
      return result;
    },
    enabled: !!tournamentId && !!division && !!grade,
  });

  const tournament = tournamentData?.tournament;
  const games = gamesData?.games || [];
  const teams = teamsData?.teams || [];
  const courts = courtsData?.courts || [];
  const poolStandings = poolStandingsData?.pools || {};

  const isLoading =
    tournamentLoading ||
    gamesLoading ||
    teamsLoading ||
    courtsLoading ||
    poolStandingsLoading;

  const refetch = async () => {
    await Promise.all([refetchGames(), refetchTeams(), refetchPoolStandings()]);
  };

  return {
    tournament,
    games,
    teams,
    courts,
    poolStandings, // Pre-calculated pool standings from server
    isLoading,
    refetch,
  };
}
