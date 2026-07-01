// src/features/squadSimulator/engine/simulator.playerTargets.js

import { buildPlayerTargetProfile } from '../../../shared/players/targets/index.js'
import { SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS } from './simulator.constants.js'

const pickPlayerName = player => {
  return (
    player?.fullName ||
    player?.displayName ||
    player?.name ||
    [player?.firstName, player?.lastName].filter(Boolean).join(' ') ||
    ''
  )
}

const buildSimulatorPlayerRow = ({ player, profile }) => {
  const goalTier = profile?.goalTier || 'none'

  return {
    id: player?.id || player?.uid || player?.playerId || null,
    player,
    name: pickPlayerName(player),

    squadRole: profile?.squadRole || '',
    confidenceLevel: profile?.confidenceLevel || '',
    confidenceLabel: profile?.confidenceLabel || 'לא דורג',
    confidenceMultiplier: profile?.confidenceMultiplier || 1,
    confidenceRated: profile?.confidenceRated === true,

    primaryPosition: profile?.primaryPosition || '',
    positionGroup: profile?.positionGroup || '',
    positionGroupLabel: profile?.positionGroupLabel || '',
    layerKey: profile?.layerKey || '',

    goalTier,
    goalTierLabel: profile?.goalTierLabel || '',
    excelGoalTierLabel:
      SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS[goalTier] ||
      SQUAD_TARGET_GOAL_TIER_EXCEL_LABELS.none,

    goalsTarget: profile?.goalsTarget || 0,
    guaranteedGoalsTarget: profile?.guaranteedGoalsTarget || 0,
    riskGoalsGap: profile?.riskGoalsGap || 0,
    goalsRange: profile?.goalsRange || [0, 0],
    goalsPerGameTarget: profile?.goalsPerGameTarget || 0,

    assistsTarget: profile?.assistsTarget || 0,
    guaranteedAssistsTarget: profile?.guaranteedAssistsTarget || 0,
    riskAssistsGap: profile?.riskAssistsGap || 0,
    assistsRange: profile?.assistsRange || [0, 0],
    assistsPerGameTarget: profile?.assistsPerGameTarget || 0,

    goalContributionsTarget: profile?.goalContributionsTarget || 0,
    guaranteedGoalContributionsTarget: profile?.guaranteedGoalContributionsTarget || 0,
    riskGoalContributionsGap: profile?.riskGoalContributionsGap || 0,
    goalContributionsRange: profile?.goalContributionsRange || [0, 0],
    goalContributionsPerGameTarget: profile?.goalContributionsPerGameTarget || 0,

    minutesTarget: profile?.minutesTarget || 0,
    minutesRange: profile?.minutesRange || [0, 0],
    minutesPctTarget: profile?.minutesPctTarget || 0,
    minutesPctRange: profile?.minutesPctRange || [0, 0],

    startsTarget: profile?.startsTarget || 0,
    startsRange: profile?.startsRange || [0, 0],
    startsPctTarget: profile?.startsPctTarget || 0,
    startsPctRange: profile?.startsPctRange || [0, 0],

    defense: profile?.defense || null,
    hasBenchmark: profile?.hasBenchmark === true,
    benchmark: profile?.benchmark || null,
    targetProfile: profile,
  }
}

export const buildSquadTargetPlayerRow = ({
  player = {},
  team = {},
  targetPositionProfile,
  leagueNumGames,
  leagueGameTime,
} = {}) => {
  const profile = buildPlayerTargetProfile({
    player,
    team,
    targetPositionProfile,
    leagueNumGames,
    leagueGameTime,
  })

  return buildSimulatorPlayerRow({
    player,
    profile,
  })
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
