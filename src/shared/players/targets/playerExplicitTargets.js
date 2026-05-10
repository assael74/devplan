// src/shared/players/targets/playerExplicitTargets.js

const DEFAULT_LEAGUE_NUM_GAMES = 30

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const roundNumber = (value, digits = 2) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return 0

  return Number(n.toFixed(digits))
}

const roundTarget = (value) => {
  const n = Number(value)

  if (!Number.isFinite(n) || n <= 0) return 0

  return Math.round(n)
}

const buildRangeTarget = ({
  total,
  range,
}) => {
  const base = toNumber(total, 0)
  const minPct = toNumber(range?.[0], 0)
  const maxPct = toNumber(range?.[1], 0)

  return {
    min: roundTarget(base * (minPct / 100)),
    max: roundTarget(base * (maxPct / 100)),
  }
}

const buildSingleTargetFromRange = (rangeTarget = {}) => {
  const min = toNumber(rangeTarget?.min, 0)
  const max = toNumber(rangeTarget?.max, 0)

  if (min <= 0 && max <= 0) return 0
  if (min > 0 && max <= 0) return min
  if (max > 0 && min <= 0) return max

  return roundTarget((min + max) / 2)
}

const getLeagueNumGames = ({
  team,
  player,
}) => {
  const fromTeam = toNumber(team?.leagueNumGames, 0)
  if (fromTeam > 0) return fromTeam

  const fromPlayerTeam = toNumber(player?.team?.leagueNumGames, 0)
  if (fromPlayerTeam > 0) return fromPlayerTeam

  return DEFAULT_LEAGUE_NUM_GAMES
}

const getTeamProfileId = (teamTargets = {}) => {
  return (
    teamTargets?.targetProfileId ||
    teamTargets?.targetProfile?.id ||
    'midHigh'
  )
}

const TEAM_PROFILE_OUTPUT_MODIFIERS = {
  bottom: 0.85,
  midLow: 0.95,
  midHigh: 1,
  top: 1.1,
}

const getTeamProfileModifier = (profileId) => {
  return TEAM_PROFILE_OUTPUT_MODIFIERS[profileId] || 1
}

const applyModifierToRange = (range = [], modifier = 1) => {
  const min = toNumber(range?.[0], 0)
  const max = toNumber(range?.[1], 0)

  return [
    roundNumber(min * modifier, 1),
    roundNumber(max * modifier, 1),
  ]
}

const PLAYER_OUTPUT_SHARE_BASE = {
  key: {
    attack: {
      contributionShareRange: [18, 25],
      goalsShareRange: [12, 18],
      assistsShareRange: [6, 10],
    },
    atMidfield: {
      contributionShareRange: [14, 20],
      goalsShareRange: [7, 12],
      assistsShareRange: [7, 12],
    },
    midfield: {
      contributionShareRange: [7, 12],
      goalsShareRange: [3, 6],
      assistsShareRange: [4, 7],
    },
    dmMid: {
      contributionShareRange: [4, 8],
      goalsShareRange: [1, 3],
      assistsShareRange: [3, 5],
    },
    defense: {
      contributionShareRange: [3, 6],
      goalsShareRange: [2, 4],
      assistsShareRange: [1, 3],
    },
    goalkeeper: null,
  },

  core: {
    attack: {
      contributionShareRange: [12, 18],
      goalsShareRange: [8, 13],
      assistsShareRange: [4, 8],
    },
    atMidfield: {
      contributionShareRange: [10, 15],
      goalsShareRange: [5, 9],
      assistsShareRange: [5, 9],
    },
    midfield: {
      contributionShareRange: [5, 9],
      goalsShareRange: [2, 5],
      assistsShareRange: [3, 6],
    },
    dmMid: {
      contributionShareRange: [3, 6],
      goalsShareRange: [1, 2],
      assistsShareRange: [2, 4],
    },
    defense: {
      contributionShareRange: [2, 5],
      goalsShareRange: [1, 3],
      assistsShareRange: [1, 2],
    },
    goalkeeper: null,
  },

  rotation: {
    attack: {
      contributionShareRange: [6, 12],
      goalsShareRange: [4, 8],
      assistsShareRange: [2, 5],
    },
    atMidfield: {
      contributionShareRange: [5, 10],
      goalsShareRange: [2, 5],
      assistsShareRange: [3, 6],
    },
    midfield: {
      contributionShareRange: [2, 6],
      goalsShareRange: [1, 3],
      assistsShareRange: [1, 4],
    },
    dmMid: {
      contributionShareRange: [1, 4],
      goalsShareRange: [0, 2],
      assistsShareRange: [1, 3],
    },
    defense: {
      contributionShareRange: [1, 3],
      goalsShareRange: [0, 2],
      assistsShareRange: [0, 2],
    },
    goalkeeper: null,
  },

  fringe: {
    attack: {
      contributionShareRange: [0, 6],
      goalsShareRange: [0, 4],
      assistsShareRange: [0, 3],
    },
    atMidfield: {
      contributionShareRange: [0, 5],
      goalsShareRange: [0, 3],
      assistsShareRange: [0, 3],
    },
    midfield: {
      contributionShareRange: [0, 3],
      goalsShareRange: [0, 2],
      assistsShareRange: [0, 2],
    },
    dmMid: {
      contributionShareRange: [0, 2],
      goalsShareRange: [0, 1],
      assistsShareRange: [0, 2],
    },
    defense: {
      contributionShareRange: [0, 2],
      goalsShareRange: [0, 1],
      assistsShareRange: [0, 1],
    },
    goalkeeper: null,
  },
}

