// Calculate stats for a single team from completed pool games
export function calculateTeamStats(teamId, games, maxPointDiffCap = null) {
  const completed = games.filter(
    (g) => g.status === "completed" && !g.bracket_division && !g.bracket_grade,
  );
  let wins = 0,
    losses = 0,
    ps = 0,
    pa = 0,
    pd = 0;
  completed.forEach((g) => {
    let scored = 0,
      against = 0;
    if (g.home_team_id === teamId) {
      scored = g.home_score;
      against = g.away_score;
      if (scored > against) wins++;
      else if (scored < against) losses++;
    } else if (g.away_team_id === teamId) {
      scored = g.away_score;
      against = g.home_score;
      if (scored > against) wins++;
      else if (scored < against) losses++;
    }
    ps += scored;
    pa += against;
    let diff = scored - against;
    if (maxPointDiffCap && maxPointDiffCap > 0) {
      diff = Math.max(-maxPointDiffCap, Math.min(maxPointDiffCap, diff));
    }
    pd += diff;
  });
  return { wins, losses, ps, pa, pd };
}

// Sort pool teams by record then tiebreakers
export function getSortedPoolTeams(
  poolTeams,
  games,
  maxPointDiffCap,
  tiebreakerOrder,
) {
  const withStats = poolTeams.map((t) => ({
    ...t,
    stats: calculateTeamStats(t.id, games, maxPointDiffCap),
  }));

  withStats.sort((a, b) => {
    if (a.forfeit && !b.forfeit) return 1;
    if (!a.forfeit && b.forfeit) return -1;
    for (const tb of tiebreakerOrder) {
      let r = 0;
      if (tb === "record") {
        r = b.stats.wins - a.stats.wins;
      } else if (tb === "point_diff") {
        r = b.stats.pd - a.stats.pd;
      } else if (tb === "points_allowed") {
        r = a.stats.pa - b.stats.pa;
      } else if (tb === "points_scored") {
        r = b.stats.ps - a.stats.ps;
      }
      if (r !== 0) return r;
    }
    return 0;
  });

  return withStats;
}
