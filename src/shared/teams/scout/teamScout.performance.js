// src/shared/teams/scout/teamScout.performance.js

import {
  getTeamScoutBenchmarkLeagueGoalsPerTeamGame,
  getTeamScoutPositionBenchmark,
} from './teamScout.benchmark.js'

import {
  TEAM_SCOUT_NORMALIZATION_CONFIG,
  TEAM_SCOUT_NORMALIZATION_MODE,
  resolveTeamScoutPriorityLevel,
  resolveTeamScoutPriorityScoreLevel,
  resolveTeamScoutAnomalyLevel,
} from './teamScout.model.js'

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const roundWholeNumber = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return Math.round(n)
}

const roundPrecision = (value, digits = 3) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return Number(n.toFixed(digits))
}

const SCOUT_PRIORITY_CALIBRATION = Object.freeze({
  qualityWeight: 0.6,
  targetWeight: 0.25,
  rankingWeight: 0.15,
  targetFullScoreRate: 150,
  rankingFullScoreRate: 200,
})

const clampRange = ({ value, min = 0, max = 100 } = {}) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return Math.max(min, Math.min(max, n))
}

const clampRate = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return roundWholeNumber(Math.max(0, Math.min(200, n)))
}

const clampScore = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return roundWholeNumber(Math.max(0, Math.min(100, n)))
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

  return roundWholeNumber(Math.sqrt(a * b))
}

const buildQualityRate = ({ rank, teamsCount } = {}) => {
  const place = toNumber(rank)
  const count = toNumber(teamsCount)

  if (!Number.isFinite(place) || !Number.isFinite(count) || count <= 0) {
    return null
  }

  const qualityRate = ((count + 1 - place) / count) * 100
  const normalizedQuality = clampRange({ value: qualityRate })

  return roundWholeNumber(normalizedQuality)
}

const normalizeTargetRate = value => {
  const rate = toNumber(value)
  if (!Number.isFinite(rate)) return null

  const normalized = (rate / SCOUT_PRIORITY_CALIBRATION.targetFullScoreRate) * 100

  return roundWholeNumber(clampRange({ value: normalized }))
}

const normalizeDeviationRate = value => {
  const rate = toNumber(value)
  if (!Number.isFinite(rate)) return null

  const normalized = (rate / SCOUT_PRIORITY_CALIBRATION.rankingFullScoreRate) * 100

  return roundWholeNumber(clampRange({ value: normalized }))
}

const applyScoutPriorityCaps = ({ rate, qualityRate } = {}) => {
  const priority = toNumber(rate)
  const quality = toNumber(qualityRate)

  if (!Number.isFinite(priority) || !Number.isFinite(quality)) return null

  if (quality < 33.33) return Math.min(priority, 57)
  if (quality < 65) return Math.min(priority, 69)

  return priority
}

const buildScoutPriorityScore = ({
  qualityRate,
  targetRate,
  rankingRate,
} = {}) => {
  const quality = toNumber(qualityRate)
  const target = normalizeTargetRate(targetRate)
  const deviation = normalizeDeviationRate(rankingRate)

  if (
    !Number.isFinite(quality) ||
    !Number.isFinite(target) ||
    !Number.isFinite(deviation)
  ) {
    return null
  }

  const qualityNormalized = clampRange({ value: quality })

  if (!Number.isFinite(qualityNormalized)) return null

  const normalizedRate = (
    (qualityNormalized * SCOUT_PRIORITY_CALIBRATION.qualityWeight) +
    (target * SCOUT_PRIORITY_CALIBRATION.targetWeight) +
    (deviation * SCOUT_PRIORITY_CALIBRATION.rankingWeight)
  )

  const priorityScore = clampScore(normalizedRate)

  return applyScoutPriorityCaps({
    rate: priorityScore,
    qualityRate: quality,
  })
}

