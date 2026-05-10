// shared/games/insights/team/targets/teamBenchmarks.catalog.js

import {
  TEAM_GAMES_TARGET_GROUPS,
  TEAM_GAMES_TARGET_PROFILES,
} from '../../../../teams/targets/index.js'

export const TEAM_GAMES_BENCHMARK_GROUPS = {
  RESULTS: 'results',
  GOALS: 'goals',
  PROJECTION: 'projection',
}

const getForecastTarget = (profile, key) => {
  return profile?.targets?.[TEAM_GAMES_TARGET_GROUPS.FORECAST]?.[key]
}

const buildRows = (targetKey, unit) => {
  return TEAM_GAMES_TARGET_PROFILES.map((profile) => ({
    id: profile.id,
    label: profile.label,
    shortLabel: profile.shortLabel,
    rankLabel: profile.rankLabel,
    rankRange: profile.rankRange,
    pointsRange: profile.pointsRange,
    color: profile.color,
    value: getForecastTarget(profile, targetKey),
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
    rows: buildRows('pointsRate', 'percent'),
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
    rows: buildRows('points', 'points'),
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
    rows: buildRows('goalDifference', 'goals'),
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
    rows: buildRows('goalsFor', 'goals'),
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
    rows: buildRows('goalsAgainst', 'goals'),
    source: 'leagueTableAverage',
  },
]

export const getTeamGamesBenchmarkById = (id) => {
  return (
    TEAM_GAMES_BENCHMARKS_CATALOG.find((benchmark) => benchmark.id === id) ||
    null
  )
}

export const getTeamGamesBenchmarksByGroup = (group) => {
  return TEAM_GAMES_BENCHMARKS_CATALOG.filter((benchmark) => {
    return benchmark.group === group
  })
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
