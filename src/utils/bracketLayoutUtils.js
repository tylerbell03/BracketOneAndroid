// Bracket layout constants
export const CARD_H = 140;
export const CARD_W = 230;
export const CONN_W = 44;
export const BASE_SPACING = CARD_H + 32;
export const HEADER_H = 60;
export const LINE_CLR = "rgba(168, 85, 247, 0.5)";
export const LINE_W = 2;
export const CHAMP_W = 200;

/**
 * Compute the Y-center for every matchup based on the actual bracket
 * structure. Handles standard halving brackets AND play-in rounds where
 * adjacent rounds have the same (or more) game count.
 *
 * Special handling for 7-team brackets (3 → 2 → 1 games).
 */
export function computeYPositions(rounds, roundNumbers) {
  if (roundNumbers.length === 0) return {};

  const result = {};

  // Find the densest round (most games) — this anchors the layout
  // Special case: 13-team bracket has structure 5 → 4 → 2 → 1
  // Special case: 14-team bracket has structure 6 → 4 → 2 → 1
  // Special case: 15-team bracket has structure 7 → 4 → 2 → 1
  // We want to anchor on round 1 (QF with 4 games), not round 0 (play-ins)
  let densestRi = 0;
  let densestCount = 0;
  let is13TeamQF = false;
  let is14TeamQF = false;
  let is15TeamQF = false;

  if (
    roundNumbers.length === 4 &&
    rounds[roundNumbers[0]]?.length === 5 &&
    rounds[roundNumbers[1]]?.length === 4 &&
    rounds[roundNumbers[2]]?.length === 2 &&
    rounds[roundNumbers[3]]?.length === 1
  ) {
    // 13-team bracket detected - anchor on quarterfinals
    densestRi = 1;
    densestCount = 4;
    is13TeamQF = true;
  } else if (
    roundNumbers.length === 4 &&
    rounds[roundNumbers[0]]?.length === 6 &&
    rounds[roundNumbers[1]]?.length === 4 &&
    rounds[roundNumbers[2]]?.length === 2 &&
    rounds[roundNumbers[3]]?.length === 1
  ) {
    // 14-team bracket detected - anchor on quarterfinals
    densestRi = 1;
    densestCount = 4;
    is14TeamQF = true;
  } else if (
    roundNumbers.length === 4 &&
    rounds[roundNumbers[0]]?.length === 7 &&
    rounds[roundNumbers[1]]?.length === 4 &&
    rounds[roundNumbers[2]]?.length === 2 &&
    rounds[roundNumbers[3]]?.length === 1
  ) {
    // 15-team bracket detected - anchor on quarterfinals
    densestRi = 1;
    densestCount = 4;
    is15TeamQF = true;
  } else {
    // Normal detection: find round with most games
    roundNumbers.forEach((rn, ri) => {
      if (rounds[rn].length > densestCount) {
        densestCount = rounds[rn].length;
        densestRi = ri;
      }
    });
  }

  // Position densest round evenly
  const densestRn = roundNumbers[densestRi];
  result[densestRn] = [];

  if (is13TeamQF) {
    // QF 0 at top
    result[densestRn].push(HEADER_H + 0 * BASE_SPACING + CARD_H / 2);
    // QF 1 moved down to position 2 to give more room for play-ins
    result[densestRn].push(HEADER_H + 2 * BASE_SPACING + CARD_H / 2);
    // Add gap for bye (skip position 3)
    // QF 2, 3 positioned lower
    result[densestRn].push(HEADER_H + 4 * BASE_SPACING + CARD_H / 2);
    result[densestRn].push(HEADER_H + 5 * BASE_SPACING + CARD_H / 2);
  } else if (is14TeamQF) {
    // 14-team bracket: 6 play-ins → 4 quarterfinals
    // QF 0: gets play-in 0
    // QF 1: gets play-ins 1 & 2 (needs extra space)
    // QF 2: gets play-in 3
    // QF 3: gets play-ins 4 & 5 (needs extra space)

    result[densestRn].push(HEADER_H + 0 * BASE_SPACING + CARD_H / 2); // QF 0
    result[densestRn].push(HEADER_H + 2 * BASE_SPACING + CARD_H / 2); // QF 1 (extra space for 2 play-ins)
    result[densestRn].push(HEADER_H + 4 * BASE_SPACING + CARD_H / 2); // QF 2
    result[densestRn].push(HEADER_H + 6 * BASE_SPACING + CARD_H / 2); // QF 3 (extra space for 2 play-ins)
  } else if (is15TeamQF) {
    // 15-team bracket: 7 play-ins → 4 quarterfinals
    // QF 0: bye + play-in 0
    // QF 1: play-ins 1 & 2 (needs extra space)
    // QF 2: play-ins 3 & 4 (needs extra space)
    // QF 3: play-ins 5 & 6 (needs extra space)

    result[densestRn].push(HEADER_H + 0 * BASE_SPACING + CARD_H / 2); // QF 0
    result[densestRn].push(HEADER_H + 2 * BASE_SPACING + CARD_H / 2); // QF 1 (extra space for 2 play-ins)
    result[densestRn].push(HEADER_H + 4 * BASE_SPACING + CARD_H / 2); // QF 2 (extra space for 2 play-ins)
    result[densestRn].push(HEADER_H + 6 * BASE_SPACING + CARD_H / 2); // QF 3 (extra space for 2 play-ins)
  } else {
    // Normal even spacing for all other brackets
    for (let i = 0; i < densestCount; i++) {
      result[densestRn].push(HEADER_H + i * BASE_SPACING + CARD_H / 2);
    }
  }

  // Forward pass — position rounds after the densest
  for (let ri = densestRi + 1; ri < roundNumbers.length; ri++) {
    const rn = roundNumbers[ri];
    const prevRn = roundNumbers[ri - 1];
    const prevY = result[prevRn];
    const count = rounds[rn].length;
    const prevCount = rounds[prevRn].length;
    result[rn] = [];

    // Special case: 7-team bracket transition (3 → 2 games)
    if (prevCount === 3 && count === 2) {
      // Position 0: align with Round 1 position 0 (#1 seed gets bye to here)
      result[rn].push(prevY[0]);
      // Position 1: center between Round 1 positions 1 and 2
      result[rn].push((prevY[1] + prevY[2]) / 2);
    } else if (prevCount === count) {
      // 1:1 — same Y
      for (let i = 0; i < count; i++) {
        result[rn].push(prevY[i] ?? HEADER_H + i * BASE_SPACING + CARD_H / 2);
      }
    } else if (prevCount >= count * 2) {
      // Standard halving — center between the two feeders
      for (let i = 0; i < count; i++) {
        const y1 = prevY[i * 2] ?? 0;
        const y2 = prevY[i * 2 + 1] ?? y1;
        result[rn].push((y1 + y2) / 2);
      }
    } else {
      // Fallback
      for (let i = 0; i < count; i++) {
        result[rn].push(HEADER_H + i * BASE_SPACING + CARD_H / 2);
      }
    }
  }

  // Backward pass — position rounds before the densest (play-in rounds)
  for (let ri = densestRi - 1; ri >= 0; ri--) {
    const rn = roundNumbers[ri];
    const nextRn = roundNumbers[ri + 1];
    const nextY = result[nextRn];
    const count = rounds[rn].length;
    const nextCount = rounds[nextRn].length;
    result[rn] = [];

    // Special case: 18-team bracket (2 play-in games → 8 Round 1 games)
    if (count === 2 && nextCount === 8) {
      result[rn].push(nextY[0]); // Play-in 0 → Round 1 position 0
      result[rn].push(nextY[4]); // Play-in 1 → Round 1 position 4
    } else if (count === 1 && nextCount === 8) {
      // Special case: 17-team bracket (1 play-in → 8 Round 1 games)
      result[rn].push(nextY[0]); // Play-in 0 → Round 1 position 0
    } else if (count === 3 && nextCount === 8) {
      // Special case: 19-team bracket (3 play-ins → 8 Round 1 games)
      result[rn].push(nextY[4]); // Play-in 0 → Round 1 position 4
      result[rn].push(nextY[6]); // Play-in 1 → Round 1 position 6
      result[rn].push(nextY[0]); // Play-in 2 → Round 1 position 0
    } else if (count === 4 && nextCount === 8) {
      // Special case: 20-team bracket (4 play-ins → 8 Round 1 games)
      result[rn].push(nextY[7]); // Play-in 0 → Round 1 position 7
      result[rn].push(nextY[4]); // Play-in 1 → Round 1 position 4
      result[rn].push(nextY[0]); // Play-in 2 → Round 1 position 0
      result[rn].push(nextY[5]); // Play-in 3 → Round 1 position 5
    } else if (count === 6 && nextCount === 4) {
      // Special case: 14-team bracket (6 play-ins → 4 quarterfinal games)
      const qf0Y = nextY[0];
      const qf1Y = nextY[1];
      const qf2Y = nextY[2];
      const qf3Y = nextY[3];
      const offset = BASE_SPACING * 0.6;

      result[rn].push(qf0Y); // play-in 0 → QF 0
      result[rn].push(qf1Y - offset); // play-in 1 (above QF 1)
      result[rn].push(qf1Y + offset); // play-in 2 (below QF 1)
      result[rn].push(qf2Y); // play-in 3 → QF 2
      result[rn].push(qf3Y - offset); // play-in 4 (above QF 3)
      result[rn].push(qf3Y + offset); // play-in 5 (below QF 3)

      console.log("🏀 14-TEAM PLAY-IN POSITIONS:", {
        playIn0: result[rn][0],
        playIn1: result[rn][1],
        playIn2: result[rn][2],
        playIn3: result[rn][3],
        playIn4: result[rn][4],
        playIn5: result[rn][5],
        qf0: qf0Y,
        qf1: qf1Y,
        qf2: qf2Y,
        qf3: qf3Y,
      });
    } else if (count === 7 && nextCount === 4) {
      // Special case: 15-team bracket (7 play-ins → 4 quarterfinal games)
      const qf0Y = nextY[0];
      const qf1Y = nextY[1];
      const qf2Y = nextY[2];
      const qf3Y = nextY[3];
      const offset = BASE_SPACING * 0.6;

      result[rn].push(qf0Y); // play-in 0 → QF 0
      result[rn].push(qf1Y - offset); // play-in 1 (above QF 1)
      result[rn].push(qf1Y + offset); // play-in 2 (below QF 1)
      result[rn].push(qf2Y - offset); // play-in 3 (above QF 2)
      result[rn].push(qf2Y + offset); // play-in 4 (below QF 2)
      result[rn].push(qf3Y - offset); // play-in 5 (above QF 3)
      result[rn].push(qf3Y + offset); // play-in 6 (below QF 3)

      console.log("🏀 15-TEAM PLAY-IN POSITIONS:", {
        playIn0: result[rn][0],
        playIn1: result[rn][1],
        playIn2: result[rn][2],
        playIn3: result[rn][3],
        playIn4: result[rn][4],
        playIn5: result[rn][5],
        playIn6: result[rn][6],
        qf0: qf0Y,
        qf1: qf1Y,
        qf2: qf2Y,
        qf3: qf3Y,
      });
    } else if (count === 5 && nextCount === 4) {
      // Special case: 13-team bracket (5 play-ins → 4 quarterfinal games)
      const qf1Y = nextY[1];
      const offset = BASE_SPACING * 0.6;

      result[rn].push(nextY[0]); // play-in 0 → QF 0
      result[rn].push(qf1Y - offset); // play-in 1 (above QF 1)
      result[rn].push(qf1Y + offset); // play-in 2 (below QF 1)
      result[rn].push(nextY[2]); // play-in 3 → QF 2
      result[rn].push(nextY[3]); // play-in 4 → QF 3

      console.log("🏀 13-TEAM PLAY-IN POSITIONS:", {
        playIn0: result[rn][0],
        playIn1: result[rn][1],
        playIn2: result[rn][2],
        playIn3: result[rn][3],
        playIn4: result[rn][4],
        qf0: nextY[0],
        qf1Center: qf1Y,
        qf2: nextY[2],
        qf3: nextY[3],
      });
    } else if (count === 3 && nextCount === 4) {
      // Special case: 11-team bracket (3 play-ins → 4 quarterfinal games)
      result[rn].push(nextY[0]); // Play-in 0 → Quarterfinal 0
      result[rn].push(nextY[2]); // Play-in 1 → Quarterfinal 2 (skip quarterfinal 1 - it gets a bye)
      result[rn].push(nextY[3]); // Play-in 2 → Quarterfinal 3
    } else if (count === 2 && nextCount === 4) {
      // Special case: 10-team bracket (2 play-ins feeding into 4 quarterfinal games)
      result[rn].push(nextY[1]); // Play-in position 0 aligns with Quarterfinal position 1
      result[rn].push(nextY[2]); // Play-in position 1 aligns with Quarterfinal position 2
    } else if (count === nextCount) {
      // 1:1 mapping — align with the game each feeds
      for (let i = 0; i < count; i++) {
        result[rn].push(nextY[i] ?? HEADER_H + i * BASE_SPACING + CARD_H / 2);
      }
    } else if (count > nextCount) {
      // Current round feeds into fewer games next round
      for (let i = 0; i < count; i++) {
        const nextIdx = Math.floor(i / 2);
        const nextCenter = nextY[nextIdx] ?? 0;
        const isTop = i % 2 === 0;
        const offset = BASE_SPACING * 0.6;
        result[rn].push(isTop ? nextCenter - offset : nextCenter + offset);
      }
    } else {
      // Fewer games feeding into more — use position field for alignment
      for (let i = 0; i < count; i++) {
        const currentPos = rounds[rn][i].position;
        const targetIdx = Math.min(currentPos, nextCount - 1);
        result[rn].push(
          nextY[targetIdx] ?? HEADER_H + i * BASE_SPACING + CARD_H / 2,
        );
      }
    }
  }

  return result;
}

