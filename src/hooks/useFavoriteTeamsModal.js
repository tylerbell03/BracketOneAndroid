import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useFavoriteTeamsModal(
  tournamentId,
  favoriteTeamIds,
  favoritesLoading,
  teams,
  tournamentLoading,
) {
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [hasCheckedFavorites, setHasCheckedFavorites] = useState(false);

  useEffect(() => {
    if (
      !favoritesLoading &&
      !hasCheckedFavorites &&
      favoriteTeamIds.length === 0 &&
      teams.length > 0 &&
      !tournamentLoading
    ) {
      const checkSkipped = async () => {
        try {
          const skipped = await AsyncStorage.getItem(
            `tournament_${tournamentId}_skipped`,
          );
          if (skipped) {
            setHasSkipped(true);
          } else {
            setShowTeamSelection(true);
          }
        } catch (e) {
          console.error(e);
        }
        setHasCheckedFavorites(true);
      };
      checkSkipped();
    }
  }, [
    favoritesLoading,
    hasCheckedFavorites,
    favoriteTeamIds.length,
    teams.length,
    tournamentLoading,
    tournamentId,
  ]);

  const handleSkipFavorites = async () => {
    setShowTeamSelection(false);
    setHasSkipped(true);
    try {
      await AsyncStorage.setItem(`tournament_${tournamentId}_skipped`, "true");
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetFavorites = async () => {
    try {
      await AsyncStorage.removeItem(`tournament_${tournamentId}_skipped`);
    } catch (e) {
      console.error(e);
    }
    setHasSkipped(false);
    setShowTeamSelection(true);
  };

  const handleSaveFavorites = () => {
    setShowTeamSelection(false);
    setHasSkipped(false);
  };

  return {
    showTeamSelection,
    hasSkipped,
    setShowTeamSelection,
    handleSkipFavorites,
    handleResetFavorites,
    handleSaveFavorites,
  };
}