const DEFENSIVE_POSITION_IDS = [
  'dmMid',
  'defense',
  'goalkeeper',
]

const getOutputShareConfig = ({
  roleId,
  positionLayer,
  teamProfileId,
}) => {
  const base = PLAYER_OUTPUT_SHARE_BASE?.[roleId]?.[positionLayer] || null

  if (!base) return null

  const modifier = getTeamProfileModifier(teamProfileId)

  return {
    contributionShareRange: applyModifierToRange(
      base.contributionShareRange,
      modifier
    ),
    goalsShareRange: applyModifierToRange(
      base.goalsShareRange,
      modifier
    ),
    assistsShareRange: applyModifierToRange(
      base.assistsShareRange,
      modifier
    ),
  }
}

const buildAttackExplicitTargets = ({
  roleId,
  positionLayer,
  teamProfileId,
  teamGoalsForTarget,
  leagueNumGames,
}) => {
  const shareConfig = getOutputShareConfig({
    roleId,
    positionLayer,
    teamProfileId,
  })

  if (!shareConfig || teamGoalsForTarget <= 0) {
    return {
      hasAttackTarget: false,
      contributionShareRange: [0, 0],
      goalsShareRange: [0, 0],
      assistsShareRange: [0, 0],
      goalContributionsTargetRange: { min: 0, max: 0 },
      goalsTargetRange: { min: 0, max: 0 },
      assistsTargetRange: { min: 0, max: 0 },
      goalContributionsTarget: 0,
      goalsTarget: 0,
      assistsTarget: 0,
      contributionPerGameTarget: 0,
      goalsPerGameTarget: 0,
      assistsPerGameTarget: 0,
    }
  }

  const goalContributionsTargetRange = buildRangeTarget({
    total: teamGoalsForTarget,
    range: shareConfig.contributionShareRange,
  })

  const goalsTargetRange = buildRangeTarget({
    total: teamGoalsForTarget,
    range: shareConfig.goalsShareRange,
  })

  const assistsTargetRange = buildRangeTarget({
    total: teamGoalsForTarget,
    range: shareConfig.assistsShareRange,
  })

  const goalContributionsTarget = buildSingleTargetFromRange(
    goalContributionsTargetRange
  )

  const goalsTarget = buildSingleTargetFromRange(goalsTargetRange)
  const assistsTarget = buildSingleTargetFromRange(assistsTargetRange)

  return {
    hasAttackTarget: true,

    contributionShareRange: shareConfig.contributionShareRange,
    goalsShareRange: shareConfig.goalsShareRange,
    assistsShareRange: shareConfig.assistsShareRange,

    goalContributionsTargetRange,
    goalsTargetRange,
    assistsTargetRange,

    goalContributionsTarget,
    goalsTarget,
    assistsTarget,

    contributionPerGameTarget:
      leagueNumGames > 0
        ? roundNumber(goalContributionsTarget / leagueNumGames, 2)
        : 0,

    goalsPerGameTarget:
      leagueNumGames > 0
        ? roundNumber(goalsTarget / leagueNumGames, 2)
        : 0,

    assistsPerGameTarget:
      leagueNumGames > 0
        ? roundNumber(assistsTarget / leagueNumGames, 2)
        : 0,
  }
}

