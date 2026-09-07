// src/shared/scouting/teams/interpretation/teamLinePerformanceInterpretation.js

import { TEAM_SCOUT_PRIORITY_LEVEL } from '../teamScout.model.js'

export const TEAM_INTERPRETATION_PERFORMANCE_BAND = Object.freeze({
  POSITIVE_OR_ABOVE: 'positive_or_above',
  REGULAR: 'regular',
  LOW: 'low',
  UNAVAILABLE: 'unavailable',
})

export const TEAM_INTERPRETATION_FINDING = Object.freeze({
  ATTACK_CONCENTRATION: 'ATTACK_CONCENTRATION',
  ATTACK_ESTABLISHED: 'ATTACK_ESTABLISHED',
  ATTACK_HIGH_COMPETITION: 'ATTACK_HIGH_COMPETITION',
  ATTACK_DEPTH_REVIEW: 'ATTACK_DEPTH_REVIEW',
  ATTACK_POSSIBLE_GAP: 'ATTACK_POSSIBLE_GAP',
  ATTACK_QUALITY_REVIEW: 'ATTACK_QUALITY_REVIEW',
  ATTACK_CLASSIFICATION_MISSING: 'ATTACK_CLASSIFICATION_MISSING',
  DEFENSE_CONCENTRATION: 'DEFENSE_CONCENTRATION',
  DEFENSE_ESTABLISHED: 'DEFENSE_ESTABLISHED',
  DEFENSE_DEPTH_REVIEW: 'DEFENSE_DEPTH_REVIEW',
  DEFENSE_POSSIBLE_GAP: 'DEFENSE_POSSIBLE_GAP',
  DEFENSE_QUALITY_REVIEW: 'DEFENSE_QUALITY_REVIEW',
  DEFENSE_QUALITY_SEARCH: 'DEFENSE_QUALITY_SEARCH',
  DEFENSE_LOW_QUALITY_OVERLOAD: 'DEFENSE_LOW_QUALITY_OVERLOAD',
  DEFENSE_CLASSIFICATION_MISSING: 'DEFENSE_CLASSIFICATION_MISSING',
  NO_CLEAR_FINDING: 'NO_CLEAR_FINDING',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
})

export const TEAM_INTERPRETATION_REVIEW_TASK = Object.freeze({
  MONITOR_DEFENSE_CORE: 'monitor_defense_core',
  SOURCE_QUALITY_DEFENDERS: 'source_quality_defenders',
  MONITOR_DEFENSE_PLAYERS: 'monitor_defense_players',
})

export const TEAM_LINE_ACTION = Object.freeze({
  BUILD_OFFENSIVE_DEPTH: 'BUILD_OFFENSIVE_DEPTH',
  STRENGTHEN_OFFENSIVE_QUALITY: 'STRENGTHEN_OFFENSIVE_QUALITY',
  IDENTIFY_OFFENSIVE_CORE: 'IDENTIFY_OFFENSIVE_CORE',
  MONITOR_OFFENSIVE_TRANSFER_OPPORTUNITY: 'MONITOR_OFFENSIVE_TRANSFER_OPPORTUNITY',
  BUILD_DEFENSIVE_DEPTH: 'BUILD_DEFENSIVE_DEPTH',
  STRENGTHEN_DEFENSIVE_QUALITY: 'STRENGTHEN_DEFENSIVE_QUALITY',
  IDENTIFY_DEFENSIVE_CORE: 'IDENTIFY_DEFENSIVE_CORE',
  MONITOR_DEFENSIVE_TRANSFER_OPPORTUNITY: 'MONITOR_DEFENSIVE_TRANSFER_OPPORTUNITY',
})

