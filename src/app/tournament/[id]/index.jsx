import { View, ScrollView, RefreshControl, Animated } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useRef } from "react";
import useUser from "../../../utils/auth/useUser";
import { useFavoriteTeams } from "../../../utils/useFavoriteTeams";
import TeamSelectionModal from "../../../components/TeamSelectionModal";
import { useTournamentDetailData } from "../../../hooks/useTournamentDetailData";
import { useFavoriteTeamsModal } from "../../../hooks/useFavoriteTeamsModal";
import { LoadingState } from "../../../components/TournamentDetail/LoadingState";
import { NotFoundState } from "../../../components/TournamentDetail/NotFoundState";
import { TournamentHeader } from "../../../components/TournamentDetail/TournamentHeader";
import { FavoriteTeamsSection } from "../../../components/TournamentDetail/FavoriteTeamsSection";
import { AddFavoritesPrompt } from "../../../components/TournamentDetail/AddFavoritesPrompt";
import { DivisionsSection } from "../../../components/TournamentDetail/DivisionsSection";
// import { PhotoContestBanner } from "../../../components/TournamentDetail/PhotoContestBanner";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { tournament, teams, games, divisions, isLoading, refetch, errors } =
    useTournamentDetailData(id);

  const {
    favoriteTeams,
    isLoading: favoritesLoading,
    toggleFavorite,
  } = useFavoriteTeams(id);
  const favoriteTeamIds = favoriteTeams.map((f) => f.team_id);

  const {
    showTeamSelection,
    hasSkipped,
    setShowTeamSelection,
    handleSkipFavorites,
    handleResetFavorites,
    handleSaveFavorites,
  } = useFavoriteTeamsModal(
    id,
    favoriteTeamIds,
    favoritesLoading,
    teams,
    isLoading,
  );

  const handleToggleTeam = (teamId) => {
    toggleFavorite(teamId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Validate tournament ID after hooks
  if (!id || id === "undefined") {
    return <NotFoundState insets={insets} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!tournament) {
    return <NotFoundState insets={insets} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <StatusBar style="light" />

      <TeamSelectionModal
        visible={showTeamSelection}
        teams={teams}
        selectedTeams={favoriteTeamIds}
        onToggleTeam={handleToggleTeam}
        onSave={handleSaveFavorites}
        onSkip={handleSkipFavorites}
        onClose={() => setShowTeamSelection(false)}
      />

      <TournamentHeader
        tournament={tournament}
        tournamentId={id}
        insets={insets}
        teams={teams}
        onRefresh={onRefresh}
        isRefreshing={refreshing}
        scrollY={scrollY}
      />

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Spacer to push content below the animated header */}
        <Animated.View
          style={{
            height: scrollY.interpolate({
              inputRange: [0, 200],
              outputRange: [420, 120],
              extrapolate: "clamp",
            }),
          }}
        />

        <FavoriteTeamsSection
          favoriteTeamIds={favoriteTeamIds}
          teams={teams}
          games={games}
          onResetFavorites={handleResetFavorites}
        />

        {favoriteTeamIds.length === 0 && hasSkipped && teams.length > 0 && (
          <AddFavoritesPrompt onPress={() => setShowTeamSelection(true)} />
        )}

        <DivisionsSection
          divisions={divisions}
          teams={teams}
          tournamentId={id}
          errors={errors}
        />

        {/* Photo Contest - Temporarily Hidden */}
        {/* <PhotoContestBanner tournamentId={id} /> */}
      </Animated.ScrollView>
    </View>
  );
}
