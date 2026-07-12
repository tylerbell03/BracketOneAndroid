import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/utils/api";

export function useTournamentDetailData(tournamentId) {
  const {
    data: tournamentData,
    isLoading: tournamentLoading,
    refetch: refetchTournament,
    error: tournamentError,
  } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => apiCall(`/api/tournaments/${tournamentId}`),
    enabled: !!tournamentId && tournamentId !== "undefined",
  });

  const {
    data: teamsData,
    refetch: refetchTeams,
    error: teamsError,
  } = useQuery({
    queryKey: ["teams", tournamentId],
    queryFn: () => apiCall(`/api/teams?tournament_id=${tournamentId}`),
    enabled: !!tournamentId && tournamentId !== "undefined",
  });

  const {
    data: gamesData,
    refetch: refetchGames,
    error: gamesError,
  } = useQuery({
    queryKey: ["games", tournamentId],
    queryFn: () => apiCall(`/api/games?tournament_id=${tournamentId}`),
    enabled: !!tournamentId && tournamentId !== "undefined",
  });

  const {
    data: divisionsData,
    refetch: refetchDivisions,
    error: divisionsError,
  } = useQuery({
    queryKey: ["divisions", tournamentId],
    queryFn: () => apiCall(`/api/divisions?tournament_id=${tournamentId}`),
    enabled: !!tournamentId && tournamentId !== "undefined",
  });

  const refetch = async () => {
    await Promise.all([
      refetchTournament(),
      refetchTeams(),
      refetchGames(),
      refetchDivisions(),
    ]);
  };

  return {
    tournament: tournamentData?.tournament,
    teams: teamsData?.teams || [],
    games: gamesData?.games || [],
    divisions: divisionsData?.divisions || [],
    isLoading: tournamentLoading,
    errors: {
      tournament: tournamentError,
      teams: teamsError,
      games: gamesError,
      divisions: divisionsError,
    },
    refetch,
  };
}