const REVIEW_TASK_BY_FINDING = Object.freeze({
  [TEAM_INTERPRETATION_FINDING.DEFENSE_CONCENTRATION]: TEAM_INTERPRETATION_REVIEW_TASK.MONITOR_DEFENSE_CORE,
  [TEAM_INTERPRETATION_FINDING.DEFENSE_DEPTH_REVIEW]: TEAM_INTERPRETATION_REVIEW_TASK.SOURCE_QUALITY_DEFENDERS,
  [TEAM_INTERPRETATION_FINDING.DEFENSE_POSSIBLE_GAP]: TEAM_INTERPRETATION_REVIEW_TASK.SOURCE_QUALITY_DEFENDERS,
  [TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_REVIEW]: TEAM_INTERPRETATION_REVIEW_TASK.SOURCE_QUALITY_DEFENDERS,
  [TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_SEARCH]: TEAM_INTERPRETATION_REVIEW_TASK.MONITOR_DEFENSE_PLAYERS,
  [TEAM_INTERPRETATION_FINDING.DEFENSE_LOW_QUALITY_OVERLOAD]: TEAM_INTERPRETATION_REVIEW_TASK.SOURCE_QUALITY_DEFENDERS,
  [TEAM_INTERPRETATION_FINDING.DEFENSE_CLASSIFICATION_MISSING]: TEAM_INTERPRETATION_REVIEW_TASK.SOURCE_QUALITY_DEFENDERS,
})

const LINE_ACTIONS_BY_FINDING = Object.freeze({
  [TEAM_INTERPRETATION_FINDING.ATTACK_CONCENTRATION]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.BUILD_OFFENSIVE_DEPTH,
    marketOpportunity: TEAM_LINE_ACTION.IDENTIFY_OFFENSIVE_CORE,
  }),
  [TEAM_INTERPRETATION_FINDING.ATTACK_DEPTH_REVIEW]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.BUILD_OFFENSIVE_DEPTH,
    marketOpportunity: null,
  }),
  [TEAM_INTERPRETATION_FINDING.ATTACK_POSSIBLE_GAP]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.STRENGTHEN_OFFENSIVE_QUALITY,
    marketOpportunity: null,
  }),
  [TEAM_INTERPRETATION_FINDING.ATTACK_QUALITY_REVIEW]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.STRENGTHEN_OFFENSIVE_QUALITY,
    marketOpportunity: null,
  }),
  [TEAM_INTERPRETATION_FINDING.ATTACK_HIGH_COMPETITION]: Object.freeze({
    teamNeed: null,
    marketOpportunity: TEAM_LINE_ACTION.MONITOR_OFFENSIVE_TRANSFER_OPPORTUNITY,
  }),
  [TEAM_INTERPRETATION_FINDING.ATTACK_CLASSIFICATION_MISSING]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.STRENGTHEN_OFFENSIVE_QUALITY,
    marketOpportunity: null,
  }),
  [TEAM_INTERPRETATION_FINDING.DEFENSE_CONCENTRATION]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.BUILD_DEFENSIVE_DEPTH,
    marketOpportunity: TEAM_LINE_ACTION.IDENTIFY_DEFENSIVE_CORE,
  }),
  [TEAM_INTERPRETATION_FINDING.DEFENSE_DEPTH_REVIEW]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.BUILD_DEFENSIVE_DEPTH,
    marketOpportunity: null,
  }),
  [TEAM_INTERPRETATION_FINDING.DEFENSE_POSSIBLE_GAP]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.STRENGTHEN_DEFENSIVE_QUALITY,
    marketOpportunity: null,
  }),
  [TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_REVIEW]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.STRENGTHEN_DEFENSIVE_QUALITY,
    marketOpportunity: null,
  }),
  [TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_SEARCH]: Object.freeze({
    teamNeed: null,
    marketOpportunity: TEAM_LINE_ACTION.MONITOR_DEFENSIVE_TRANSFER_OPPORTUNITY,
  }),
  [TEAM_INTERPRETATION_FINDING.DEFENSE_LOW_QUALITY_OVERLOAD]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.STRENGTHEN_DEFENSIVE_QUALITY,
    marketOpportunity: null,
  }),
  [TEAM_INTERPRETATION_FINDING.DEFENSE_CLASSIFICATION_MISSING]: Object.freeze({
    teamNeed: TEAM_LINE_ACTION.STRENGTHEN_DEFENSIVE_QUALITY,
    marketOpportunity: null,
  }),
})

