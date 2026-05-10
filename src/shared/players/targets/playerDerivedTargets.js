// src/shared/players/targets/playerDerivedTargets.js

//import { resolveTeamTargetProfileFromTeam } from '../../teams/targets/index.js'
import { resolveTeamTargetProfileFromTeam } from '../../teams/targets/index.js'

import {
  getPlayerRoleTarget,
} from './playerRoleTargets.js'

import {
  getPlayerPositionTarget,
} from './playerPositionTargets.js'

import {
  buildPlayerExplicitTargets,
} from './playerExplicitTargets.js'

import {
  resolvePlayerPosition,
  resolvePlayerRole,
} from './playerTarget.resolve.js'

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
  const goalsTarget = Number(
    manualTargets?.goalsTarget ||
      manualTargets?.goals ||
      0
  )

  const assistsTarget = Number(
    manualTargets?.assistsTarget ||
      manualTargets?.assists ||
      0
  )

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
  const activeTeam = team || player?.team || {}

  const role = resolvePlayerRole(player)
  const position = resolvePlayerPosition(player)

  const roleTarget = getPlayerRoleTarget(role.id)
  const positionTarget = getPlayerPositionTarget(position.layerKey)

  const manualTargets = resolvePlayerManualTargets(player)
  const teamTargets = resolveTeamForecastTargets(activeTeam)

  const explicitTargets = buildPlayerExplicitTargets({
    player,
    team: activeTeam,
    role,
    position,
    roleTarget,
    positionTarget,
    teamTargets,
  })

  const manualAttackTargetShare = buildPersonalAttackTargetShare({
    manualTargets,
    teamGoalsFor: teamTargets?.forecastTargets?.goalsFor,
  })

  const attackTargetShare =
    explicitTargets?.meta?.hasAttackTarget
      ? {
          goalsTarget: explicitTargets.attack.goalsTarget,
          assistsTarget: explicitTargets.attack.assistsTarget,
          goalContributionsTarget:
            explicitTargets.attack.goalContributionsTarget,
          teamGoalsShareTargetPct:
            explicitTargets.attack.contributionShareRange?.[0] || 0,

          explicit: explicitTargets.attack,
          manual: manualAttackTargetShare,
        }
      : manualAttackTargetShare

  const goalsAgainstTarget =
    explicitTargets?.defense?.teamGoalsAgainstTarget || 0

  const goalsAgainstPerGameTarget =
    explicitTargets?.defense?.goalsAgainstPerGameTarget || 0

  return {
    role,
    position,

    roleTarget,
    positionTarget,

    manualTargets,
    teamTargets,
    explicitTargets,

    attack: attackTargetShare,

    defense: {
      goalsAgainstTarget,
      goalsAgainstPerGameTarget,
      explicit: explicitTargets.defense,
    },

    meta: {
      hasRoleTarget: Boolean(roleTarget),
      hasPositionTarget: Boolean(positionTarget),
      hasTeamTargetProfile: Boolean(teamTargets?.targetProfileId),
      hasManualTargets: Object.keys(manualTargets || {}).length > 0,
      hasExplicitTargets:
        explicitTargets?.meta?.hasExplicitTarget === true,
      hasExplicitAttackTarget:
        explicitTargets?.meta?.hasAttackTarget === true,
      hasExplicitDefenseTarget:
        explicitTargets?.meta?.hasDefenseTarget === true,
    },
  }
}
