// src/features/squadSimulator/engine/simulator.summary.js

import {
  PLAYER_GOAL_TIERS,
} from '../../../shared/players/targets/index.js'
import {
  SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS,
  SQUAD_TARGET_GOAL_TIER_ORDER,
  SQUAD_TARGET_STATUS_LABELS,
} from './simulator.constants.js'
import {
  roundNumber,
  toFiniteNumber,
} from './simulator.normalize.js'

const TEAM_SCORER_TO_PLAYER_TIER = {
  scorer: 'scorer',
  doubleDigitScorer: 'doubleDigitScorer',
  supportScorer: 'supportScorer',
  occasionalScorer: 'occasionalScorer',
  none: 'none',
}

const getDistributionTarget = (distribution, tierId) => {
  const teamKey = Object.entries(TEAM_SCORER_TO_PLAYER_TIER).find(
    ([, playerTier]) => playerTier === tierId
  )?.[0]

  const value =
    distribution?.[tierId]?.target ??
    distribution?.[teamKey]?.target ??
    distribution?.[tierId] ??
    distribution?.[teamKey] ??
    0

  return toFiniteNumber(value, 0)
}

const compareCountToTarget = (actual, target) => {
  if (actual > target) return 'above'
  if (actual < target) return 'below'
  return 'ok'
}

export const buildGoalTierSummary = ({
  rows = [],
  teamBenchmark,
} = {}) => {
  const distribution = teamBenchmark?.scorersDistribution || null

  return SQUAD_TARGET_GOAL_TIER_ORDER.map((tierId) => {
    const tier = PLAYER_GOAL_TIERS[tierId] || PLAYER_GOAL_TIERS.none
    const tierRows = rows.filter((row) => row.goalTier === tierId)
    const actualCount = tierRows.length
    const targetCount = getDistributionTarget(distribution, tierId)
    const status = compareCountToTarget(actualCount, targetCount)

    return {
      id: tierId,
      label: tier.label,
      excelLabel: SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS[tierId],
      targetCount,
      actualCount,
      status,
      statusLabel: SQUAD_TARGET_STATUS_LABELS[status],
      goalsTargetTotal: tierRows.reduce(
        (sum, row) => sum + toFiniteNumber(row.goalsTarget, 0),
        0
      ),
      guaranteedGoalsTargetTotal: tierRows.reduce(
        (sum, row) => sum + toFiniteNumber(row.guaranteedGoalsTarget, 0),
        0
      ),
      playerIds: tierRows.map((row) => row.id).filter(Boolean),
    }
  })
}

export const buildSquadTargetTotals = ({
  rows = [],
  teamBenchmark,
} = {}) => {
  const teamGoalsTarget = toFiniteNumber(teamBenchmark?.goalsFor, 0)
  const playerGoalsTotal = rows.reduce(
    (sum, row) => sum + toFiniteNumber(row.goalsTarget, 0),
    0
  )
  const guaranteedGoalsTotal = rows.reduce(
    (sum, row) => sum + toFiniteNumber(row.guaranteedGoalsTarget, 0),
    0
  )
  const gap = playerGoalsTotal - teamGoalsTarget
  const guaranteedGap = guaranteedGoalsTotal - teamGoalsTarget
  const riskGoalsGap = playerGoalsTotal - guaranteedGoalsTotal
  const coveragePct = teamGoalsTarget
    ? roundNumber((playerGoalsTotal / teamGoalsTarget) * 100, 0)
    : 0
  const guaranteedCoveragePct = teamGoalsTarget
    ? roundNumber((guaranteedGoalsTotal / teamGoalsTarget) * 100, 0)
    : 0
  const confidenceScorePct = playerGoalsTotal
    ? roundNumber((guaranteedGoalsTotal / playerGoalsTotal) * 100, 0)
    : 0
  const confidenceRatedRows = rows.filter((row) => row.confidenceRated).length
  const targetRows = rows.filter((row) => toFiniteNumber(row.goalsTarget, 0) > 0).length

  return {
    teamGoalsTarget,
    playerGoalsTotal,
    guaranteedGoalsTotal,
    gap,
    guaranteedGap,
    riskGoalsGap,
    coveragePct,
    guaranteedCoveragePct,
    confidenceScorePct,
    confidenceRatedRows,
    targetRows,
    status:
      gap > 0 ? 'above' : gap < 0 ? 'below' : teamGoalsTarget ? 'ok' : 'missing',
    guaranteedStatus:
      guaranteedGap > 0 ? 'above' : guaranteedGap < 0 ? 'below' : teamGoalsTarget ? 'ok' : 'missing',
  }
}

export const buildRoleSummary = (rows = []) => {
  return rows.reduce((acc, row) => {
    const key = row.squadRole || 'missing'
    acc[key] = acc[key] || {
      id: key,
      count: 0,
      goalsTargetTotal: 0,
      minutesTargetTotal: 0,
    }

    acc[key].count += 1
    acc[key].goalsTargetTotal += toFiniteNumber(row.goalsTarget, 0)
    acc[key].guaranteedGoalsTargetTotal =
      (acc[key].guaranteedGoalsTargetTotal || 0) +
      toFiniteNumber(row.guaranteedGoalsTarget, 0)
    acc[key].minutesTargetTotal += toFiniteNumber(row.minutesTarget, 0)
    return acc
  }, {})
}