const INTEREST_FINDINGS = new Set([
  TEAM_INTERPRETATION_FINDING.ATTACK_CONCENTRATION,
  TEAM_INTERPRETATION_FINDING.ATTACK_HIGH_COMPETITION,
  TEAM_INTERPRETATION_FINDING.ATTACK_POSSIBLE_GAP,
  TEAM_INTERPRETATION_FINDING.ATTACK_CLASSIFICATION_MISSING,
  TEAM_INTERPRETATION_FINDING.DEFENSE_CONCENTRATION,
  TEAM_INTERPRETATION_FINDING.DEFENSE_DEPTH_REVIEW,
  TEAM_INTERPRETATION_FINDING.DEFENSE_POSSIBLE_GAP,
  TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_REVIEW,
  TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_SEARCH,
  TEAM_INTERPRETATION_FINDING.DEFENSE_LOW_QUALITY_OVERLOAD,
  TEAM_INTERPRETATION_FINDING.DEFENSE_CLASSIFICATION_MISSING,
])

export const TEAM_SQUAD_INTEREST_REASON = Object.freeze({
  LOW_CLASSIFICATION_COVERAGE: 'LOW_CLASSIFICATION_COVERAGE',
  HIGH_CLASSIFICATION_COVERAGE: 'HIGH_CLASSIFICATION_COVERAGE',
})

export const TEAM_SQUAD_ACTION = Object.freeze({
  BUILD_QUALITY_DEPTH: 'BUILD_QUALITY_DEPTH',
  STRENGTHEN_WEAK_SIDE_QUALITY: 'STRENGTHEN_WEAK_SIDE_QUALITY',
  STRENGTHEN_BOTH_SIDES_QUALITY: 'STRENGTHEN_BOTH_SIDES_QUALITY',
  IDENTIFY_KEY_QUALITY_PLAYERS: 'IDENTIFY_KEY_QUALITY_PLAYERS',
  IDENTIFY_QUALITY_PLAYERS_ON_STRONG_SIDE: 'IDENTIFY_QUALITY_PLAYERS_ON_STRONG_SIDE',
  MONITOR_TRANSFER_OPPORTUNITY: 'MONITOR_TRANSFER_OPPORTUNITY',
})

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const isTeamInterpretationFindingInteresting = finding => (
  INTEREST_FINDINGS.has(clean(finding))
)

export const getTeamInterpretationReviewTask = finding => (
  REVIEW_TASK_BY_FINDING[clean(finding)] || null
)

export const getTeamLineActions = finding => {
  const findingId = clean(finding)
  const source = LINE_ACTIONS_BY_FINDING[findingId] || {}
  const targetSide = findingId.startsWith('ATTACK_') ? 'offense' : 'defense'

  return {
    teamNeed: source.teamNeed ? { id: source.teamNeed, targetSides: [targetSide] } : null,
    marketOpportunity: source.marketOpportunity
      ? { id: source.marketOpportunity, targetSides: [targetSide] }
      : null,
  }
}

// Compact, presentation-agnostic task projection for league-level consumers.
// A side is actionable when either the team itself or the market has a task.
export const buildTeamTaskSignals = ({
  offenseFinding,
  defenseFinding,
} = {}) => {
  const hasTask = finding => {
    const actions = getTeamLineActions(finding)
    return Boolean(actions.teamNeed || actions.marketOpportunity)
  }

  return {
    offense: hasTask(offenseFinding),
    defense: hasTask(defenseFinding),
  }
}

