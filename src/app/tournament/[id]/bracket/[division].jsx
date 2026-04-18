import { Fragment } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ZoomIn, ZoomOut } from "lucide-react-native";
import { apiCall } from "../../../../utils/api";
import useUser from "../../../../utils/auth/useUser";
import { getGradeLabel } from "../../../../utils/gradeUtils";
import { useBracketData } from "../../../../hooks/useBracketData";
import { useBracketRefresh } from "../../../../hooks/useBracketRefresh";
import { LoadingState } from "../../../../components/BracketPage/LoadingState";
import { EmptyBracketState } from "../../../../components/BracketPage/EmptyBracketState";
import { BracketHeader } from "../../../../components/BracketPage/BracketHeader";
import { RoundColumn } from "../../../../components/BracketPage/RoundColumn";
import { RoundConnectors } from "../../../../components/BracketPage/RoundConnectors";
import { ChampionColumn } from "../../../../components/BracketPage/ChampionColumn";

export default function BracketPage() {
  const { id: tournamentId, division, grade } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();

  // Zoom and pan values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const { data: tournamentData, isLoading: tournamentLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => apiCall(`/api/tournaments/${tournamentId}`),
    enabled: !!tournamentId,
  });

  const {
    data: matchupsData = [],
    isLoading: matchupsLoading,
    refetch: refetchMatchups,
  } = useQuery({
    queryKey: ["brackets", tournamentId, division, grade],
    queryFn: () =>
      apiCall(
        `/api/brackets?tournament_id=${tournamentId}&division_type=${division}&grade=${grade}`,
      ),
    enabled: !!tournamentId && !!grade && !!division,
  });

  const { data: teamsData = [], refetch: refetchTeams } = useQuery({
    queryKey: ["teams", tournamentId],
    queryFn: () => apiCall(`/api/teams?tournament_id=${tournamentId}`),
    enabled: !!tournamentId,
  });

  const { refreshing, spin, handleRefresh } = useBracketRefresh(
    refetchMatchups,
    refetchTeams,
  );

  const tournament = tournamentData?.tournament;
  const allMatchups = matchupsData?.matchups || [];
  const teams = teamsData?.teams || [];

  // Detect if this is a split bracket
  const isSplitBracket = allMatchups.some(
    (m) => m.championship_bracket_num != null,
  );

  const { rounds, roundNumbers, yPositions, totalBracketH, maxRound } =
    useBracketData(allMatchups);

  // Filter out the last round for split brackets
  const filteredRoundNumbers =
    isSplitBracket && roundNumbers.length > 1
      ? roundNumbers.slice(0, -1)
      : roundNumbers;

  // Infer team count from bracket structure
  const inferTeamCount = () => {
    const playInCount = allMatchups.filter((m) => m.round === 0).length;
    const round1Count = allMatchups.filter((m) => m.round === 1).length;

    if (playInCount === 0 && round1Count === 1) return 3;
    if (playInCount === 0 && round1Count === 2) return 4;
    if (playInCount === 1 && round1Count === 2) return 5;
    if (playInCount === 2 && round1Count === 2) return 6;
    if (playInCount === 0 && round1Count === 3) return 7;
    if (playInCount === 0 && round1Count === 4) return 8;
    if (playInCount === 1 && round1Count === 4) return 9;
    if (playInCount === 2 && round1Count === 4) return 10;
    if (playInCount === 3 && round1Count === 4) return 11;
    if (playInCount === 4 && round1Count === 4) return 12;
    if (playInCount === 5 && round1Count === 4) return 13;
    if (playInCount === 6 && round1Count === 4) return 14;
    if (playInCount === 7 && round1Count === 4) return 15; // FIX: 15-team has 7 play-ins + 4 QF, not 8 QF
    if (playInCount === 0 && round1Count === 8) return 16;
    if (playInCount === 1 && round1Count === 8) return 17;
    if (playInCount === 2 && round1Count === 8) return 18;
    if (playInCount === 3 && round1Count === 8) return 19;
    if (playInCount === 4 && round1Count === 8) return 20;

    return teams?.length || 0;
  };

  const numTeams = inferTeamCount();

  // Zoom in/out button handlers
  const handleZoomIn = () => {
    const newScale = Math.min(4, scale.value * 1.3);
    scale.value = withSpring(newScale, { damping: 20, stiffness: 90 });
    savedScale.value = newScale;
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.375, scale.value / 1.3);
    scale.value = withSpring(newScale, { damping: 20, stiffness: 90 });
    savedScale.value = newScale;

    // Reset position if zoomed all the way out
    if (newScale <= 1) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  };

  // Pan gesture for moving when zoomed - with smooth deceleration
  const panGesture = Gesture.Pan()
    .enabled(scale.value !== 1)
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd((event) => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;

      // Add deceleration based on velocity for buttery smooth panning
      const velocityX = event.velocityX;
      const velocityY = event.velocityY;

      if (Math.abs(velocityX) > 100 || Math.abs(velocityY) > 100) {
        translateX.value = withSpring(translateX.value + velocityX * 0.2, {
          damping: 20,
          stiffness: 90,
          mass: 0.8,
        });
        translateY.value = withSpring(translateY.value + velocityY * 0.2, {
          damping: 20,
          stiffness: 90,
          mass: 0.8,
        });

        savedTranslateX.value = translateX.value + velocityX * 0.2;
        savedTranslateY.value = translateY.value + velocityY * 0.2;
      }
    });

  // Double tap to reset zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 20, stiffness: 90 });
      savedScale.value = 1;
      translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  // Combine gestures - pinch removed, only pan and double-tap
  const composedGesture = Gesture.Simultaneous(panGesture, doubleTapGesture);

  // Animated style for zoom and pan
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (tournamentLoading || matchupsLoading) {
    return <LoadingState />;
  }

  const isOwner = tournament?.owner_id === user?.id || user?.is_admin;
  const gradeLabel = getGradeLabel(grade);

  if (allMatchups.length === 0) {
    return (
      <EmptyBracketState
        division={division}
        gradeLabel={gradeLabel}
        tournamentName={tournament?.name}
        isOwner={isOwner}
      />
    );
  }

  // Determine champion from finals matchup - only for non-split brackets
  const finalsRound =
    filteredRoundNumbers.length > 0
      ? filteredRoundNumbers[filteredRoundNumbers.length - 1]
      : null;
  const finalsMatchup =
    finalsRound != null && rounds[finalsRound] ? rounds[finalsRound][0] : null;
  const championTeam = finalsMatchup?.winner_id
    ? teams.find((t) => t.id === finalsMatchup.winner_id)
    : null;
  const finalsYCenter =
    finalsRound != null && yPositions[finalsRound]
      ? yPositions[finalsRound][0]
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#0b121c" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <BracketHeader
        division={division}
        gradeLabel={gradeLabel}
        tournamentName={tournament?.name}
        onRefresh={handleRefresh}
        spin={spin}
      />

      {/* Bracket visualization with zoom buttons */}
      <ScrollView
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#f97316"
          />
        }
      >
        <ScrollView
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={animatedStyle}>
              <View style={{ flexDirection: "row", height: totalBracketH }}>
                {filteredRoundNumbers.map((roundNum, ri) => {
                  const roundMatchups = rounds[roundNum];
                  const yCenters = yPositions[roundNum] || [];

                  return (
                    <Fragment key={roundNum}>
                      <RoundColumn
                        roundNum={roundNum}
                        roundMatchups={roundMatchups}
                        yCenters={yCenters}
                        teams={teams}
                        maxRound={maxRound}
                        roundNumbers={filteredRoundNumbers}
                        numTeams={numTeams}
                      />

                      {/* Connector lines to next round */}
                      {ri < filteredRoundNumbers.length - 1 ? (
                        <RoundConnectors
                          currentYCenters={yCenters}
                          nextYCenters={
                            yPositions[filteredRoundNumbers[ri + 1]] || []
                          }
                          currentCount={roundMatchups.length}
                          nextCount={
                            rounds[filteredRoundNumbers[ri + 1]]?.length || 0
                          }
                          numTeams={numTeams}
                        />
                      ) : null}
                    </Fragment>
                  );
                })}

                {/* Champion Column - only show for non-split brackets */}
                {!isSplitBracket && finalsRound != null && (
                  <ChampionColumn
                    championTeam={championTeam}
                    finalsYCenter={finalsYCenter}
                  />
                )}
              </View>
            </Animated.View>
          </GestureDetector>
        </ScrollView>
      </ScrollView>

      {/* Zoom Controls */}
      <View
        style={{
          position: "absolute",
          right: 16,
          bottom: insets.bottom + 80,
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={handleZoomIn}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#1e293b",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <ZoomIn size={24} color="#f97316" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleZoomOut}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#1e293b",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <ZoomOut size={24} color="#f97316" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
