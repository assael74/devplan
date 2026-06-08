// src/shared/players/targets/playerDerivedTargets.js

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
  buildPlayerTargetBenchmark,
} from './playerTargets.benchmark.js'

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

const rangeObj = (range = []) => {
  if (!Array.isArray(range)) return { min: 0, max: 0 }

  return {
    min: range[0] === null || range[0] === undefined ? null : Number(range[0]),
    max: range[1] === null || range[1] === undefined ? null : Number(range[1]),
  }
}

const buildShareRange = ({
  range,
  total,
}) => {
  const base = Number(total || 0)

  if (!base || !Array.isArray(range)) return [0, 0]

  return range.map((value) => {
    return Math.round((Number(value || 0) / base) * 1000) / 10
  })
}

function buildBenchmarkExplicitTargets({
  benchmarkTargets,
  legacyExplicitTargets,
  role,
  position,
  roleTarget,
  positionTarget,
  teamTargets,
}) {
  if (!benchmarkTargets?.hasBenchmark) return null

  const forecastTargets = teamTargets?.forecastTargets || {}
  const teamGoalsForTarget = Number(forecastTargets?.goalsFor || 0)
  const teamGoalsAgainstTarget = Number(forecastTargets?.goalsAgainst || 0)

  const goals = benchmarkTargets.goals || {}
  const assists = benchmarkTargets.assists || {}
  const goalContributions = benchmarkTargets.goalContributions || {}
  const minutes = benchmarkTargets.minutes || {}
  const defenseBenchmark = benchmarkTargets.defense || {}

  const playerGoalsAgainstTargetRange = teamGoalsAgainstTarget
    ? {
        min: Math.round(
          teamGoalsAgainstTarget *
            (Number(
              defenseBenchmark.goalsAgainstResponsibilityPct?.range?.[0] || 0
            ) / 100)
        ),
        max: Math.round(
          teamGoalsAgainstTarget *
            (Number(
              defenseBenchmark.goalsAgainstResponsibilityPct?.range?.[1] || 0
            ) / 100)
        ),
      }
    : legacyExplicitTargets?.defense?.playerGoalsAgainstTargetRange || {
        min: 0,
        max: 0,
      }

  const playerGoalsAgainstTarget = Math.round(
    (Number(playerGoalsAgainstTargetRange.min || 0) +
      Number(playerGoalsAgainstTargetRange.max || 0)) / 2
  )

  return {
    roleId: role?.id || role?.value || '',
    roleLabel: role?.label || '',
    positionLayer: position?.layerKey || position?.id || '',
    positionLabel: position?.layerLabel || position?.label || '',
    targetPositionProfile: benchmarkTargets.targetPositionProfile || '',
    positionGroup: benchmarkTargets.positionGroup || '',
    positionGroupLabel: benchmarkTargets.positionGroupLabel || '',
    targetSource: 'benchmark',

    leagueNumGames: benchmarkTargets.leagueNumGames,
    leagueGameTime: benchmarkTargets.leagueGameTime,

    usage: {
      minutesRange: minutes.minutesPct?.range || roleTarget?.minutesRange || null,
      startsRange: minutes.startsPct?.range || roleTarget?.startsRange || null,
      minutesTarget: minutes.minutes?.target || 0,
      minutesTargetRange: rangeObj(minutes.minutes?.range),
      startsTarget: minutes.starts?.target || 0,
      startsTargetRange: rangeObj(minutes.starts?.range),
    },

    teamSeasonTargets: {
      ...(legacyExplicitTargets?.teamSeasonTargets || {}),
      goalsFor: teamGoalsForTarget,
      goalsAgainst: teamGoalsAgainstTarget,
      points: Number(forecastTargets?.points || 0),
      pointsRate: Number(forecastTargets?.pointsRate || 0),
      goalDifference: Number(forecastTargets?.goalDifference || 0),
    },

    attack: {
      hasAttackTarget: benchmarkTargets.positionGroup !== 'GK',

      contributionShareRange: buildShareRange({
        range: goalContributions.range,
        total: teamGoalsForTarget,
      }),
      goalsShareRange: buildShareRange({
        range: goals.range,
        total: teamGoalsForTarget,
      }),
      assistsShareRange: buildShareRange({
        range: assists.range,
        total: teamGoalsForTarget,
      }),

      goalTier: goals.tier || '',
      goalTierLabel: goals.label || '',

      goalContributionsTargetRange: rangeObj(goalContributions.range),
      goalsTargetRange: rangeObj(goals.range),
      assistsTargetRange: rangeObj(assists.range),

      goalContributionsTarget: Number(goalContributions.target || 0),
      goalsTarget: Number(goals.target || 0),
      assistsTarget: Number(assists.target || 0),

      contributionPerGameTarget:
        Number(goalContributions.perGameTarget || 0),
      goalsPerGameTarget: Number(goals.perGameTarget || 0),
      assistsPerGameTarget: Number(assists.perGameTarget || 0),
    },

    defense: {
      hasDefenseTarget: teamGoalsAgainstTarget > 0,
      isDefensivePosition: ['DM', 'DEF', 'GK'].includes(
        benchmarkTargets.positionGroup
      ),
      teamGoalsAgainstTarget,
      goalsAgainstPerGameTarget:
        legacyExplicitTargets?.defense?.goalsAgainstPerGameTarget || 0,
      goalsAgainstResponsibilityPct:
        defenseBenchmark.goalsAgainstResponsibilityPct || null,
      cleanSheetPct: defenseBenchmark.cleanSheetPct || null,
      playerGoalsAgainstTargetRange,
      playerGoalsAgainstTarget,
    },

    position: {
      contributionPerGameTarget:
        positionTarget?.contributionPerGame?.greenMin || null,
      goalsPerGameTarget:
        positionTarget?.goalsPerGame?.greenMin || null,
      assistsPerGameTarget:
        positionTarget?.assistsPerGame?.greenMin || null,
      teamGoalsSharePctTarget:
        positionTarget?.teamGoalsSharePct?.greenMin || null,
      cleanSheetPctTarget:
        defenseBenchmark.cleanSheetPct?.target ||
        positionTarget?.cleanSheetPct?.greenMin ||
        null,
    },

    meta: {
      hasExplicitTarget: true,
      hasAttackTarget: benchmarkTargets.positionGroup !== 'GK',
      hasDefenseTarget: teamGoalsAgainstTarget > 0,
      hasTeamGoalsForTarget: teamGoalsForTarget > 0,
      hasTeamGoalsAgainstTarget: teamGoalsAgainstTarget > 0,
      targetSource: 'benchmark',
      rollbackTargetSource: 'legacyExplicitTargets',
    },
  }
}