const toNullableRate = value => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const resolvePerformanceBand = performanceLevel => {
  if ([
    TEAM_SCOUT_PRIORITY_LEVEL.POSITIVE,
    TEAM_SCOUT_PRIORITY_LEVEL.HIGH,
    TEAM_SCOUT_PRIORITY_LEVEL.ELITE,
  ].includes(performanceLevel)) {
    return TEAM_INTERPRETATION_PERFORMANCE_BAND.POSITIVE_OR_ABOVE
  }

  if (performanceLevel === TEAM_SCOUT_PRIORITY_LEVEL.NEUTRAL) {
    return TEAM_INTERPRETATION_PERFORMANCE_BAND.REGULAR
  }

  if (performanceLevel === TEAM_SCOUT_PRIORITY_LEVEL.LOW) {
    return TEAM_INTERPRETATION_PERFORMANCE_BAND.LOW
  }

  return TEAM_INTERPRETATION_PERFORMANCE_BAND.UNAVAILABLE
}

const resolveSquadPerformanceState = ({ offenseBand, defenseBand } = {}) => {
  const offense = clean(offenseBand)
  const defense = clean(defenseBand)
  const isPositive = value => value === TEAM_INTERPRETATION_PERFORMANCE_BAND.POSITIVE_OR_ABOVE
  const isLow = value => value === TEAM_INTERPRETATION_PERFORMANCE_BAND.LOW

  if (isPositive(offense) && isPositive(defense)) return 'two_positive'
  if (isLow(offense) && isLow(defense)) return 'two_low'
  if ((isPositive(offense) && isLow(defense)) || (isLow(offense) && isPositive(defense))) return 'positive_and_low'

  return null
}

const resolveSideByBand = ({ offenseBand, defenseBand, band } = {}) => {
  if (clean(offenseBand) === band) return 'offense'
  if (clean(defenseBand) === band) return 'defense'
  return null
}

const createSquadAction = (id, targetSides = []) => ({ id, targetSides })

const buildSquadActions = ({
  reason,
  performanceState,
  offenseBand,
  defenseBand,
} = {}) => {
  const coverageReason = clean(reason)
  const state = clean(performanceState)
  const strongSide = resolveSideByBand({
    offenseBand,
    defenseBand,
    band: TEAM_INTERPRETATION_PERFORMANCE_BAND.POSITIVE_OR_ABOVE,
  })
  const weakSide = resolveSideByBand({
    offenseBand,
    defenseBand,
    band: TEAM_INTERPRETATION_PERFORMANCE_BAND.LOW,
  })
  const bothSides = ['offense', 'defense']

  if (coverageReason === TEAM_SQUAD_INTEREST_REASON.LOW_CLASSIFICATION_COVERAGE) {
    if (state === 'two_positive') return {
      teamNeed: createSquadAction(TEAM_SQUAD_ACTION.BUILD_QUALITY_DEPTH, bothSides),
      marketOpportunity: createSquadAction(TEAM_SQUAD_ACTION.IDENTIFY_KEY_QUALITY_PLAYERS, bothSides),
    }
    if (state === 'positive_and_low') return {
      teamNeed: createSquadAction(TEAM_SQUAD_ACTION.STRENGTHEN_WEAK_SIDE_QUALITY, [weakSide].filter(Boolean)),
      marketOpportunity: createSquadAction(TEAM_SQUAD_ACTION.IDENTIFY_QUALITY_PLAYERS_ON_STRONG_SIDE, [strongSide].filter(Boolean)),
    }
    if (state === 'two_low') return {
      teamNeed: createSquadAction(TEAM_SQUAD_ACTION.STRENGTHEN_BOTH_SIDES_QUALITY, bothSides),
      marketOpportunity: null,
    }
  }

  if (coverageReason === TEAM_SQUAD_INTEREST_REASON.HIGH_CLASSIFICATION_COVERAGE) {
    if (state === 'two_positive') return {
      teamNeed: null,
      marketOpportunity: createSquadAction(TEAM_SQUAD_ACTION.MONITOR_TRANSFER_OPPORTUNITY, bothSides),
    }
    if (state === 'positive_and_low') return {
      teamNeed: createSquadAction(TEAM_SQUAD_ACTION.STRENGTHEN_WEAK_SIDE_QUALITY, [weakSide].filter(Boolean)),
      marketOpportunity: createSquadAction(TEAM_SQUAD_ACTION.IDENTIFY_QUALITY_PLAYERS_ON_STRONG_SIDE, [strongSide].filter(Boolean)),
    }
    if (state === 'two_low') return {
      teamNeed: createSquadAction(TEAM_SQUAD_ACTION.STRENGTHEN_BOTH_SIDES_QUALITY, bothSides),
      marketOpportunity: null,
    }
  }

  return { teamNeed: null, marketOpportunity: null }
}

