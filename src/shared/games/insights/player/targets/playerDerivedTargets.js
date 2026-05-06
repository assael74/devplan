// shared/games/insights/player/targets/playerDerivedTargets.js

import { resolveTeamTargetProfileFromTeam } from '../../team/targets/index.js'

import {
  getPlayerRoleTarget,
} from './playerRoleTargets.js'

import {
  getPlayerPositionTarget,
} from './playerPositionTargets.js'

import {
  resolvePlayerPosition,
  resolvePlayerRole,
} from '../common/index.js'

function resolvePlayerManualTargets(player = {}) {
  return (
    player?.targets ||
    player?.playerTargets ||
    player?.gamesTargets ||
    {}
  )
}

function resolveTeamForecastTargets(team = {}) {
  const resolved = resolveTeamTargetProfileFromTeam(team)
  const targetProfile = resolved?.targetProfile || null

  return {
    targetPosition: resolved?.targetPosition || null,
    targetProfile,
    targetProfileId: targetProfile?.id || null,
    forecastTargets: targetProfile?.targets?.forecast || null,
    scorersTargets: targetProfile?.targets?.scorers || null,
    squadUsageTargets: targetProfile?.targets?.squadUsage || null,
    difficultyTargets: targetProfile?.targets?.difficulty || null,
  }
}

function buildPersonalAttackTargetShare({
  manualTargets,
  teamGoalsFor,
}) {
  const goalsTarget = Number(manualTargets?.goalsTarget || manualTargets?.goals || 0)
  const assistsTarget = Number(manualTargets?.assistsTarget || manualTargets?.assists || 0)

  const goalContributionsTarget = goalsTarget + assistsTarget

  const teamGoals = Number(teamGoalsFor || 0)
  const teamGoalsShareTargetPct =
    teamGoals > 0
      ? Math.round((goalContributionsTarget / teamGoals) * 100)
      : 0

  return {
    goalsTarget,
    assistsTarget,
    goalContributionsTarget,
    teamGoalsShareTargetPct,
  }
}

export function buildPlayerDerivedTargets({
  player,
  team,
} = {}) {
  const role = resolvePlayerRole(player)
  const position = resolvePlayerPosition(player)

  const roleTarget = getPlayerRoleTarget(role.id)
  const positionTarget = getPlayerPositionTarget(position.layerKey)

  const manualTargets = resolvePlayerManualTargets(player)
  const teamTargets = resolveTeamForecastTargets(team || player?.team || {})

  const attackTargetShare = buildPersonalAttackTargetShare({
    manualTargets,
    teamGoalsFor: teamTargets?.forecastTargets?.goalsFor,
  })

  const goalsAgainstTarget = teamTargets?.forecastTargets?.goalsAgainst
  const teamGamesTarget = team?.leagueNumGames || player?.team?.leagueNumGames

  const goalsAgainstPerGameTarget =
    Number(teamGamesTarget) > 0
      ? Number((Number(goalsAgainstTarget || 0) / Number(teamGamesTarget)).toFixed(2))
      : 0

  return {
    role,
    position,

    roleTarget,
    positionTarget,

    manualTargets,
    teamTargets,

    attack: attackTargetShare,

    defense: {
      goalsAgainstTarget: goalsAgainstTarget || 0,
      goalsAgainstPerGameTarget,
    },

    meta: {
      hasRoleTarget: Boolean(roleTarget),
      hasPositionTarget: Boolean(positionTarget),
      hasTeamTargetProfile: Boolean(teamTargets?.targetProfileId),
      hasManualTargets: Object.keys(manualTargets || {}).length > 0,
    },
  }
}
