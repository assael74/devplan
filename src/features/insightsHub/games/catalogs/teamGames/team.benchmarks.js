// features/insightsHub/games/catalogs/teamGames/team.benchmarks.js

export const TEAM_GAMES_BENCHMARK_GROUPS = {
  RESULTS: 'results',
  GOALS: 'goals',
  PROJECTION: 'projection',
}

const TABLE_LEVELS = [
  {
    id: 'top',
    label: 'צמרת / מקומות 1–4',
    rankRange: [1, 4],
    targetPoints: 67,
    targetPointsRate: 74,
    targetGoalDifference: 56,
    targetGoalsFor: 89,
    targetGoalsAgainst: 34,
  },
  {
    id: 'upper',
    label: 'חלק עליון / מקומות 5–8',
    rankRange: [5, 8],
    targetPoints: 48,
    targetPointsRate: 53,
    targetGoalDifference: 9,
    targetGoalsFor: 60,
    targetGoalsAgainst: 51,
  },
  {
    id: 'midLow',
    label: 'אמצע / תחתון / מקומות 9–13',
    rankRange: [9, 13],
    targetPoints: 33,
    targetPointsRate: 37,
    targetGoalDifference: -18,
    targetGoalsFor: 42,
    targetGoalsAgainst: 60,
  },
  {
    id: 'bottom',
    label: 'תחתית / מקומות 14–17',
    rankRange: [14, 17],
    targetPoints: 18,
    targetPointsRate: 20,
    targetGoalDifference: -59,
    targetGoalsFor: 33,
    targetGoalsAgainst: 92,
  },
]

function buildRows(valueKey, unit) {
  return TABLE_LEVELS.map((level) => ({
    id: level.id,
    label: level.label,
    rankRange: level.rankRange,
    value: level[valueKey],
    unit,
  }))
}

export const TEAM_GAMES_BENCHMARKS_CATALOG = [
  {
    id: 'team_games_benchmark_points_rate_by_table_level',
    group: TEAM_GAMES_BENCHMARK_GROUPS.RESULTS,
    label: 'אחוז הצלחה נדרש לפי רמת טבלה',
    description: 'נקודת ייחוס לאחוז צבירת נקודות לפי רמת מיקום בטבלה.',
    benchmarkType: 'tableLevel',
    comparedMetric: 'team_games_points_rate',
    rows: buildRows('targetPointsRate', 'percent'),
    source: 'leagueTableAverage',
  },
  {
    id: 'team_games_benchmark_final_points_by_table_level',
    group: TEAM_GAMES_BENCHMARK_GROUPS.PROJECTION,
    label: 'נקודות נדרשות לפי רמת טבלה',
    description: 'נקודת ייחוס לכמות נקודות סופית צפויה לפי רמת מיקום בטבלה.',
    benchmarkType: 'tableLevel',
    comparedMetric: 'team_games_projected_total_points',
    rows: buildRows('targetPoints', 'points'),
    source: 'leagueTableAverage',
  },
  {
    id: 'team_games_benchmark_goal_difference_by_table_level',
    group: TEAM_GAMES_BENCHMARK_GROUPS.GOALS,
    label: 'הפרש שערים נדרש לפי רמת טבלה',
    description: 'נקודת ייחוס להפרש שערים לפי רמת מיקום בטבלה.',
    benchmarkType: 'tableLevel',
    comparedMetric: 'team_games_goal_difference',
    rows: buildRows('targetGoalDifference', 'goals'),
    source: 'leagueTableAverage',
  },
  {
    id: 'team_games_benchmark_goals_for_by_table_level',
    group: TEAM_GAMES_BENCHMARK_GROUPS.GOALS,
    label: 'שערי זכות נדרשים לפי רמת טבלה',
    description: 'נקודת ייחוס לכמות שערי זכות לפי רמת מיקום בטבלה.',
    benchmarkType: 'tableLevel',
    comparedMetric: 'team_games_goals_for_per_game',
    rows: buildRows('targetGoalsFor', 'goals'),
    source: 'leagueTableAverage',
  },
  {
    id: 'team_games_benchmark_goals_against_by_table_level',
    group: TEAM_GAMES_BENCHMARK_GROUPS.GOALS,
    label: 'שערי חובה נדרשים לפי רמת טבלה',
    description: 'נקודת ייחוס לכמות שערי חובה לפי רמת מיקום בטבלה.',
    benchmarkType: 'tableLevel',
    comparedMetric: 'team_games_goals_against_per_game',
    rows: buildRows('targetGoalsAgainst', 'goals'),
    source: 'leagueTableAverage',
  },
]

export const getTeamGamesBenchmarkById = (id) => {
  return TEAM_GAMES_BENCHMARKS_CATALOG.find((benchmark) => benchmark.id === id) || null
}

export const getTeamGamesBenchmarksByGroup = (group) => {
  return TEAM_GAMES_BENCHMARKS_CATALOG.filter((benchmark) => benchmark.group === group)
}
