// shared/games/insights/team/team.benchmarks.js

export const TEAM_GAMES_BENCHMARK_GROUPS = {
  RESULTS: 'results',
  GOALS: 'goals',
  PROJECTION: 'projection',
}

export const TEAM_GAMES_TABLE_LEVELS = [
  {
    id: 'bottom',
    label: 'תחתון',
    shortLabel: 'תחתון',
    rankLabel: 'אזור תחתון',
    rankRange: [14, 17],
    pointsRange: { min: 0, max: 30 },
    color: 'danger',

    targetPoints: 18,
    targetPointsRate: 20,
    targetGoalDifference: -59,
    targetGoalsFor: 33,
    targetGoalsAgainst: 92,

    homeAwayTargets: {
      overall: { greenMin: 30, redBelow: 25 },
      home: { greenMin: 35, redBelow: 30 },
      away: { greenMin: 25, redBelow: 15 },
      gap: { greenMax: 15, redMin: 20 },
    },

    difficultyTargets: {
      easy: { targetRate: 34 },
      equal: { targetRate: 34 },
      hard: { targetRate: 22 },
    },

    scorersTargets: {
      uniqueScorers: { greenMin: 5, redBelow: 4 },
      scorers3Plus: { greenMin: 2, redBelow: 1 },
      scorers5Plus: { greenMin: 1, redBelow: 0 },
      scorers10Plus: { greenMin: 0, redBelow: null },

      topScorerDependencyPct: { greenMax: 45, redAbove: 50 },
      top3DependencyPct: { greenMax: 75, redAbove: 82 },
      oneGoalScorersPct: { greenMax: 45, redAbove: 60 },
    },
  },
  {
    id: 'midLow',
    label: 'אמצע תחתון',
    shortLabel: 'אמצע תחתון',
    rankLabel: 'אזור 9–13',
    rankRange: [9, 13],
    pointsRange: { min: 30, max: 40 },
    color: 'warning',

    targetPoints: 33,
    targetPointsRate: 37,
    targetGoalDifference: -18,
    targetGoalsFor: 42,
    targetGoalsAgainst: 60,

    homeAwayTargets: {
      overall: { greenMin: 40, redBelow: 35 },
      home: { greenMin: 45, redBelow: 40 },
      away: { greenMin: 35, redBelow: 25 },
      gap: { greenMax: 15, redMin: 20 },
    },

    difficultyTargets: {
      easy: { targetRate: 63 },
      equal: { targetRate: 50 },
      hard: { targetRate: 28 },
    },

    scorersTargets: {
      uniqueScorers: { greenMin: 7, redBelow: 5 },
      scorers3Plus: { greenMin: 4, redBelow: 3 },
      scorers5Plus: { greenMin: 2, redBelow: 1 },
      scorers10Plus: { greenMin: 0, redBelow: null },

      topScorerDependencyPct: { greenMax: 40, redAbove: 48 },
      top3DependencyPct: { greenMax: 70, redAbove: 78 },
      oneGoalScorersPct: { greenMax: 40, redAbove: 56 },
    },
  },
  {
    id: 'midHigh',
    label: 'אמצע עליון',
    shortLabel: 'אמצע עליון',
    rankLabel: 'אזור 5–8',
    rankRange: [5, 8],
    pointsRange: { min: 40, max: 55 },
    color: 'primary',

    targetPoints: 48,
    targetPointsRate: 53,
    targetGoalDifference: 9,
    targetGoalsFor: 60,
    targetGoalsAgainst: 51,

    homeAwayTargets: {
      overall: { greenMin: 55, redBelow: 50 },
      home: { greenMin: 60, redBelow: 45 },
      away: { greenMin: 50, redBelow: 40 },
      gap: { greenMax: 15, redMin: 18 },
    },

    difficultyTargets: {
      easy: { targetRate: 71 },
      equal: { targetRate: 45 },
      hard: { targetRate: 17 },
    },

    scorersTargets: {
      uniqueScorers: { greenMin: 10, redBelow: 8 },
      scorers3Plus: { greenMin: 6, redBelow: 4 },
      scorers5Plus: { greenMin: 4, redBelow: 3 },
      scorers10Plus: { greenMin: 1, redBelow: 0 },

      topScorerDependencyPct: { greenMax: 35, redAbove: 42 },
      top3DependencyPct: { greenMax: 65, redAbove: 72 },
      oneGoalScorersPct: { greenMax: 40, redAbove: 56 },
    },
  },
  {
    id: 'top',
    label: 'עליון / צמרת',
    shortLabel: 'עליון',
    rankLabel: 'אזור 1–4',
    rankRange: [1, 4],
    pointsRange: { min: 55, max: null },
    color: 'success',

    targetPoints: 67,
    targetPointsRate: 74,
    targetGoalDifference: 56,
    targetGoalsFor: 89,
    targetGoalsAgainst: 34,

    homeAwayTargets: {
      overall: { greenMin: 70, redBelow: 65 },
      home: { greenMin: 75, redBelow: 65 },
      away: { greenMin: 65, redBelow: 60 },
      gap: { greenMax: 12, redMin: 15 },
    },

    difficultyTargets: {
      easy: { targetRate: 80 },
      equal: { targetRate: 50 },
      hard: { targetRate: 40 },
    },

    scorersTargets: {
      uniqueScorers: { greenMin: 14, redBelow: 10 },
      scorers3Plus: { greenMin: 8, redBelow: 5 },
      scorers5Plus: { greenMin: 5, redBelow: 3 },
      scorers10Plus: { greenMin: 2, redBelow: 1 },

      topScorerDependencyPct: { greenMax: 30, redAbove: 40 },
      top3DependencyPct: { greenMax: 60, redAbove: 70 },
      oneGoalScorersPct: { greenMax: 35, redAbove: 55 },
    },
  },
]

