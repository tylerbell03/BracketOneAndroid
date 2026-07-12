import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Store favorites locally in AsyncStorage only - no backend tracking
async function getLocalFavorites(tournamentId) {
  try {
    const key = `favorites_${tournamentId}`;
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting local favorites:", error);
    return [];
  }
}

async function saveLocalFavorites(tournamentId, teamIds) {
  try {
    const key = `favorites_${tournamentId}`;
    await AsyncStorage.setItem(key, JSON.stringify(teamIds));
  } catch (error) {
    console.error("Error saving local favorites:", error);
  }
}

export function useFavoriteTeams(tournamentId) {
  const queryClient = useQueryClient();
  const [favoriteTeamIds, setFavoriteTeamIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from local storage on mount
  useEffect(() => {
    if (tournamentId) {
      getLocalFavorites(tournamentId).then((teamIds) => {
        setFavoriteTeamIds(teamIds);
        setIsLoading(false);
      });
    }
  }, [tournamentId]);

  const toggleFavorite = async (teamId) => {
    const isFav = favoriteTeamIds.includes(teamId);
    const newFavorites = isFav
      ? favoriteTeamIds.filter((id) => id !== teamId)
      : [...favoriteTeamIds, teamId];

    setFavoriteTeamIds(newFavorites);
    await saveLocalFavorites(tournamentId, newFavorites);
  };

  const isFavorite = (teamId) => {
    return favoriteTeamIds.includes(teamId);
  };

  const addFavorite = async (teamId) => {
    if (!favoriteTeamIds.includes(teamId)) {
      const newFavorites = [...favoriteTeamIds, teamId];
      setFavoriteTeamIds(newFavorites);
      await saveLocalFavorites(tournamentId, newFavorites);
    }
  };

  const removeFavorite = async (teamId) => {
    const newFavorites = favoriteTeamIds.filter((id) => id !== teamId);
    setFavoriteTeamIds(newFavorites);
    await saveLocalFavorites(tournamentId, newFavorites);
  };

  // Convert to format expected by components (array of objects with team_id)
  const favoriteTeams = favoriteTeamIds.map((team_id) => ({ team_id }));

  return {
    favoriteTeams,
    isLoading,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
  };
}