export function formatGameDateTime(matchup) {
  try {
    const timeStr = matchup?.game_time || matchup?.scheduled_time;
    if (!timeStr) return null;

    // Parse the ISO string directly WITHOUT timezone conversion
    // Format: "2024-01-15T14:30:00" or "2024-01-15T14:30:00.000Z"
    const parts = timeStr.split("T");
    if (parts.length < 2) return null;

    const dateStr = parts[0]; // "2024-01-15"
    const timePart = parts[1];
    const timePartStr = timePart?.split(".")[0] || timePart; // "14:30:00"

    if (!dateStr || !timePartStr) return null;

    const dateParts = dateStr.split("-");
    const timeParts = timePartStr.split(":");

    if (dateParts.length < 3 || timeParts.length < 2) return null;

    const [year, month, date] = dateParts;
    const [hour, minute] = timeParts;

    // Validate parsed values
    if (!year || !month || !date || !hour || !minute) return null;

    // Convert to 12-hour format
    const hourNum = parseInt(hour);
    if (isNaN(hourNum)) return null;

    const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    const ampm = hourNum >= 12 ? "PM" : "AM";

    // Get day of week manually without timezone conversion
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dateNum = parseInt(date);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dateNum)) return null;

    const d = new Date(yearNum, monthNum - 1, dateNum);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayIndex = d.getDay();

    if (dayIndex < 0 || dayIndex > 6) return null;

    const day = days[dayIndex];

    const minStr = minute.length < 2 ? `0${minute}` : minute;
    return `${day} ${monthNum}/${dateNum} ${hour12}:${minStr} ${ampm}`;
  } catch (error) {
    // Silently handle any parsing errors during zoom/pan operations
    console.warn("Error formatting game date/time:", error);
    return null;
  }
}