export const getTeamSquadActions = input => buildSquadActions(input)

const ATTACK_MATRIX = Object.freeze({
  positive_or_above: Object.freeze({
    below_reference: TEAM_INTERPRETATION_FINDING.ATTACK_CONCENTRATION,
    at_reference: TEAM_INTERPRETATION_FINDING.ATTACK_ESTABLISHED,
    above_reference: TEAM_INTERPRETATION_FINDING.ATTACK_HIGH_COMPETITION,
  }),
  regular: Object.freeze({
    below_reference: TEAM_INTERPRETATION_FINDING.ATTACK_DEPTH_REVIEW,
    at_reference: TEAM_INTERPRETATION_FINDING.NO_CLEAR_FINDING,
    above_reference: TEAM_INTERPRETATION_FINDING.REVIEW_REQUIRED,
  }),
  low: Object.freeze({
    below_reference: TEAM_INTERPRETATION_FINDING.ATTACK_POSSIBLE_GAP,
    at_reference: TEAM_INTERPRETATION_FINDING.ATTACK_QUALITY_REVIEW,
    above_reference: TEAM_INTERPRETATION_FINDING.REVIEW_REQUIRED,
  }),
})

const DEFENSE_MATRIX = Object.freeze({
  positive_or_above: Object.freeze({
    below_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_CONCENTRATION,
    at_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_ESTABLISHED,
    above_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_SEARCH,
  }),
  regular: Object.freeze({
    below_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_DEPTH_REVIEW,
    at_reference: TEAM_INTERPRETATION_FINDING.NO_CLEAR_FINDING,
    above_reference: TEAM_INTERPRETATION_FINDING.REVIEW_REQUIRED,
  }),
  low: Object.freeze({
    below_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_POSSIBLE_GAP,
    at_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_REVIEW,
    above_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_LOW_QUALITY_OVERLOAD,
  }),
})

const buildSideInterpretation = ({ side, performance, benchmarkMetric, matrix } = {}) => {
  const source = performance && typeof performance === 'object' ? performance : {}
  const metric = benchmarkMetric && typeof benchmarkMetric === 'object'
    ? benchmarkMetric
    : {}
  const performanceLevel = clean(source.priorityLevel) || TEAM_SCOUT_PRIORITY_LEVEL.UNAVAILABLE
  const performanceBand = resolvePerformanceBand(performanceLevel)
  const benchmarkState = clean(metric.state) || 'unavailable'
  const hasNoClassifiedPlayers = benchmarkState !== 'unavailable' && Number(metric.actual) === 0
  const matrixFinding = performanceBand === TEAM_INTERPRETATION_PERFORMANCE_BAND.UNAVAILABLE ||
    benchmarkState === 'unavailable'
    ? null
    : matrix[performanceBand]?.[benchmarkState] || null
  const finding = hasNoClassifiedPlayers
    ? side === 'offense'
      ? TEAM_INTERPRETATION_FINDING.ATTACK_CLASSIFICATION_MISSING
      : TEAM_INTERPRETATION_FINDING.DEFENSE_CLASSIFICATION_MISSING
    : matrixFinding
  const actionFinding = matrixFinding || finding

  return {
    side,
    performanceLevel,
    performanceBand,
    benchmarkState,
    finding,
    matrixFinding,
    reviewTask: getTeamInterpretationReviewTask(finding),
    actions: getTeamLineActions(actionFinding),
    targetRate: toNullableRate(source.targetRate),
    qualityRate: toNullableRate(source.qualityRate),
    rankingRate: toNullableRate(source.rankingRate),
  }
}

