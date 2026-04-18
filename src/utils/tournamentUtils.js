export function calculateTeamStats(teamId, games) {
  const teamGames = games.filter(
    (g) =>
      (g.home_team_id === teamId || g.away_team_id === teamId) &&
      g.status === "completed",
  );
  let wins = 0;
  let losses = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;
  teamGames.forEach((g) => {
    const isHome = g.home_team_id === teamId;
    const myScore = isHome ? g.home_score : g.away_score;
    const oppScore = isHome ? g.away_score : g.home_score;
    pointsFor += myScore;
    pointsAgainst += oppScore;
    if (myScore > oppScore) wins++;
    else if (oppScore > myScore) losses++;
  });
  return {
    wins,
    losses,
    pd: pointsFor - pointsAgainst,
    gamesPlayed: teamGames.length,
  };
}

export function getTeamGames(teamId, games) {
  return games.filter(
    (g) => g.home_team_id === teamId || g.away_team_id === teamId,
  );
}

export function getTeamRecord(teamId, teamGames) {
  const wins = teamGames.filter(
    (g) =>
      g.status === "completed" &&
      ((g.home_team_id === teamId && g.home_score > g.away_score) ||
        (g.away_team_id === teamId && g.away_score > g.home_score)),
  ).length;
  const losses = teamGames.filter(
    (g) =>
      g.status === "completed" &&
      ((g.home_team_id === teamId && g.home_score < g.away_score) ||
        (g.away_team_id === teamId && g.away_score < g.home_score)),
  ).length;
  return { wins, losses };
}

export function getGradeLabel(grade) {
  // Split grade divisions (100-107)
  const splitGrades = {
    100: "1st/2nd Grade",
    101: "2nd/3rd Grade",
    102: "3rd/4th Grade",
    103: "4th/5th Grade",
    104: "5th/6th Grade",
    105: "6th/7th Grade",
    106: "7th/8th Grade",
    107: "8th/9th Grade",
  };

  if (splitGrades[grade]) {
    return splitGrades[grade];
  }

  if (grade == 15) return "Middle School";
  if (grade == 16) return "High School";
  if (grade == 0) return "JV";
  if (grade == 14) return "Varsity";

  // Convert to number for proper ordinal suffix calculation
  const num = parseInt(grade);

  // Determine ordinal suffix
  let suffix = "th";
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  // Special cases: 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    suffix = "th";
  }
  // 1st, 21st, 31st, etc.
  else if (lastDigit === 1) {
    suffix = "st";
  }
  // 2nd, 22nd, 32nd, etc.
  else if (lastDigit === 2) {
    suffix = "nd";
  }
  // 3rd, 23rd, 33rd, etc.
  else if (lastDigit === 3) {
    suffix = "rd";
  }

  return `${num}${suffix} Grade`;
}

export function getTeamCountForGrade(teams, divisionType, grade) {
  return teams.filter((t) => t.division === divisionType && t.grade === grade)
    .length;
}
