import { Fragment, useMemo } from "react";
import {
  View,
  Text,
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
import { useBracketRefresh } from "../../../../hooks/useBracketRefresh";
import { LoadingState } from "../../../../components/BracketPage/LoadingState";
import { EmptyBracketState } from "../../../../components/BracketPage/EmptyBracketState";
import { BracketHeader } from "../../../../components/BracketPage/BracketHeader";
import { RoundColumn } from "../../../../components/BracketPage/RoundColumn";
import { RoundConnectors } from "../../../../components/BracketPage/RoundConnectors";
import {
  computeYPositions,
  CARD_H,
  CARD_W,
  CONN_W,
  CHAMP_W,
  HEADER_H,
  LINE_W,
} from "../../../../utils/bracketLayoutUtils";

// ── Color palette (matches web) ──────────────────────────────────────────────
const BRACKET_COLORS = [
  {
    border: "rgba(147,51,234,0.6)",
    bg: "rgba(147,51,234,0.08)",
    text: "#c084fc",
    line: "rgba(168,85,247,0.5)",
    champ: "#a855f7",
    champBg: "rgba(168,85,247,0.15)",
  },
  {
    border: "rgba(59,130,246,0.6)",
    bg: "rgba(37,99,235,0.08)",
    text: "#60a5fa",
    line: "rgba(59,130,246,0.5)",
    champ: "#3b82f6",
    champBg: "rgba(59,130,246,0.15)",
  },
  {
    border: "rgba(34,197,94,0.6)",
    bg: "rgba(22,163,74,0.08)",
    text: "#4ade80",
    line: "rgba(34,197,94,0.5)",
    champ: "#22c55e",
    champBg: "rgba(34,197,94,0.15)",
  },
  {
    border: "rgba(239,68,68,0.6)",
    bg: "rgba(220,38,38,0.08)",
    text: "#f87171",
    line: "rgba(239,68,68,0.5)",
    champ: "#ef4444",
    champBg: "rgba(239,68,68,0.15)",
  },
  {
    border: "rgba(245,158,11,0.6)",
    bg: "rgba(217,119,6,0.08)",
    text: "#fbbf24",
    line: "rgba(245,158,11,0.5)",
    champ: "#f59e0b",
    champBg: "rgba(245,158,11,0.15)",
  },
  {
    border: "rgba(236,72,153,0.6)",
    bg: "rgba(219,39,119,0.08)",
    text: "#f472b6",
    line: "rgba(236,72,153,0.5)",
    champ: "#ec4899",
    champBg: "rgba(236,72,153,0.15)",
  },
];
const getBracketColor = (champNum) =>
  BRACKET_COLORS[(champNum - 1) % BRACKET_COLORS.length];

// ── Infer team count for one bracket from its play-in / round-1 structure ───
function inferNumTeams(playInCount, round1Count) {
  if (playInCount === 0 && round1Count === 1) return 2;
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
  if (playInCount === 7 && round1Count === 4) return 15;
  if (playInCount === 0 && round1Count === 8) return 16;
  if (playInCount === 1 && round1Count === 8) return 17;
  if (playInCount === 2 && round1Count === 8) return 18;
  if (playInCount === 3 && round1Count === 8) return 19;
  if (playInCount === 4 && round1Count === 8) return 20;
  return round1Count * 2;
}

// ── Helper: round label for double-elim Winners section ─────────────────────
function getWinnersRoundLabel(roundNum, maxWBRound) {
  if (roundNum <= maxWBRound) {
    const fromEnd = maxWBRound - roundNum;
    if (fromEnd === 0) return "WB Finals";
    if (fromEnd === 1) return "WB Semis";
    if (fromEnd === 2) return "WB Quarters";
    return `WB Round ${roundNum}`;
  }
  const gfRound = roundNum - maxWBRound;
  return gfRound === 1 ? "Grand Finals" : "GF (If Necessary)";
}

// ── Double-Elim section (Winners Bracket or Losers Bracket) ─────────────────
function MobileDoubleElimSection({
  title,
  accentColor,
  borderColor,
  headerBg,
  lineColor,
  normalizedRounds,
  roundNumbers,
  maxWBRound,
  getRoundLabel,
  teams,
  gameNumberMap,
  showChampion,
  colorIndex,
}) {
  const yPositions = useMemo(
    () => computeYPositions(normalizedRounds, roundNumbers),
    [normalizedRounds, roundNumbers],
  );

  const sectionH = useMemo(() => {
    let maxY = 0;
    Object.keys(yPositions).forEach((rn) => {
      const arr = yPositions[rn] || [];
      const m = Math.max(...arr, 0);
      if (m > maxY) maxY = m;
    });
    return Math.max(maxY + CARD_H + 40, 300);
  }, [yPositions]);

  const lastRound = roundNumbers[roundNumbers.length - 1];
  const finalMatchups = normalizedRounds[lastRound] || [];
  const finalMatchup = finalMatchups[finalMatchups.length - 1];
  const finalsYCenter = yPositions[lastRound]?.[finalMatchups.length - 1];
  const championTeam =
    showChampion && finalMatchup?.winner_id
      ? teams.find((t) => t.id === finalMatchup.winner_id)
      : null;

  return (
    <View
      style={{
        marginBottom: 24,
        borderRadius: 14,
        borderWidth: 2,
        borderColor,
        backgroundColor: "#0d1520",
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: accentColor,
          }}
        />
        <Text style={{ color: accentColor, fontWeight: "700", fontSize: 14 }}>
          {title}
        </Text>
      </View>

      {/* Bracket tree */}
      <View style={{ flexDirection: "row", height: sectionH }}>
        {roundNumbers.map((roundNum, ri) => {
          const roundMatchups = normalizedRounds[roundNum] || [];
          const yCenters = yPositions[roundNum] || [];
          const label = getRoundLabel(roundNum, maxWBRound);

          return (
            <Fragment key={roundNum}>
              <RoundColumn
                roundNum={roundNum}
                roundMatchups={roundMatchups}
                yCenters={yCenters}
                teams={teams}
                maxRound={lastRound}
                roundNumbers={roundNumbers}
                numTeams={0}
                accentColor={accentColor}
                standalone={true}
                gameNumberMap={gameNumberMap}
                colorIndex={colorIndex}
                customRoundLabel={label}
              />
              {ri < roundNumbers.length - 1 && (
                <RoundConnectors
                  currentYCenters={yCenters}
                  nextYCenters={yPositions[roundNumbers[ri + 1]] || []}
                  currentCount={roundMatchups.length}
                  nextCount={
                    (normalizedRounds[roundNumbers[ri + 1]] || []).length
                  }
                  numTeams={0}
                  lineColor={lineColor}
                />
              )}
            </Fragment>
          );
        })}

        {/* Champion card — Winners Bracket only */}
        {showChampion && finalMatchup && (
          <>
            <View style={{ width: CONN_W, position: "relative" }}>
              {finalsYCenter != null && (
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: finalsYCenter - LINE_W / 2,
                    width: CONN_W,
                    height: LINE_W,
                    backgroundColor: lineColor,
                  }}
                />
              )}
            </View>
            <View style={{ width: CHAMP_W, position: "relative" }}>
              <View
                style={{
                  height: HEADER_H,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: accentColor,
                  }}
                >
                  🏆 Champion
                </Text>
              </View>
              {finalsYCenter != null && (
                <View
                  style={{
                    position: "absolute",
                    top: finalsYCenter - CARD_H / 2,
                    left: 0,
                    width: CHAMP_W,
                    alignItems: "center",
                  }}
                >
                  {championTeam ? (
                    <View
                      style={{
                        width: CHAMP_W - 10,
                        backgroundColor: "rgba(234,179,8,0.15)",
                        borderWidth: 2,
                        borderColor: accentColor,
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 22, marginBottom: 6 }}>👑</Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "white",
                          textAlign: "center",
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {championTeam.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: accentColor,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Winner
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: CHAMP_W - 10,
                        backgroundColor: "rgba(75,85,99,0.3)",
                        borderWidth: 2,
                        borderColor,
                        borderStyle: "dashed",
                        borderRadius: 12,
                        padding: 16,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        Winner TBD
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ── Single independent bracket (one championship) ───────────────────────────
function SingleBracket({
  champNum,
  normalizedRounds,
  roundNumbers,
  teams,
  label,
  championshipLabels,
  gameNumberMap = new Map(),
  colorIndex = null,
}) {
  const color = getBracketColor(champNum);

  const yPositions = useMemo(
    () => computeYPositions(normalizedRounds, roundNumbers),
    [normalizedRounds, roundNumbers],
  );

  const bracketH = useMemo(() => {
    let maxY = 0;
    Object.keys(yPositions).forEach((rn) => {
      const arr = yPositions[rn] || [];
      const m = Math.max(...arr, 0);
      if (m > maxY) maxY = m;
    });
    return Math.max(maxY + CARD_H + 40, 300);
  }, [yPositions]);

  const numTeams = useMemo(() => {
    const playInCount = (normalizedRounds[0] || []).length;
    const round1Count = (normalizedRounds[1] || []).length;
    return inferNumTeams(playInCount, round1Count);
  }, [normalizedRounds]);

  const lastRound = roundNumbers[roundNumbers.length - 1];
  const finalMatchups = normalizedRounds[lastRound] || [];
  const finalMatchup = finalMatchups[finalMatchups.length - 1];
  const finalIdx = finalMatchups.length - 1;
  const finalsYCenter = yPositions[lastRound]?.[finalIdx];
  const championTeam = finalMatchup?.winner_id
    ? teams.find((t) => t.id === finalMatchup.winner_id)
    : null;

  return (
    <View
      style={{
        marginBottom: 24,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: color.border,
        backgroundColor: "#0d1520",
        overflow: "hidden",
      }}
    >
      {/* Bracket label header strip */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: color.bg,
          borderBottomWidth: 1,
          borderBottomColor: color.border,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: color.champ,
          }}
        />
        <Text style={{ color: color.text, fontWeight: "700", fontSize: 14 }}>
          {label}
        </Text>
      </View>

      {/* Bracket tree */}
      <View style={{ flexDirection: "row", height: bracketH }}>
        {roundNumbers.map((roundNum, ri) => {
          const roundMatchups = normalizedRounds[roundNum] || [];
          const yCenters = yPositions[roundNum] || [];

          return (
            <Fragment key={roundNum}>
              <RoundColumn
                roundNum={roundNum}
                roundMatchups={roundMatchups}
                yCenters={yCenters}
                teams={teams}
                maxRound={lastRound}
                roundNumbers={roundNumbers}
                numTeams={numTeams}
                championshipLabels={championshipLabels}
                accentColor={color.text}
                standalone={true}
                gameNumberMap={gameNumberMap}
                colorIndex={colorIndex}
              />

              {ri < roundNumbers.length - 1 && (
                <RoundConnectors
                  currentYCenters={yCenters}
                  nextYCenters={yPositions[roundNumbers[ri + 1]] || []}
                  currentCount={roundMatchups.length}
                  nextCount={
                    (normalizedRounds[roundNumbers[ri + 1]] || []).length
                  }
                  numTeams={numTeams}
                  lineColor={color.line}
                />
              )}
            </Fragment>
          );
        })}

        {/* Champion card for this bracket */}
        {finalMatchup && (
          <>
            {/* Connector line */}
            <View style={{ width: CONN_W, position: "relative" }}>
              {finalsYCenter != null && (
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: finalsYCenter - LINE_W / 2,
                    width: CONN_W,
                    height: LINE_W,
                    backgroundColor: color.line,
                  }}
                />
              )}
            </View>

            {/* Champion display */}
            <View style={{ width: CHAMP_W, position: "relative" }}>
              <View
                style={{
                  height: HEADER_H,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: color.text }}
                >
                  🏆 Champion
                </Text>
              </View>

              {finalsYCenter != null && (
                <View
                  style={{
                    position: "absolute",
                    top: finalsYCenter - CARD_H / 2,
                    left: 0,
                    width: CHAMP_W,
                    alignItems: "center",
                  }}
                >
                  {championTeam ? (
                    <View
                      style={{
                        width: CHAMP_W - 10,
                        backgroundColor: color.champBg,
                        borderWidth: 2,
                        borderColor: color.champ,
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 22, marginBottom: 6 }}>👑</Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "white",
                          textAlign: "center",
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {championTeam.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: color.text,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Winner
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: CHAMP_W - 10,
                        backgroundColor: "rgba(75,85,99,0.3)",
                        borderWidth: 2,
                        borderColor: color.border,
                        borderStyle: "dashed",
                        borderRadius: 12,
                        padding: 16,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        Winner TBD
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function BracketPage() {
  const { id: tournamentId, division, grade } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();

  // Zoom / pan shared values
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

  const { data: divisionsData } = useQuery({
    queryKey: ["divisions", tournamentId],
    queryFn: () => apiCall(`/api/divisions?tournament_id=${tournamentId}`),
    enabled: !!tournamentId && !!division && !!grade,
  });

  const { refreshing, spin, handleRefresh } = useBracketRefresh(
    refetchMatchups,
    refetchTeams,
  );

  const tournament = tournamentData?.tournament;
  const allMatchups = matchupsData?.matchups || [];
  const teams = teamsData?.teams || [];

  // Build game-number map unconditionally (hook must not be called conditionally)
  const gameNumberMap = useMemo(() => {
    const sorted = [...allMatchups]
      .filter((m) => m.game_id != null)
      .sort((a, b) => a.game_id - b.game_id);
    const map = new Map();
    sorted.forEach((m, i) => map.set(m.game_id, i + 1));
    return map;
  }, [allMatchups]);

  const divisionRecord = (divisionsData?.divisions || []).find(
    (d) => d.division_type === division && String(d.grade) === String(grade),
  );
  const championshipLabels = {
    c1: divisionRecord?.championship_label_1 || "Championship 1",
    c2: divisionRecord?.championship_label_2 || "Championship 2",
  };

  // Detect multi-bracket and double-elim modes
  const isSplitBracket = allMatchups.some(
    (m) => m.championship_bracket_num != null,
  );
  const isDoubleElim = allMatchups.some(
    (m) => m.championship_bracket_num === 3,
  );

  // ── MULTI-BRACKET: group + normalize positions per championship ─────────
  const bracketGroups = useMemo(() => {
    if (!isSplitBracket) return null;

    const groups = {};
    allMatchups.forEach((m) => {
      const num = m.championship_bracket_num;
      if (num == null) return;
      if (!groups[num]) groups[num] = [];
      groups[num].push(m);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([champNumStr, matchups]) => {
        const champNum = parseInt(champNumStr);

        const roundMap = {};
        matchups.forEach((m) => {
          if (!roundMap[m.round]) roundMap[m.round] = [];
          roundMap[m.round].push(m);
        });

        // Normalize positions to 0-based within this bracket
        const normalizedRounds = {};
        Object.entries(roundMap).forEach(([round, ms]) => {
          const sorted = [...ms].sort((a, b) => a.position - b.position);
          const minPos = sorted[0].position;
          normalizedRounds[round] = sorted.map((m) => ({
            ...m,
            position: m.position - minPos,
          }));
        });

        const roundNumbers = Object.keys(normalizedRounds)
          .map(Number)
          .sort((a, b) => a - b);

        const label =
          champNum === 1
            ? championshipLabels.c1
            : champNum === 2
              ? championshipLabels.c2
              : `Championship ${champNum}`;

        return { champNum, normalizedRounds, roundNumbers, label };
      });
  }, [isSplitBracket, allMatchups, championshipLabels]);

  // ── DOUBLE ELIM: merge WB(1)+GF(3) → Winners, keep LB(2) → Losers ──────
  const doubleElimGroups = useMemo(() => {
    if (!isSplitBracket || !isDoubleElim || !bracketGroups) return null;

    const wbGroup = bracketGroups.find((g) => g.champNum === 1);
    const lbGroup = bracketGroups.find((g) => g.champNum === 2);
    const gfGroup = bracketGroups.find((g) => g.champNum === 3);

    if (!wbGroup) return null;

    const maxWBRound =
      wbGroup.roundNumbers[wbGroup.roundNumbers.length - 1] || 0;

    // Offset GF rounds so they appear as extra columns after WB Finals
    const mergedRounds = { ...wbGroup.normalizedRounds };
    if (gfGroup) {
      Object.entries(gfGroup.normalizedRounds).forEach(([round, matchups]) => {
        const offsetRound = parseInt(round) + maxWBRound;
        mergedRounds[offsetRound] = matchups;
      });
    }
    const mergedRoundNumbers = Object.keys(mergedRounds)
      .map(Number)
      .sort((a, b) => a - b);

    return {
      winners: {
        normalizedRounds: mergedRounds,
        roundNumbers: mergedRoundNumbers,
        maxWBRound,
      },
      losers: lbGroup || null,
    };
  }, [isSplitBracket, isDoubleElim, bracketGroups]);

  // ── SINGLE BRACKET: standard layout ────────────────────────────────────
  const singleRounds = useMemo(() => {
    if (isSplitBracket) return {};
    const r = {};
    allMatchups.forEach((m) => {
      if (!r[m.round]) r[m.round] = [];
      r[m.round].push(m);
    });
    Object.keys(r).forEach((rn) => {
      r[rn].sort((a, b) => a.position - b.position);
    });
    return r;
  }, [isSplitBracket, allMatchups]);

  const singleRoundNumbers = useMemo(
    () =>
      Object.keys(singleRounds)
        .map(Number)
        .sort((a, b) => a - b),
    [singleRounds],
  );

  const singleYPositions = useMemo(
    () =>
      !isSplitBracket
        ? computeYPositions(singleRounds, singleRoundNumbers)
        : {},
    [isSplitBracket, singleRounds, singleRoundNumbers],
  );

  const singleNumTeams = useMemo(() => {
    if (isSplitBracket) return 0;
    const playInCount = allMatchups.filter((m) => m.round === 0).length;
    const round1Count = allMatchups.filter((m) => m.round === 1).length;
    return inferNumTeams(playInCount, round1Count) || teams.length;
  }, [isSplitBracket, allMatchups, teams]);

  const singleBracketH = useMemo(() => {
    if (isSplitBracket) return 0;
    let maxY = 0;
    Object.keys(singleYPositions).forEach((rn) => {
      const arr = singleYPositions[rn] || [];
      const m = Math.max(...arr, 0);
      if (m > maxY) maxY = m;
    });
    return Math.max(maxY + CARD_H + 40, 300);
  }, [isSplitBracket, singleYPositions]);

  const finalRound = singleRoundNumbers[singleRoundNumbers.length - 1];
  const finalsMatchup = !isSplitBracket ? singleRounds[finalRound]?.[0] : null;
  const championTeam = finalsMatchup?.winner_id
    ? teams.find((t) => t.id === finalsMatchup.winner_id)
    : null;
  const finalsYCenter = !isSplitBracket
    ? singleYPositions[finalRound]?.[0]
    : null;

  // Zoom handlers
  const handleZoomIn = () => {
    const next = Math.min(4, scale.value * 1.3);
    scale.value = withSpring(next, { damping: 20, stiffness: 90 });
    savedScale.value = next;
  };
  const handleZoomOut = () => {
    const next = Math.max(0.375, scale.value / 1.3);
    scale.value = withSpring(next, { damping: 20, stiffness: 90 });
    savedScale.value = next;
    if (next <= 1) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd((e) => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      if (Math.abs(e.velocityX) > 100 || Math.abs(e.velocityY) > 100) {
        translateX.value = withSpring(translateX.value + e.velocityX * 0.2, {
          damping: 20,
          stiffness: 90,
          mass: 0.8,
        });
        translateY.value = withSpring(translateY.value + e.velocityY * 0.2, {
          damping: 20,
          stiffness: 90,
          mass: 0.8,
        });
        savedTranslateX.value = translateX.value + e.velocityX * 0.2;
        savedTranslateY.value = translateY.value + e.velocityY * 0.2;
      }
    });

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

  const composedGesture = Gesture.Simultaneous(panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (tournamentLoading || matchupsLoading) return <LoadingState />;

  const gradeLabel = getGradeLabel(grade);

  if (allMatchups.length === 0) {
    return (
      <EmptyBracketState
        division={division}
        gradeLabel={gradeLabel}
        tournamentName={tournament?.name}
      />
    );
  }

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
              {/* ── DOUBLE ELIM: Winners Bracket (WB+GF) + Losers Bracket ── */}
              {isSplitBracket && isDoubleElim && doubleElimGroups && (
                <View style={{ flexDirection: "column", gap: 0 }}>
                  <MobileDoubleElimSection
                    title="Winners Bracket"
                    accentColor="#c084fc"
                    borderColor="rgba(147,51,234,0.6)"
                    headerBg="rgba(147,51,234,0.08)"
                    lineColor="rgba(168,85,247,0.5)"
                    normalizedRounds={doubleElimGroups.winners.normalizedRounds}
                    roundNumbers={doubleElimGroups.winners.roundNumbers}
                    maxWBRound={doubleElimGroups.winners.maxWBRound}
                    getRoundLabel={getWinnersRoundLabel}
                    teams={teams}
                    gameNumberMap={gameNumberMap}
                    showChampion={true}
                    colorIndex={0}
                  />
                  {doubleElimGroups.losers && (
                    <MobileDoubleElimSection
                      title="Losers Bracket"
                      accentColor="#60a5fa"
                      borderColor="rgba(59,130,246,0.6)"
                      headerBg="rgba(37,99,235,0.08)"
                      lineColor="rgba(59,130,246,0.5)"
                      normalizedRounds={
                        doubleElimGroups.losers.normalizedRounds
                      }
                      roundNumbers={doubleElimGroups.losers.roundNumbers}
                      maxWBRound={0}
                      getRoundLabel={(rn) => `LB Round ${rn}`}
                      teams={teams}
                      gameNumberMap={gameNumberMap}
                      showChampion={false}
                      colorIndex={1}
                    />
                  )}
                </View>
              )}

              {/* ── REGULAR MULTI-BRACKET: each championship is its own bracket ── */}
              {isSplitBracket && !isDoubleElim && bracketGroups && (
                <View style={{ flexDirection: "column", gap: 0 }}>
                  {bracketGroups.map(
                    ({
                      champNum,
                      normalizedRounds,
                      roundNumbers: rns,
                      label,
                    }) => (
                      <SingleBracket
                        key={champNum}
                        champNum={champNum}
                        normalizedRounds={normalizedRounds}
                        roundNumbers={rns}
                        teams={teams}
                        label={label}
                        championshipLabels={championshipLabels}
                        gameNumberMap={new Map()}
                        colorIndex={null}
                      />
                    ),
                  )}
                </View>
              )}

              {/* ── SINGLE BRACKET: standard layout ── */}
              {!isSplitBracket && (
                <View style={{ flexDirection: "row", height: singleBracketH }}>
                  {singleRoundNumbers.map((roundNum, ri) => {
                    const roundMatchups = singleRounds[roundNum];
                    const yCenters = singleYPositions[roundNum] || [];
                    return (
                      <Fragment key={roundNum}>
                        <RoundColumn
                          roundNum={roundNum}
                          roundMatchups={roundMatchups}
                          yCenters={yCenters}
                          teams={teams}
                          maxRound={finalRound}
                          roundNumbers={singleRoundNumbers}
                          numTeams={singleNumTeams}
                          championshipLabels={championshipLabels}
                          gameNumberMap={new Map()}
                        />
                        {ri < singleRoundNumbers.length - 1 && (
                          <RoundConnectors
                            currentYCenters={yCenters}
                            nextYCenters={
                              singleYPositions[singleRoundNumbers[ri + 1]] || []
                            }
                            currentCount={roundMatchups.length}
                            nextCount={
                              singleRounds[singleRoundNumbers[ri + 1]]
                                ?.length || 0
                            }
                            numTeams={singleNumTeams}
                          />
                        )}
                      </Fragment>
                    );
                  })}

                  {/* Single champion card */}
                  {finalsMatchup && (
                    <>
                      <View style={{ width: CONN_W, position: "relative" }}>
                        {finalsYCenter != null && (
                          <View
                            style={{
                              position: "absolute",
                              left: 0,
                              top: finalsYCenter - 1,
                              width: CONN_W,
                              height: 2,
                              backgroundColor: "rgba(168,85,247,0.5)",
                            }}
                          />
                        )}
                      </View>
                      <View style={{ width: CHAMP_W, position: "relative" }}>
                        <View
                          style={{
                            height: HEADER_H,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: "#facc15",
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}
                          >
                            🏆 Champion
                          </Text>
                        </View>
                        {finalsYCenter != null && (
                          <View
                            style={{
                              position: "absolute",
                              top: finalsYCenter - CARD_H / 2,
                              left: 0,
                              width: CHAMP_W,
                              alignItems: "center",
                            }}
                          >
                            {championTeam ? (
                              <View
                                style={{
                                  width: CHAMP_W - 10,
                                  backgroundColor: "rgba(234,179,8,0.15)",
                                  borderWidth: 2,
                                  borderColor: "#eab308",
                                  borderRadius: 12,
                                  padding: 12,
                                  alignItems: "center",
                                }}
                              >
                                <Text style={{ fontSize: 22, marginBottom: 6 }}>
                                  👑
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    color: "white",
                                    textAlign: "center",
                                    marginBottom: 4,
                                  }}
                                  numberOfLines={2}
                                >
                                  {championTeam.name}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: "700",
                                    color: "#facc15",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  Winner
                                </Text>
                              </View>
                            ) : (
                              <View
                                style={{
                                  width: CHAMP_W - 10,
                                  backgroundColor: "rgba(75,85,99,0.3)",
                                  borderWidth: 2,
                                  borderColor: "#4b5563",
                                  borderStyle: "dashed",
                                  borderRadius: 12,
                                  padding: 16,
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 13,
                                    color: "#6b7280",
                                    fontStyle: "italic",
                                  }}
                                >
                                  Winner TBD
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}
            </Animated.View>
          </GestureDetector>
        </ScrollView>
      </ScrollView>

      {/* Zoom controls */}
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
