import { View } from "react-native";
import { CONN_W, LINE_CLR, LINE_W } from "@/utils/bracketLayoutUtils";

/**
 * Draw connector lines between two adjacent rounds using
 * pre-computed Y-center positions for accurate connections.
 * Mirrors the web version exactly.
 */
export function RoundConnectors({
  currentYCenters,
  nextYCenters,
  currentCount,
  nextCount,
  numTeams,
}) {
  // Defensive checks to prevent crashes during zoom
  if (!currentYCenters || !Array.isArray(currentYCenters)) {
    return <View style={{ width: CONN_W, position: "relative" }} />;
  }
  if (!nextYCenters || !Array.isArray(nextYCenters)) {
    return <View style={{ width: CONN_W, position: "relative" }} />;
  }

  const lines = [];

  // Special case: 13-team bracket (5 play-ins → 4 quarterfinals)
  if (numTeams === 13 && currentCount === 5 && nextCount === 4) {
    // Play-in 0 → Quarterfinal 0 (straight line)
    const p0Y = currentYCenters[0];
    const q0Y = nextYCenters[0];
    if (p0Y != null && q0Y != null) {
      lines.push(
        <View
          key="p0"
          style={{
            position: "absolute",
            left: 0,
            top: p0Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-ins 1 & 2 pair into Quarterfinal 1
    const p1Y = currentYCenters[1];
    const p2Y = currentYCenters[2];
    const q1Y = nextYCenters[1];
    if (p1Y != null && p2Y != null && q1Y != null) {
      // Horizontal from play-in 1
      lines.push(
        <View
          key="ht1"
          style={{
            position: "absolute",
            left: 0,
            top: p1Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from play-in 2
      lines.push(
        <View
          key="hb1"
          style={{
            position: "absolute",
            left: 0,
            top: p2Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Vertical bar
      lines.push(
        <View
          key="v1"
          style={{
            position: "absolute",
            left: CONN_W / 2 - LINE_W / 2,
            top: p1Y,
            width: LINE_W,
            height: p2Y - p1Y,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal to quarterfinal 1
      lines.push(
        <View
          key="hm1"
          style={{
            position: "absolute",
            left: CONN_W / 2,
            top: q1Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-in 3 → Quarterfinal 2 (straight line)
    const p3Y = currentYCenters[3];
    const q2Y = nextYCenters[2];
    if (p3Y != null && q2Y != null) {
      lines.push(
        <View
          key="p3"
          style={{
            position: "absolute",
            left: 0,
            top: p3Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-in 4 → Quarterfinal 3 (straight line)
    const p4Y = currentYCenters[4];
    const q3Y = nextYCenters[3];
    if (p4Y != null && q3Y != null) {
      lines.push(
        <View
          key="p4"
          style={{
            position: "absolute",
            left: 0,
            top: p4Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }
  } else if (numTeams === 14 && currentCount === 6 && nextCount === 4) {
    // Special case: 14-team bracket (6 play-ins → 4 quarterfinals)

    // Play-in 0 → Quarterfinal 0 (straight line)
    const p0Y = currentYCenters[0];
    const q0Y = nextYCenters[0];
    if (p0Y != null && q0Y != null) {
      lines.push(
        <View
          key="p0"
          style={{
            position: "absolute",
            left: 0,
            top: p0Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-ins 1 & 2 pair into Quarterfinal 1
    const p1Y = currentYCenters[1];
    const p2Y = currentYCenters[2];
    const q1Y = nextYCenters[1];
    if (p1Y != null && p2Y != null && q1Y != null) {
      // Horizontal from play-in 1
      lines.push(
        <View
          key="ht1"
          style={{
            position: "absolute",
            left: 0,
            top: p1Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from play-in 2
      lines.push(
        <View
          key="hb1"
          style={{
            position: "absolute",
            left: 0,
            top: p2Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Vertical bar
      lines.push(
        <View
          key="v1"
          style={{
            position: "absolute",
            left: CONN_W / 2 - LINE_W / 2,
            top: p1Y,
            width: LINE_W,
            height: p2Y - p1Y,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal to quarterfinal 1
      lines.push(
        <View
          key="hm1"
          style={{
            position: "absolute",
            left: CONN_W / 2,
            top: q1Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-in 3 → Quarterfinal 2 (straight line)
    const p3Y = currentYCenters[3];
    const q2Y = nextYCenters[2];
    if (p3Y != null && q2Y != null) {
      lines.push(
        <View
          key="p3"
          style={{
            position: "absolute",
            left: 0,
            top: p3Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-ins 4 & 5 pair into Quarterfinal 3
    const p4Y = currentYCenters[4];
    const p5Y = currentYCenters[5];
    const q3Y = nextYCenters[3];
    if (p4Y != null && p5Y != null && q3Y != null) {
      // Horizontal from play-in 4
      lines.push(
        <View
          key="ht3"
          style={{
            position: "absolute",
            left: 0,
            top: p4Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from play-in 5
      lines.push(
        <View
          key="hb3"
          style={{
            position: "absolute",
            left: 0,
            top: p5Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Vertical bar
      lines.push(
        <View
          key="v3"
          style={{
            position: "absolute",
            left: CONN_W / 2 - LINE_W / 2,
            top: p4Y,
            width: LINE_W,
            height: p5Y - p4Y,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal to quarterfinal 3
      lines.push(
        <View
          key="hm3"
          style={{
            position: "absolute",
            left: CONN_W / 2,
            top: q3Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }
  } else if (numTeams === 15 && currentCount === 7 && nextCount === 4) {
    // Special case: 15-team bracket (7 play-ins → 4 quarterfinals)

    // Play-in 0 → Quarterfinal 0 (straight line)
    const p0Y = currentYCenters[0];
    const q0Y = nextYCenters[0];
    if (p0Y != null && q0Y != null) {
      lines.push(
        <View
          key="p0"
          style={{
            position: "absolute",
            left: 0,
            top: p0Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-ins 1 & 2 pair into Quarterfinal 1
    const p1Y = currentYCenters[1];
    const p2Y = currentYCenters[2];
    const q1Y = nextYCenters[1];
    if (p1Y != null && p2Y != null && q1Y != null) {
      // Horizontal from play-in 1
      lines.push(
        <View
          key="ht1"
          style={{
            position: "absolute",
            left: 0,
            top: p1Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from play-in 2
      lines.push(
        <View
          key="hb1"
          style={{
            position: "absolute",
            left: 0,
            top: p2Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Vertical bar
      lines.push(
        <View
          key="v1"
          style={{
            position: "absolute",
            left: CONN_W / 2 - LINE_W / 2,
            top: p1Y,
            width: LINE_W,
            height: p2Y - p1Y,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal to quarterfinal 1
      lines.push(
        <View
          key="hm1"
          style={{
            position: "absolute",
            left: CONN_W / 2,
            top: q1Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-ins 3 & 4 pair into Quarterfinal 2
    const p3Y = currentYCenters[3];
    const p4Y = currentYCenters[4];
    const q2Y = nextYCenters[2];
    if (p3Y != null && p4Y != null && q2Y != null) {
      // Horizontal from play-in 3
      lines.push(
        <View
          key="ht2"
          style={{
            position: "absolute",
            left: 0,
            top: p3Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from play-in 4
      lines.push(
        <View
          key="hb2"
          style={{
            position: "absolute",
            left: 0,
            top: p4Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Vertical bar
      lines.push(
        <View
          key="v2"
          style={{
            position: "absolute",
            left: CONN_W / 2 - LINE_W / 2,
            top: p3Y,
            width: LINE_W,
            height: p4Y - p3Y,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal to quarterfinal 2
      lines.push(
        <View
          key="hm2"
          style={{
            position: "absolute",
            left: CONN_W / 2,
            top: q2Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-ins 5 & 6 pair into Quarterfinal 3
    const p5Y = currentYCenters[5];
    const p6Y = currentYCenters[6];
    const q3Y = nextYCenters[3];
    if (p5Y != null && p6Y != null && q3Y != null) {
      // Horizontal from play-in 5
      lines.push(
        <View
          key="ht3"
          style={{
            position: "absolute",
            left: 0,
            top: p5Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from play-in 6
      lines.push(
        <View
          key="hb3"
          style={{
            position: "absolute",
            left: 0,
            top: p6Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Vertical bar
      lines.push(
        <View
          key="v3"
          style={{
            position: "absolute",
            left: CONN_W / 2 - LINE_W / 2,
            top: p5Y,
            width: LINE_W,
            height: p6Y - p5Y,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal to quarterfinal 3
      lines.push(
        <View
          key="hm3"
          style={{
            position: "absolute",
            left: CONN_W / 2,
            top: q3Y - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }
  } else if (numTeams === 11 && currentCount === 3 && nextCount === 4) {
    // Special case: 11-team bracket (3 play-in games → 4 quarterfinal games)
    // Play-in 0 → Quarterfinal 0
    const playIn0Y = currentYCenters[0];
    const quarter0Y = nextYCenters[0];
    if (playIn0Y != null && quarter0Y != null) {
      lines.push(
        <View
          key="playin-0"
          style={{
            position: "absolute",
            left: 0,
            top: playIn0Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-in 1 → Quarterfinal 2 (skip quarterfinal 1)
    const playIn1Y = currentYCenters[1];
    const quarter2Y = nextYCenters[2];
    if (playIn1Y != null && quarter2Y != null) {
      lines.push(
        <View
          key="playin-1"
          style={{
            position: "absolute",
            left: 0,
            top: playIn1Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-in 2 → Quarterfinal 3
    const playIn2Y = currentYCenters[2];
    const quarter3Y = nextYCenters[3];
    if (playIn2Y != null && quarter3Y != null) {
      lines.push(
        <View
          key="playin-2"
          style={{
            position: "absolute",
            left: 0,
            top: playIn2Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }
    // Quarterfinal 1 has no connector (bye)
  } else if (numTeams === 10 && currentCount === 2 && nextCount === 4) {
    // Play-in game 0 → Quarterfinal position 1
    const playIn0Y = currentYCenters[0];
    const quarter1Y = nextYCenters[1];
    if (playIn0Y != null && quarter1Y != null) {
      lines.push(
        <View
          key="playin-0"
          style={{
            position: "absolute",
            left: 0,
            top: playIn0Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-in game 1 → Quarterfinal position 2
    const playIn1Y = currentYCenters[1];
    const quarter2Y = nextYCenters[2];
    if (playIn1Y != null && quarter2Y != null) {
      lines.push(
        <View
          key="playin-1"
          style={{
            position: "absolute",
            left: 0,
            top: playIn1Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }
  } else if (numTeams === 18 && currentCount === 2 && nextCount === 8) {
    // Special case: 18-team bracket (2 play-ins → 8 Round 1 games)
    // Play-in 0 → Round 1 position 0 (straight line - vertically aligned)
    const playIn0Y = currentYCenters[0];
    const r1Pos0Y = nextYCenters[0];
    if (playIn0Y != null && r1Pos0Y != null) {
      lines.push(
        <View
          key="playin-0"
          style={{
            position: "absolute",
            left: 0,
            top: playIn0Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Play-in 1 → Round 1 position 4 (straight line - vertically aligned)
    const playIn1Y = currentYCenters[1];
    const r1Pos4Y = nextYCenters[4];
    if (playIn1Y != null && r1Pos4Y != null) {
      lines.push(
        <View
          key="playin-1"
          style={{
            position: "absolute",
            left: 0,
            top: playIn1Y - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }
  } else if (numTeams === 7 && currentCount === 3 && nextCount === 2) {
    // Position 0: straight line (bye to semifinals)
    const y0 = currentYCenters[0];
    const nextY0 = nextYCenters[0];

    if (y0 != null && nextY0 != null) {
      lines.push(
        <View
          key="s-0"
          style={{
            position: "absolute",
            left: 0,
            top: y0 - LINE_W / 2,
            width: CONN_W,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Positions 1 and 2: paired into next position 1
    const y1 = currentYCenters[1];
    const y2 = currentYCenters[2];
    const nextY1 = nextYCenters[1];

    if (y1 != null && y2 != null && nextY1 != null) {
      // Horizontal from game 1
      lines.push(
        <View
          key="ht-1"
          style={{
            position: "absolute",
            left: 0,
            top: y1 - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from game 2
      lines.push(
        <View
          key="hb-1"
          style={{
            position: "absolute",
            left: 0,
            top: y2 - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Vertical bar
      lines.push(
        <View
          key="v-1"
          style={{
            position: "absolute",
            left: CONN_W / 2 - LINE_W / 2,
            top: y1,
            width: LINE_W,
            height: y2 - y1,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from midpoint to next round
      lines.push(
        <View
          key="hm-1"
          style={{
            position: "absolute",
            left: CONN_W / 2,
            top: nextY1 - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }
  } else if (currentCount === nextCount) {
    // 1:1 mapping — each game connects straight across to a unique next game
    for (let i = 0; i < currentCount; i++) {
      const y = currentYCenters[i];
      const nextY = nextYCenters[i];
      if (y == null || nextY == null) continue;

      if (Math.abs(y - nextY) < 2) {
        // Aligned — simple straight line
        lines.push(
          <View
            key={`s-${i}`}
            style={{
              position: "absolute",
              left: 0,
              top: y - LINE_W / 2,
              width: CONN_W,
              height: LINE_W,
              backgroundColor: LINE_CLR,
            }}
          />,
        );
      } else {
        // Slight Y offset — horizontal + vertical + horizontal
        const minY = Math.min(y, nextY);
        const maxY = Math.max(y, nextY);
        lines.push(
          <View
            key={`sl-${i}`}
            style={{
              position: "absolute",
              left: 0,
              top: y - LINE_W / 2,
              width: CONN_W / 2,
              height: LINE_W,
              backgroundColor: LINE_CLR,
            }}
          />,
        );
        lines.push(
          <View
            key={`sv-${i}`}
            style={{
              position: "absolute",
              left: CONN_W / 2 - LINE_W / 2,
              top: minY,
              width: LINE_W,
              height: maxY - minY,
              backgroundColor: LINE_CLR,
            }}
          />,
        );
        lines.push(
          <View
            key={`sr-${i}`}
            style={{
              position: "absolute",
              left: CONN_W / 2,
              top: nextY - LINE_W / 2,
              width: CONN_W / 2,
              height: LINE_W,
              backgroundColor: LINE_CLR,
            }}
          />,
        );
      }
    }
  } else {
    // Standard halving — pair current-round games into next-round games
    const pairCount = Math.floor(currentCount / 2);
    for (let j = 0; j < pairCount; j++) {
      const topY = currentYCenters[j * 2];
      const bottomY = currentYCenters[j * 2 + 1];
      if (topY == null || bottomY == null) continue;
      const midY = nextYCenters[j] ?? (topY + bottomY) / 2;

      // Horizontal from top game
      lines.push(
        <View
          key={`ht-${j}`}
          style={{
            position: "absolute",
            left: 0,
            top: topY - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from bottom game
      lines.push(
        <View
          key={`hb-${j}`}
          style={{
            position: "absolute",
            left: 0,
            top: bottomY - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Vertical bar
      lines.push(
        <View
          key={`v-${j}`}
          style={{
            position: "absolute",
            left: CONN_W / 2 - LINE_W / 2,
            top: topY,
            width: LINE_W,
            height: bottomY - topY,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
      // Horizontal from midpoint to next round
      lines.push(
        <View
          key={`hm-${j}`}
          style={{
            position: "absolute",
            left: CONN_W / 2,
            top: midY - LINE_W / 2,
            width: CONN_W / 2,
            height: LINE_W,
            backgroundColor: LINE_CLR,
          }}
        />,
      );
    }

    // Odd game at end (bye) — straight line
    if (currentCount % 2 === 1) {
      const lastY = currentYCenters[currentCount - 1];
      if (lastY != null) {
        lines.push(
          <View
            key="odd"
            style={{
              position: "absolute",
              left: 0,
              top: lastY - LINE_W / 2,
              width: CONN_W,
              height: LINE_W,
              backgroundColor: LINE_CLR,
            }}
          />,
        );
      }
    }
  }

  return <View style={{ width: CONN_W, position: "relative" }}>{lines}</View>;
}