export const buildTeamLinePerformanceInterpretation = ({
  offense,
  defense,
  lineupBenchmark,
  classificationCoverageBenchmark,
  lineClassificationCoverage,
} = {}) => {
  const benchmark = lineupBenchmark && typeof lineupBenchmark === 'object'
    ? lineupBenchmark
    : {}
  const coverage = lineClassificationCoverage && typeof lineClassificationCoverage === 'object'
    ? lineClassificationCoverage
    : {}
  const attack = buildSideInterpretation({
    side: 'offense',
    performance: offense,
    benchmarkMetric: benchmark.metrics?.attack,
    matrix: ATTACK_MATRIX,
  })
  const defenseInterpretation = buildSideInterpretation({
    side: 'defense',
    performance: defense,
    benchmarkMetric: benchmark.metrics?.defense,
    matrix: DEFENSE_MATRIX,
  })
  const coverageBenchmark = classificationCoverageBenchmark &&
    typeof classificationCoverageBenchmark === 'object'
    ? classificationCoverageBenchmark
    : {}
  const coverageState = clean(coverageBenchmark.state)
  const squadReason = coverageState === 'below_typical'
    ? TEAM_SQUAD_INTEREST_REASON.LOW_CLASSIFICATION_COVERAGE
    : coverageState === 'above_typical'
      ? TEAM_SQUAD_INTEREST_REASON.HIGH_CLASSIFICATION_COVERAGE
      : null
  const offenseInterest = isTeamInterpretationFindingInteresting(attack.finding)
  const defenseInterest = isTeamInterpretationFindingInteresting(defenseInterpretation.finding)
  const squadPerformanceState = resolveSquadPerformanceState({
    offenseBand: attack.performanceBand,
    defenseBand: defenseInterpretation.performanceBand,
  })
  const squadInterest = Boolean(squadReason && squadPerformanceState)
  const squadActions = buildSquadActions({
    reason: squadInterest ? squadReason : null,
    performanceState: squadPerformanceState,
    offenseBand: attack.performanceBand,
    defenseBand: defenseInterpretation.performanceBand,
  })

  return {
    modelVersion: 'team-scout-interpretation-v5',
    availability: clean(benchmark.availability) || 'unavailable',
    availabilityReason: clean(benchmark.availabilityReason) ||
      clean(coverageBenchmark.availabilityReason) ||
      null,
    classificationCoverage: {
      playersRate: toNullableRate(coverage.playersRate),
      minutesRate: toNullableRate(coverage.minutesRate),
    },
    offense: attack,
    defense: defenseInterpretation,
    teamInterest: {
      isInteresting: offenseInterest || defenseInterest || squadInterest,
      lines: {
        offense: {
          isInteresting: offenseInterest,
          reason: offenseInterest ? attack.finding : null,
          finding: attack.finding,
          reviewTask: attack.reviewTask,
        },
        defense: {
          isInteresting: defenseInterest,
          reason: defenseInterest ? defenseInterpretation.finding : null,
          finding: defenseInterpretation.finding,
          reviewTask: defenseInterpretation.reviewTask,
        },
      },
      squad: {
        isInteresting: squadInterest,
        reason: squadInterest ? squadReason : null,
        performanceState: squadInterest ? squadPerformanceState : null,
        actions: squadActions,
      },
    },
  }
}