const resolveOpportunityType = ({
  qualityRate,
  targetRate,
  anomalyRate,
} = {}) => {
  const quality = toNumber(qualityRate)
  const target = toNumber(targetRate)
  const anomaly = toNumber(anomalyRate)

  if (
    !Number.isFinite(quality) ||
    !Number.isFinite(target) ||
    !Number.isFinite(anomaly)
  ) {
    return 'unavailable'
  }

  const hasQuality = quality >= 65
  const hasAnomaly = anomaly >= 125

  if (hasQuality && hasAnomaly) return 'quality_anomaly'
  if (hasQuality) return 'proven_quality'
  if (hasAnomaly) return 'interesting_anomaly'
  if (target >= 115) return 'above_target'

  return 'neutral'
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
    benchmarkGoalsPerTeamGame: roundPrecision(benchmarkGoalsPerGame),
    leagueGoalsPerTeamGame: roundPrecision(leagueGoalsPerTeamGame),
    rawFactor: roundPrecision(rawFactor),
    deviationPct: roundWholeNumber(deviationPct),
    applied: appliedFactor !== 1,
    appliedFactor: roundPrecision(appliedFactor),
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
  const offenseTargetNormalized = normalizeTargetRate(offensePerformanceRate)
  const defenseTargetNormalized = normalizeTargetRate(defensePerformanceRate)
  const offenseRankingNormalized = normalizeDeviationRate(offenseRankingRate)
  const defenseRankingNormalized = normalizeDeviationRate(defenseRankingRate)
  const offenseScoutPriorityScore = buildScoutPriorityScore({
    qualityRate: offenseQualityRate,
    targetRate: offensePerformanceRate,
    rankingRate: offenseRankingRate,
  })
  const defenseScoutPriorityScore = buildScoutPriorityScore({
    qualityRate: defenseQualityRate,
    targetRate: defensePerformanceRate,
    rankingRate: defenseRankingRate,
  })
  const offenseOpportunityType = resolveOpportunityType({
    qualityRate: offenseQualityRate,
    targetRate: offensePerformanceRate,
    anomalyRate: offenseCombinedRate,
  })
  const defenseOpportunityType = resolveOpportunityType({
    qualityRate: defenseQualityRate,
    targetRate: defensePerformanceRate,
    anomalyRate: defenseCombinedRate,
  })

  return {
    ...row,
    benchmark,
    offense: {
      targetRate: offensePerformanceRate,
      targetLevel: resolveTeamScoutPriorityLevel(offensePerformanceRate),
      targetNormalized: offenseTargetNormalized,
      rankingRate: offenseRankingRate,
      rankingLevel: resolveTeamScoutPriorityLevel(offenseRankingRate),
      rankingNormalized: offenseRankingNormalized,
      anomalyRate: offenseCombinedRate,
      anomalyLevel: resolveTeamScoutAnomalyLevel(offenseCombinedRate),
      qualityRate: offenseQualityRate,
      scoutPriorityScore: offenseScoutPriorityScore,
      priorityLevel: resolveTeamScoutPriorityScoreLevel(offenseScoutPriorityScore),
      opportunityType: offenseOpportunityType,
    },
    defense: {
      targetRate: defensePerformanceRate,
      targetLevel: resolveTeamScoutPriorityLevel(defensePerformanceRate),
      targetNormalized: defenseTargetNormalized,
      rankingRate: defenseRankingRate,
      rankingLevel: resolveTeamScoutPriorityLevel(defenseRankingRate),
      rankingNormalized: defenseRankingNormalized,
      anomalyRate: defenseCombinedRate,
      anomalyLevel: resolveTeamScoutAnomalyLevel(defenseCombinedRate),
      qualityRate: defenseQualityRate,
      scoutPriorityScore: defenseScoutPriorityScore,
      priorityLevel: resolveTeamScoutPriorityScoreLevel(defenseScoutPriorityScore),
      opportunityType: defenseOpportunityType,
    },
  }
}