const buildDefenseExplicitTargets = ({
  positionLayer,
  teamGoalsAgainstTarget,
  leagueNumGames,
  roleTarget,
}) => {
  const goalsAgainstPerGameTarget =
    leagueNumGames > 0
      ? roundNumber(teamGoalsAgainstTarget / leagueNumGames, 2)
      : 0

  const isDefensivePosition = DEFENSIVE_POSITION_IDS.includes(positionLayer)

  const minutesRange = Array.isArray(roleTarget?.minutesRange)
    ? roleTarget.minutesRange
    : [0, 0]

  const playerGoalsAgainstTargetRange = buildRangeTarget({
    total: teamGoalsAgainstTarget,
    range: minutesRange,
  })

  return {
    hasDefenseTarget: teamGoalsAgainstTarget > 0,

    isDefensivePosition,

    teamGoalsAgainstTarget,
    goalsAgainstPerGameTarget,

    playerGoalsAgainstTargetRange,
    playerGoalsAgainstTarget: buildSingleTargetFromRange(
      playerGoalsAgainstTargetRange
    ),
  }
}

export function buildPlayerExplicitTargets({
  player,
  team,
  role,
  position,
  roleTarget,
  positionTarget,
  teamTargets,
} = {}) {
  const activeTeam = team || player?.team || {}

  const teamProfileId = getTeamProfileId(teamTargets)
  const teamProfile = teamTargets?.targetProfile || null
  const forecastTargets = teamTargets?.forecastTargets || {}

  const leagueNumGames = getLeagueNumGames({
    team: activeTeam,
    player,
  })

  const roleId = role?.id || role?.value || ''
  const positionLayer = position?.layerKey || position?.id || ''

  const teamGoalsForTarget = toNumber(forecastTargets?.goalsFor, 0)
  const teamGoalsAgainstTarget = toNumber(forecastTargets?.goalsAgainst, 0)

  const attack = buildAttackExplicitTargets({
    roleId,
    positionLayer,
    teamProfileId,
    teamGoalsForTarget,
    leagueNumGames,
  })

  const defense = buildDefenseExplicitTargets({
    positionLayer,
    teamGoalsAgainstTarget,
    leagueNumGames,
    roleTarget,
  })

  return {
    roleId,
    roleLabel: role?.label || '',
    positionLayer,
    positionLabel: position?.layerLabel || position?.label || '',
    teamProfileId,
    teamProfileLabel:
      teamProfile?.rankLabel ||
      teamProfile?.shortLabel ||
      teamProfile?.label ||
      '',

    leagueNumGames,

    usage: {
      minutesRange: roleTarget?.minutesRange || null,
      startsRange: roleTarget?.startsRange || null,
    },

    teamSeasonTargets: {
      goalsFor: teamGoalsForTarget,
      goalsAgainst: teamGoalsAgainstTarget,
      points: toNumber(forecastTargets?.points, 0),
      pointsRate: toNumber(forecastTargets?.pointsRate, 0),
      goalDifference: toNumber(forecastTargets?.goalDifference, 0),
    },

    attack,
    defense,

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
        positionTarget?.cleanSheetPct?.greenMin || null,
    },

    meta: {
      hasExplicitTarget:
        Boolean(roleId) &&
        Boolean(positionLayer) &&
        Boolean(teamProfileId),

      hasAttackTarget: attack.hasAttackTarget,
      hasDefenseTarget: defense.hasDefenseTarget,
      hasTeamGoalsForTarget: teamGoalsForTarget > 0,
      hasTeamGoalsAgainstTarget: teamGoalsAgainstTarget > 0,
    },
  }
}
