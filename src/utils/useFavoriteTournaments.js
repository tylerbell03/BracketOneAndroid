import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "favorite_tournaments";

async function getLocalFavoriteTournaments() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting favorite tournaments:", error);
    return [];
  }
}

async function saveLocalFavoriteTournaments(ids) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error("Error saving favorite tournaments:", error);
  }
}

export function useFavoriteTournaments() {
  const [favoriteTournamentIds, setFavoriteTournamentIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLocalFavoriteTournaments().then((ids) => {
      setFavoriteTournamentIds(ids);
      setIsLoading(false);
    });
  }, []);

  const toggleFavorite = async (tournamentId) => {
    const numId = Number(tournamentId);
    const isFav = favoriteTournamentIds.includes(numId);
    const newFavorites = isFav
      ? favoriteTournamentIds.filter((id) => id !== numId)
      : [...favoriteTournamentIds, numId];

    setFavoriteTournamentIds(newFavorites);
    await saveLocalFavoriteTournaments(newFavorites);
  };

  const isFavorite = (tournamentId) => {
    return favoriteTournamentIds.includes(Number(tournamentId));
  };

  return {
    favoriteTournamentIds,
    isLoading,
    toggleFavorite,
    isFavorite,
  };
}
