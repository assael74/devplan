// src/features/squadSimulator/engine/simulator.playerTargets.js

import {
  buildPlayerTargetBenchmark,
  PLAYER_GOAL_TIERS,
} from '../../../shared/players/targets/index.js'
import {
  SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS,
} from './simulator.constants.js'
import {
  getConfidenceLabel,
  getConfidenceMultiplier,
  resolveConfidenceLevel,
} from './simulator.confidence.js'
import {
  getPositionGroupLabel,
  roundNumber,
  normalizeSquadRoleId,
} from './simulator.normalize.js'

const pickPlayerName = (player = {}) => {
  return (
    player.fullName ||
    player.displayName ||
    player.name ||
    [player.firstName, player.lastName].filter(Boolean).join(' ') ||
    ''
  )
}

const resolvePrimaryPositionCode = (player = {}) => {
  if (player.primaryPosition) return player.primaryPosition
  if (player.position) return player.position
  if (Array.isArray(player.positions)) return player.positions[0] || ''
  if (typeof player.positions === 'string') return player.positions
  return ''
}

export const buildSquadTargetPlayerRow = ({
  player = {},
  team = {},
  targetPositionProfile,
  leagueNumGames,
  leagueGameTime,
} = {}) => {
  const squadRole = normalizeSquadRoleId(
    player.squadRole || player.role || player.playerRole
  )
  const primaryPosition = resolvePrimaryPositionCode(player)
  const confidenceLevel = player.confidenceLevel || ''
  const confidence = resolveConfidenceLevel(confidenceLevel)
  const confidenceMultiplier = getConfidenceMultiplier(confidenceLevel)
  const confidenceLabel = getConfidenceLabel(confidenceLevel)

  if (!squadRole) {
    const goalTierId = PLAYER_GOAL_TIERS.none.id

    return {
      id: player.id || player.uid || player.playerId || null,
      player,
      name: pickPlayerName(player),

      squadRole,
      confidenceLevel,
      confidenceLabel,
      confidenceMultiplier,
      confidenceRated: Boolean(confidence),
      primaryPosition,
      positionGroup: '',
      positionGroupLabel: '',
      layerKey: '',

      goalTier: goalTierId,
      goalTierLabel: PLAYER_GOAL_TIERS.none.label,
      excelGoalTierLabel:
        SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS[goalTierId] ||
        SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS.none,

      goalsTarget: 0,
      guaranteedGoalsTarget: 0,
      riskGoalsGap: 0,
      goalsRange: [0, 0],
      goalsPerGameTarget: 0,

      assistsTarget: 0,
      guaranteedAssistsTarget: 0,
      riskAssistsGap: 0,
      assistsRange: [0, 0],
      assistsPerGameTarget: 0,

      goalContributionsTarget: 0,
      guaranteedGoalContributionsTarget: 0,
      riskGoalContributionsGap: 0,
      goalContributionsRange: [0, 0],
      goalContributionsPerGameTarget: 0,

      minutesTarget: 0,
      minutesRange: [0, 0],
      minutesPctTarget: 0,
      minutesPctRange: [0, 0],
      startsTarget: 0,
      startsRange: [0, 0],
      startsPctTarget: 0,
      startsPctRange: [0, 0],

      defense: null,
      hasBenchmark: false,
      benchmark: null,
    }
  }

  const benchmark = buildPlayerTargetBenchmark({
    player,
    team,
    targetPositionProfile,
    squadRole,
    positionCode: primaryPosition,
    leagueNumGames,
    leagueGameTime,
  })

  const goalTierId = benchmark?.goals?.tier || PLAYER_GOAL_TIERS.none.id
  const goalsTarget = benchmark?.goals?.target || 0
  const assistsTarget = benchmark?.assists?.target || 0
  const goalContributionsTarget = benchmark?.goalContributions?.target || 0
  const guaranteedGoalsTarget = roundNumber(goalsTarget * confidenceMultiplier, 1)
  const guaranteedAssistsTarget = roundNumber(assistsTarget * confidenceMultiplier, 1)
  const guaranteedGoalContributionsTarget = roundNumber(
    goalContributionsTarget * confidenceMultiplier,
    1
  )

  return {
    id: player.id || player.uid || player.playerId || null,
    player,
    name: pickPlayerName(player),

    squadRole,
    confidenceLevel,
    confidenceLabel,
    confidenceMultiplier,
    confidenceRated: Boolean(confidence),
    primaryPosition,
    positionGroup: benchmark?.positionGroup || '',
    positionGroupLabel:
      benchmark?.positionGroupLabel ||
      getPositionGroupLabel(benchmark?.positionGroup),
    layerKey: benchmark?.layerKey || '',

    goalTier: goalTierId,
    goalTierLabel: benchmark?.goals?.label || PLAYER_GOAL_TIERS.none.label,
    excelGoalTierLabel:
      SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS[goalTierId] ||
      SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS.none,

    goalsTarget,
    guaranteedGoalsTarget,
    riskGoalsGap: roundNumber(goalsTarget - guaranteedGoalsTarget, 1),
    goalsRange: benchmark?.goals?.range || [0, 0],
    goalsPerGameTarget: benchmark?.goals?.perGameTarget || 0,

    assistsTarget,
    guaranteedAssistsTarget,
    riskAssistsGap: roundNumber(assistsTarget - guaranteedAssistsTarget, 1),
    assistsRange: benchmark?.assists?.range || [0, 0],
    assistsPerGameTarget: benchmark?.assists?.perGameTarget || 0,

    goalContributionsTarget,
    guaranteedGoalContributionsTarget,
    riskGoalContributionsGap: roundNumber(
      goalContributionsTarget - guaranteedGoalContributionsTarget,
      1
    ),
    goalContributionsRange: benchmark?.goalContributions?.range || [0, 0],
    goalContributionsPerGameTarget:
      benchmark?.goalContributions?.perGameTarget || 0,

    minutesTarget: benchmark?.minutes?.minutes?.target || 0,
    minutesRange: benchmark?.minutes?.minutes?.range || [0, 0],
    minutesPctTarget: benchmark?.minutes?.minutesPct?.target || 0,
    minutesPctRange: benchmark?.minutes?.minutesPct?.range || [0, 0],
    startsTarget: benchmark?.minutes?.starts?.target || 0,
    startsRange: benchmark?.minutes?.starts?.range || [0, 0],
    startsPctTarget: benchmark?.minutes?.startsPct?.target || 0,
    startsPctRange: benchmark?.minutes?.startsPct?.range || [0, 0],

    defense: benchmark?.defense || null,
    hasBenchmark: Boolean(benchmark?.hasBenchmark),
    benchmark,
  }
}

export const buildSquadTargetPlayerRows = ({
  players = [],
  team = {},
  targetPositionProfile,
  leagueNumGames,
  leagueGameTime,
} = {}) => {
  return (Array.isArray(players) ? players : []).map((player, index) => ({
    rowNumber: index + 1,
    ...buildSquadTargetPlayerRow({
      player,
      team,
      targetPositionProfile,
      leagueNumGames,
      leagueGameTime,
    }),
  }))
}
