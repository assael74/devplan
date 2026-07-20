// src/shared/teams/scout/teamScout.performance.js

import {
  getTeamScoutBenchmarkLeagueGoalsPerTeamGame,
  getTeamScoutPositionBenchmark,
} from './teamScout.benchmark.js'

import {
  TEAM_SCOUT_NORMALIZATION_CONFIG,
  TEAM_SCOUT_NORMALIZATION_MODE,
  resolveTeamScoutPriorityLevel,
  resolveTeamScoutAnomalyLevel,
} from './teamScout.model.js'

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const roundNumber = (value, digits = 2) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return Number(n.toFixed(digits))
}

const clampRate = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return roundNumber(Math.max(0, Math.min(200, n)), 2)
}

const safeRate = ({ numerator, denominator }) => {
  const top = toNumber(numerator)
  const bottom = toNumber(denominator)

  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom <= 0) {
    return null
  }

  return clampRate((top / bottom) * 100)
}

const geometricMean = (first, second) => {
  const a = toNumber(first)
  const b = toNumber(second)

  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) {
    return null
  }

  return roundNumber(Math.sqrt(a * b), 2)
}

const buildQualityRate = ({ rank, teamsCount } = {}) => {
  const place = toNumber(rank)
  const count = toNumber(teamsCount)

  if (!Number.isFinite(place) || !Number.isFinite(count) || count <= 0) {
    return null
  }

  if (count === 1) return 100

  return clampRate(((count - place) / (count - 1)) * 200)
}

const buildScoutPriorityRate = ({ qualityRate, combinedRate } = {}) => {
  const quality = toNumber(qualityRate)
  const anomaly = toNumber(combinedRate)

  if (!Number.isFinite(quality) || !Number.isFinite(anomaly)) return null

  return clampRate((quality * 0.7) + (anomaly * 0.3))
}

export const buildTeamScoutEnvironment = ({
  rows = [],
  leagueLevel,
  mode = TEAM_SCOUT_NORMALIZATION_MODE.OFF,
  manualFactor,
} = {}) => {
  const activeMode = Object.values(TEAM_SCOUT_NORMALIZATION_MODE).includes(mode)
    ? mode
    : TEAM_SCOUT_NORMALIZATION_MODE.OFF
  const benchmarkGoalsPerGame = getTeamScoutBenchmarkLeagueGoalsPerTeamGame(
    leagueLevel
  )
  const totals = rows.reduce((acc, row) => {
    const games = toNumber(row.gamesPlayed)
    const goalsFor = toNumber(row.goalsFor)
    const goalsAgainst = toNumber(row.goalsAgainst)

    if (!games || !Number.isFinite(goalsFor) || !Number.isFinite(goalsAgainst)) {
      return acc
    }

    return {
      teamGames: acc.teamGames + games,
      totalGoals: acc.totalGoals + goalsFor + goalsAgainst,
    }
  }, {
    teamGames: 0,
    totalGoals: 0,
  })

  const leagueGoalsPerTeamGame = totals.teamGames
    ? totals.totalGoals / (totals.teamGames * 2)
    : null
  const rawFactor = benchmarkGoalsPerGame && leagueGoalsPerTeamGame
    ? leagueGoalsPerTeamGame / benchmarkGoalsPerGame
    : 1
  const deviationPct = Math.abs(rawFactor - 1) * 100
  const manual = toNumber(manualFactor)

  let appliedFactor = 1

  if (activeMode === TEAM_SCOUT_NORMALIZATION_MODE.MANUAL && manual > 0) {
    appliedFactor = manual
  }

  if (
    activeMode === TEAM_SCOUT_NORMALIZATION_MODE.AUTO &&
    deviationPct > TEAM_SCOUT_NORMALIZATION_CONFIG.autoThresholdPct
  ) {
    appliedFactor = rawFactor
  }

  return {
    mode: activeMode,
    benchmarkGoalsPerTeamGame: roundNumber(benchmarkGoalsPerGame, 3),
    leagueGoalsPerTeamGame: roundNumber(leagueGoalsPerTeamGame, 3),
    rawFactor: roundNumber(rawFactor, 3),
    deviationPct: roundNumber(deviationPct, 2),
    applied: appliedFactor !== 1,
    appliedFactor: roundNumber(appliedFactor, 3),
  }
}

export const buildTeamScoutPerformance = ({
  row,
  leagueLevel,
  leagueNumGames,
  environmentFactor = 1,
  teamsCount,
} = {}) => {
  const benchmark = getTeamScoutPositionBenchmark({
    leagueLevel,
    position: row.position,
    leagueNumGames,
    environmentFactor,
  })

  if (!benchmark) {
    return {
      ...row,
      benchmark: null,
      offense: null,
      defense: null,
    }
  }

  const offensePerformanceRate = safeRate({
    numerator: row.projectedGoalsFor,
    denominator: benchmark.goalsFor,
  })
  const defensePerformanceRate = safeRate({
    numerator: benchmark.goalsAgainst,
    denominator: row.projectedGoalsAgainst,
  })
  const offenseRankingRate = safeRate({
    numerator: row.position,
    denominator: row.goalsForRank,
  })
  const defenseRankingRate = safeRate({
    numerator: row.position,
    denominator: row.goalsAgainstRank,
  })
  const offenseCombinedRate = geometricMean(
    offensePerformanceRate,
    offenseRankingRate
  )
  const defenseCombinedRate = geometricMean(
    defensePerformanceRate,
    defenseRankingRate
  )
  const offenseQualityRate = buildQualityRate({
    rank: row.goalsForRank,
    teamsCount,
  })
  const defenseQualityRate = buildQualityRate({
    rank: row.goalsAgainstRank,
    teamsCount,
  })
  const offenseScoutPriorityRate = buildScoutPriorityRate({
    qualityRate: offenseQualityRate,
    combinedRate: offenseCombinedRate,
  })
  const defenseScoutPriorityRate = buildScoutPriorityRate({
    qualityRate: defenseQualityRate,
    combinedRate: defenseCombinedRate,
  })

  return {
    ...row,
    benchmark,
    offense: {
      performanceRate: offensePerformanceRate,
      rankingRate: offenseRankingRate,
      combinedRate: offenseCombinedRate,
      anomalyRate: offenseCombinedRate,
      qualityRate: offenseQualityRate,
      scoutPriorityRate: offenseScoutPriorityRate,
      priorityRate: offenseScoutPriorityRate,
      priorityLevel: resolveTeamScoutPriorityLevel(offenseScoutPriorityRate),
      anomalyLevel: resolveTeamScoutAnomalyLevel(offenseCombinedRate),
    },
    defense: {
      performanceRate: defensePerformanceRate,
      rankingRate: defenseRankingRate,
      combinedRate: defenseCombinedRate,
      anomalyRate: defenseCombinedRate,
      qualityRate: defenseQualityRate,
      scoutPriorityRate: defenseScoutPriorityRate,
      priorityRate: defenseScoutPriorityRate,
      priorityLevel: resolveTeamScoutPriorityLevel(defenseScoutPriorityRate),
      anomalyLevel: resolveTeamScoutAnomalyLevel(defenseCombinedRate),
    },
  }
}
