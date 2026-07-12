import { useMemo } from "react";
import { computeYPositions } from "@/utils/bracketLayoutUtils";

export function useBracketData(allMatchups) {
  return useMemo(() => {
    const rds = {};
    allMatchups.forEach((m) => {
      if (!rds[m.round]) rds[m.round] = [];
      rds[m.round].push(m);
    });

    const rNums = Object.keys(rds)
      .map(Number)
      .sort((a, b) => a - b);

    // Sort each round by position
    rNums.forEach((rn) => {
      rds[rn].sort((a, b) => a.position - b.position);
    });

    const yPos = computeYPositions(rds, rNums);

    // Total height from all positions
    let maxY = 0;
    rNums.forEach((rn) => {
      const arr = yPos[rn] || [];
      arr.forEach((y) => {
        const bottom = y + 140 / 2; // CARD_H / 2
        if (bottom > maxY) maxY = bottom;
      });
    });

    return {
      rounds: rds,
      roundNumbers: rNums,
      yPositions: yPos,
      totalBracketH: maxY + 40,
      maxRound: rNums.length > 0 ? Math.max(...rNums) : 0,
    };
  }, [allMatchups]);
}