function shouldUseLegacyTargets({
  player,
  team,
} = {}) {
  return (
    player?.targetEngine === 'legacy' ||
    player?.targetsEngine === 'legacy' ||
    player?.useLegacyTargets === true ||
    team?.targetEngine === 'legacy' ||
    team?.targetsEngine === 'legacy' ||
    team?.useLegacyTargets === true
  )
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

  const legacyExplicitTargets = buildPlayerExplicitTargets({
    player,
    team: activeTeam,
    role,
    position,
    roleTarget,
    positionTarget,
    teamTargets,
  })

  const benchmarkTargets = buildPlayerTargetBenchmark({
    player,
    team: activeTeam,
    targetPositionProfile:
      activeTeam?.targetPositionProfile ||
      activeTeam?.targetProfileId ||
      teamTargets?.targetProfileId,
    squadRole: role?.id,
    leagueNumGames:
      activeTeam?.leagueNumGames ||
      player?.team?.leagueNumGames ||
      legacyExplicitTargets?.leagueNumGames,
    leagueGameTime:
      activeTeam?.leagueGameTime ||
      player?.team?.leagueGameTime,
  })

  const benchmarkExplicitTargets = buildBenchmarkExplicitTargets({
    benchmarkTargets,
    legacyExplicitTargets,
    role,
    position,
    roleTarget,
    positionTarget,
    teamTargets,
  })

  const useLegacyTargets = shouldUseLegacyTargets({
    player,
    team: activeTeam,
  })

  const explicitTargets =
    useLegacyTargets
      ? legacyExplicitTargets
      : benchmarkExplicitTargets

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
    benchmarkTargets,
    legacyExplicitTargets,
    explicitTargets,

    attack: attackTargetShare,

    defense: {
      goalsAgainstTarget,
      goalsAgainstPerGameTarget,
      explicit: explicitTargets?.defense || null,
    },

    meta: {
      hasRoleTarget: Boolean(roleTarget),
      hasPositionTarget: Boolean(positionTarget),
      hasTeamTargetProfile: Boolean(teamTargets?.targetProfileId),
      hasManualTargets: Object.keys(manualTargets || {}).length > 0,
      hasExplicitTargets:
        explicitTargets?.meta?.hasExplicitTarget === true,
      hasBenchmarkTargets:
        benchmarkTargets?.hasBenchmark === true,
      targetSource:
        explicitTargets?.meta?.targetSource ||
        (useLegacyTargets ? 'legacy' : 'benchmarkUnavailable'),
      rollbackTargetSource:
        legacyExplicitTargets ? 'legacyExplicitTargets' : '',
      hasExplicitAttackTarget:
        explicitTargets?.meta?.hasAttackTarget === true,
      hasExplicitDefenseTarget:
        explicitTargets?.meta?.hasDefenseTarget === true,
    },
  }
}