export function getRoundName(
  round,
  maxRound,
  roundNumbers,
  numTeams = null,
  matchups = null,
) {
  // Check if this is a split bracket round by looking at matchups
  if (matchups && matchups.length > 0) {
    const hasChampionshipNum = matchups.some(
      (m) => m.championship_bracket_num != null,
    );
    if (hasChampionshipNum) {
      return "Championships";
    }
  }

  // Define specific round names for each bracket size
  const bracketLabels = {
    2: { 1: "Finals" },
    3: { 1: "Semifinals", 2: "Finals" },
    4: { 1: "Semifinals", 2: "Finals" },
    5: { 1: "Semifinals", 2: "Finals" },
    6: { 0: "Quarterfinals", 1: "Semifinals", 2: "Finals" },
    7: { 0: "Quarterfinals", 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    8: { 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    9: { 0: "Play-In", 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    10: { 0: "Play-In", 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    11: { 0: "Play-In", 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    12: { 0: "Play-In", 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    13: { 0: "Play-In", 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    14: { 0: "Play-In", 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    15: { 0: "Round 1", 1: "Quarterfinals", 2: "Semifinals", 3: "Finals" },
    16: { 1: "Round 1", 2: "Quarterfinals", 3: "Semifinals", 4: "Finals" },
    17: {
      0: "Play-In",
      1: "Round 1",
      2: "Quarterfinals",
      3: "Semifinals",
      4: "Finals",
    },
    18: {
      0: "Play-In",
      1: "Round 1",
      2: "Quarterfinals",
      3: "Semifinals",
      4: "Finals",
    },
    19: {
      0: "Play-In",
      1: "Round 1",
      2: "Quarterfinals",
      3: "Semifinals",
      4: "Finals",
    },
    20: {
      0: "Play-In",
      1: "Round 1",
      2: "Quarterfinals",
      3: "Semifinals",
      4: "Finals",
    },
  };

  // If we have a specific mapping for this team count and round, use it
  if (numTeams && bracketLabels[numTeams] && bracketLabels[numTeams][round]) {
    return bracketLabels[numTeams][round];
  }

  // Fallback: Finals for last round, Round 1 otherwise
  if (round === maxRound) return "Finals";
  return "Round 1";
}

// New helper function to get the specific championship label for a matchup
export function getChampionshipLabel(matchup) {
  if (matchup.championship_bracket_num === 1) {
    return "Championship 1";
  } else if (matchup.championship_bracket_num === 2) {
    return "Championship 2";
  }
  return null;
}
