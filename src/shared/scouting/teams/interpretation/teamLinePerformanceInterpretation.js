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
  DEFENSE_CONCENTRATION: 'DEFENSE_CONCENTRATION',
  DEFENSE_ESTABLISHED: 'DEFENSE_ESTABLISHED',
  DEFENSE_DEPTH_REVIEW: 'DEFENSE_DEPTH_REVIEW',
  DEFENSE_POSSIBLE_GAP: 'DEFENSE_POSSIBLE_GAP',
  DEFENSE_QUALITY_REVIEW: 'DEFENSE_QUALITY_REVIEW',
  NO_CLEAR_FINDING: 'NO_CLEAR_FINDING',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
})

const INTEREST_FINDINGS = new Set([
  TEAM_INTERPRETATION_FINDING.ATTACK_CONCENTRATION,
  TEAM_INTERPRETATION_FINDING.ATTACK_HIGH_COMPETITION,
  TEAM_INTERPRETATION_FINDING.ATTACK_POSSIBLE_GAP,
  TEAM_INTERPRETATION_FINDING.DEFENSE_CONCENTRATION,
  TEAM_INTERPRETATION_FINDING.DEFENSE_POSSIBLE_GAP,
])

export const TEAM_SQUAD_INTEREST_REASON = Object.freeze({
  LOW_CLASSIFICATION_COVERAGE: 'LOW_CLASSIFICATION_COVERAGE',
  HIGH_CLASSIFICATION_COVERAGE: 'HIGH_CLASSIFICATION_COVERAGE',
})

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

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
    above_reference: TEAM_INTERPRETATION_FINDING.REVIEW_REQUIRED,
  }),
  regular: Object.freeze({
    below_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_DEPTH_REVIEW,
    at_reference: TEAM_INTERPRETATION_FINDING.NO_CLEAR_FINDING,
    above_reference: TEAM_INTERPRETATION_FINDING.REVIEW_REQUIRED,
  }),
  low: Object.freeze({
    below_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_POSSIBLE_GAP,
    at_reference: TEAM_INTERPRETATION_FINDING.DEFENSE_QUALITY_REVIEW,
    above_reference: TEAM_INTERPRETATION_FINDING.REVIEW_REQUIRED,
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
  const finding = performanceBand === TEAM_INTERPRETATION_PERFORMANCE_BAND.UNAVAILABLE ||
    benchmarkState === 'unavailable'
    ? null
    : matrix[performanceBand]?.[benchmarkState] || null

  return {
    side,
    performanceLevel,
    performanceBand,
    benchmarkState,
    finding,
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
  const offenseInterest = INTEREST_FINDINGS.has(attack.finding)
  const defenseInterest = INTEREST_FINDINGS.has(defenseInterpretation.finding)
  const approvedSquadPerformanceBand = [
    TEAM_INTERPRETATION_PERFORMANCE_BAND.POSITIVE_OR_ABOVE,
    TEAM_INTERPRETATION_PERFORMANCE_BAND.LOW,
  ].includes(attack.performanceBand) &&
    attack.performanceBand === defenseInterpretation.performanceBand
  const squadInterest = Boolean(squadReason && approvedSquadPerformanceBand)

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
        },
        defense: {
          isInteresting: defenseInterest,
          reason: defenseInterest ? defenseInterpretation.finding : null,
        },
      },
      squad: {
        isInteresting: squadInterest,
        reason: squadInterest ? squadReason : null,
      },
    },
  }
}
