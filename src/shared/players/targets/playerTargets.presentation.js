// src/shared/players/targets/playerTargets.presentation.js

import { buildPlayerTargetBenchmark, PLAYER_GOAL_TIERS } from './playerTargets.benchmark.js'
import { getConfidenceLabel, getConfidenceMultiplier, resolveConfidenceLevel } from './playerTargets.confidence.js'
import { resolvePlayerPosition, resolvePlayerPrimaryPositionCode, resolvePlayerRole } from './playerTarget.resolve.js'
import { buildTeamTargetsState } from '../../teams/targets/index.js'

const roundNumber = (value, digits = 1) => {
  const n = Number(value)
  return Number.isFinite(n) ? Number(n.toFixed(digits)) : 0
}

const resolveConfidenceValue = player => {
  return player?.confidenceLevel || player?.coachConfidenceLevel || player?.targetConfidenceLevel || ''
}

const buildGuaranteedTarget = ({ target, multiplier }) => {
  return roundNumber(Number(target || 0) * Number(multiplier || 1), 1)
}

const buildRiskGap = ({ target, guaranteedTarget }) => {
  return roundNumber(Number(target || 0) - Number(guaranteedTarget || 0), 1)
}

const buildEmptyProfile = ({ player, squadRole, primaryPosition, position, confidenceLevel }) => {
  const confidence = resolveConfidenceLevel(confidenceLevel)
  const confidenceMultiplier = getConfidenceMultiplier(confidenceLevel)
  const goalTier = PLAYER_GOAL_TIERS.none

  return {
    hasBenchmark: false,
    squadRole,
    primaryPosition,
    positionGroup: '',
    positionGroupLabel: '',
    layerKey: position?.layerKey || '',

    goalTier: goalTier.id,
    goalTierLabel: goalTier.label,

    goalsTarget: 0,
    goalsRange: [0, 0],
    goalsPerGameTarget: 0,

    assistsTarget: 0,
    assistsRange: [0, 0],
    assistsPerGameTarget: 0,

    goalContributionsTarget: 0,
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

    confidenceLevel,
    confidenceLabel: getConfidenceLabel(confidenceLevel),
    confidenceMultiplier,
    confidenceRated: Boolean(confidence),

    guaranteedGoalsTarget: 0,
    guaranteedAssistsTarget: 0,
    guaranteedGoalContributionsTarget: 0,

    riskGoalsGap: 0,
    riskAssistsGap: 0,
    riskGoalContributionsGap: 0,

    defense: null,
    benchmark: null,
    player,
  }
}

export const buildPlayerTargetProfile = ({
  player = {},
  team = {},
  targetPositionProfile,
  squadRole,
  positionGroup,
  positionCode,
  leagueNumGames,
  leagueGameTime,
} = {}) => {
  const role = resolvePlayerRole({
    ...player,
    squadRole: squadRole || player?.squadRole,
  })

  const position = resolvePlayerPosition(player)
  const resolvedSquadRole = role?.id || ''
  const primaryPosition = positionCode || resolvePlayerPrimaryPositionCode(player)
  const confidenceLevel = resolveConfidenceValue(player)
  const teamTargetState = buildTeamTargetsState(team)
  const resolvedTargetPositionProfile =
    targetPositionProfile ||
    teamTargetState?.resolvedProfileId ||
    team?.targetPositionProfile ||
    team?.targetProfileId ||
    ''

  if (!resolvedSquadRole) {
    return buildEmptyProfile({
      player,
      squadRole: resolvedSquadRole,
      primaryPosition,
      position,
      confidenceLevel,
    })
  }

  const benchmark = buildPlayerTargetBenchmark({
    player,
    team,
    targetPositionProfile: resolvedTargetPositionProfile,
    squadRole: resolvedSquadRole,
    positionGroup,
    positionCode: primaryPosition,
    leagueNumGames,
    leagueGameTime,
  })

  const confidence = resolveConfidenceLevel(confidenceLevel)
  const confidenceMultiplier = getConfidenceMultiplier(confidenceLevel)

  const goalsTarget = Number(benchmark?.goals?.target || 0)
  const assistsTarget = Number(benchmark?.assists?.target || 0)
  const goalContributionsTarget = Number(benchmark?.goalContributions?.target || 0)

  const guaranteedGoalsTarget = buildGuaranteedTarget({ target: goalsTarget, multiplier: confidenceMultiplier })
  const guaranteedAssistsTarget = buildGuaranteedTarget({ target: assistsTarget, multiplier: confidenceMultiplier })
  const guaranteedGoalContributionsTarget = buildGuaranteedTarget({
    target: goalContributionsTarget,
    multiplier: confidenceMultiplier,
  })

  return {
    hasBenchmark: benchmark?.hasBenchmark === true,
    squadRole: resolvedSquadRole,
    primaryPosition,
    positionGroup: benchmark?.positionGroup || '',
    positionGroupLabel: benchmark?.positionGroupLabel || '',
    layerKey: benchmark?.layerKey || position?.layerKey || '',

    goalTier: benchmark?.goals?.tier || PLAYER_GOAL_TIERS.none.id,
    goalTierLabel: benchmark?.goals?.label || PLAYER_GOAL_TIERS.none.label,

    goalsTarget,
    goalsRange: benchmark?.goals?.range || [0, 0],
    goalsPerGameTarget: Number(benchmark?.goals?.perGameTarget || 0),

    assistsTarget,
    assistsRange: benchmark?.assists?.range || [0, 0],
    assistsPerGameTarget: Number(benchmark?.assists?.perGameTarget || 0),

    goalContributionsTarget,
    goalContributionsRange: benchmark?.goalContributions?.range || [0, 0],
    goalContributionsPerGameTarget: Number(benchmark?.goalContributions?.perGameTarget || 0),

    minutesTarget: Number(benchmark?.minutes?.minutes?.target || 0),
    minutesRange: benchmark?.minutes?.minutes?.range || [0, 0],
    minutesPctTarget: Number(benchmark?.minutes?.minutesPct?.target || 0),
    minutesPctRange: benchmark?.minutes?.minutesPct?.range || [0, 0],

    startsTarget: Number(benchmark?.minutes?.starts?.target || 0),
    startsRange: benchmark?.minutes?.starts?.range || [0, 0],
    startsPctTarget: Number(benchmark?.minutes?.startsPct?.target || 0),
    startsPctRange: benchmark?.minutes?.startsPct?.range || [0, 0],

    confidenceLevel,
    confidenceLabel: getConfidenceLabel(confidenceLevel),
    confidenceMultiplier,
    confidenceRated: Boolean(confidence),

    guaranteedGoalsTarget,
    guaranteedAssistsTarget,
    guaranteedGoalContributionsTarget,

    riskGoalsGap: buildRiskGap({ target: goalsTarget, guaranteedTarget: guaranteedGoalsTarget }),
    riskAssistsGap: buildRiskGap({ target: assistsTarget, guaranteedTarget: guaranteedAssistsTarget }),
    riskGoalContributionsGap: buildRiskGap({
      target: goalContributionsTarget,
      guaranteedTarget: guaranteedGoalContributionsTarget,
    }),

    defense: benchmark?.defense || null,
    benchmark,
    player,
  }
}

export const buildPlayerTargetPresentationRow = buildPlayerTargetProfile