const buildRows = (valueKey, unit) => {
  return TEAM_GAMES_TABLE_LEVELS.map((level) => ({
    id: level.id,
    label: level.label,
    shortLabel: level.shortLabel,
    rankLabel: level.rankLabel,
    rankRange: level.rankRange,
    pointsRange: level.pointsRange,
    color: level.color,
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
    comparedMetrics: ['team_games_points_rate'],
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
    comparedMetrics: ['team_games_projected_total_points'],
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
    comparedMetrics: ['team_games_goal_difference'],
    rows: buildRows('targetGoalDifference', 'goals'),
    source: 'leagueTableAverage',
  },
  {
    id: 'team_games_benchmark_goals_for_by_table_level',
    group: TEAM_GAMES_BENCHMARK_GROUPS.GOALS,
    label: 'שערי זכות נדרשים לפי רמת טבלה',
    description: 'נקודת ייחוס לכמות שערי זכות לפי רמת מיקום בטבלה.',
    benchmarkType: 'tableLevel',
    comparedMetric: 'team_games_projected_goals_for',
    comparedMetrics: [
      'team_games_goals_for_per_game',
      'team_games_projected_goals_for',
    ],
    supportsPerGameNormalization: true,
    normalizedByField: 'leagueNumGames',
    rows: buildRows('targetGoalsFor', 'goals'),
    source: 'leagueTableAverage',
  },
  {
    id: 'team_games_benchmark_goals_against_by_table_level',
    group: TEAM_GAMES_BENCHMARK_GROUPS.GOALS,
    label: 'שערי חובה נדרשים לפי רמת טבלה',
    description: 'נקודת ייחוס לכמות שערי חובה לפי רמת מיקום בטבלה.',
    benchmarkType: 'tableLevel',
    comparedMetric: 'team_games_projected_goals_against',
    comparedMetrics: [
      'team_games_goals_against_per_game',
      'team_games_projected_goals_against',
    ],
    supportsPerGameNormalization: true,
    normalizedByField: 'leagueNumGames',
    rows: buildRows('targetGoalsAgainst', 'goals'),
    source: 'leagueTableAverage',
  },
]

export const resolveTeamGamesTableLevelByProjectedPoints = (points) => {
  const n = Number(points)

  if (!Number.isFinite(n)) return null

  return (
    TEAM_GAMES_TABLE_LEVELS.find((level) => {
      const min = Number(level?.pointsRange?.min ?? 0)
      const max = level?.pointsRange?.max

      if (max === null || max === undefined) return n >= min

      return n >= min && n < Number(max)
    }) || null
  )
}

export const getTeamGamesBenchmarkLevelById = (id) => {
  return TEAM_GAMES_TABLE_LEVELS.find((level) => level.id === id) || null
}

export const getTeamGamesHomeAwayTargetsByLevelId = (id) => {
  const level = getTeamGamesBenchmarkLevelById(id)

  return level?.homeAwayTargets || null
}

export const getTeamGamesDifficultyTargetsByLevelId = (id) => {
  const level = getTeamGamesBenchmarkLevelById(id)

  return level?.difficultyTargets || null
}

export const getTeamGamesScorersTargetsByLevelId = (id) => {
  const level = getTeamGamesBenchmarkLevelById(id)

  return level?.scorersTargets || null
}

export const getTeamGamesBenchmarkById = (id) => {
  return TEAM_GAMES_BENCHMARKS_CATALOG.find((benchmark) => benchmark.id === id) || null
}

export const getTeamGamesBenchmarksByGroup = (group) => {
  return TEAM_GAMES_BENCHMARKS_CATALOG.filter((benchmark) => benchmark.group === group)
}

export const getTeamGamesBenchmarksByComparedMetric = (metricId) => {
  return TEAM_GAMES_BENCHMARKS_CATALOG.filter((benchmark) => {
    if (benchmark.comparedMetric === metricId) return true

    if (Array.isArray(benchmark.comparedMetrics)) {
      return benchmark.comparedMetrics.includes(metricId)
    }

    return false
  })
}

export const getTeamGamesTableLevels = () => {
  return TEAM_GAMES_TABLE_LEVELS
}
