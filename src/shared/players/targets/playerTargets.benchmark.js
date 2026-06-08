// src/shared/players/targets/playerTargets.benchmark.js

import {
  POSITION_LAYERS,
} from '../players.constants.js'

export const PLAYER_TARGET_BENCHMARK_DEFAULTS = {
  leagueNumGames: 30,
  leagueGameTime: 90,
  squadSize: 24,
}

export const PLAYER_TARGET_POSITION_GROUPS = {
  S: {
    id: 'S',
    label: 'חלוץ',
    layerKey: 'attack',
    positionCodes: ['S'],
  },
  AC: {
    id: 'AC',
    label: 'קשר התקפי מרכזי',
    layerKey: 'atMidfield',
    positionCodes: ['AC'],
  },
  WING: {
    id: 'WING',
    label: 'כנפיים',
    layerKey: 'atMidfield',
    positionCodes: ['AR', 'AL'],
  },
  CM: {
    id: 'CM',
    label: 'קישור מרכזי',
    layerKey: 'midfield',
    positionCodes: ['MCR', 'MCL'],
  },
  DM: {
    id: 'DM',
    label: 'קישור אחורי',
    layerKey: 'dmMid',
    positionCodes: ['DM', 'DMC', 'DMR', 'DML'],
  },
  DEF: {
    id: 'DEF',
    label: 'הגנה',
    layerKey: 'defense',
    positionCodes: ['DR', 'DL', 'DC', 'DCR', 'DCL'],
  },
  GK: {
    id: 'GK',
    label: 'שוער',
    layerKey: 'goalkeeper',
    positionCodes: ['GK'],
  },
}

export const PLAYER_GOAL_TIERS = {
  scorer: {
    id: 'scorer',
    label: 'סקורר',
    target: 18,
    range: [16, null],
    goalsRange: [16, null],
  },
  doubleDigitScorer: {
    id: 'doubleDigitScorer',
    label: 'כובש דו ספרתי',
    target: 12,
    range: [11, 15],
    goalsRange: [11, 15],
  },
  supportScorer: {
    id: 'supportScorer',
    label: 'כובש משלים',
    target: 8,
    range: [6, 10],
    goalsRange: [6, 10],
  },
  occasionalScorer: {
    id: 'occasionalScorer',
    label: 'כובש מזדמן',
    target: 3,
    range: [1, 5],
    goalsRange: [1, 5],
  },
  none: {
    id: 'none',
    label: 'ללא יעד כיבוש',
    target: 0,
    range: [0, 0],
    goalsRange: [0, 0],
  },
}

const GOAL_TIER_BY_EXCEL_LABEL = {
  '15+': 'scorer',
  '10-14': 'doubleDigitScorer',
  '5-9': 'supportScorer',
  '1-4': 'occasionalScorer',
  0: 'none',
  '0': 'none',
}

export const PLAYER_ROLE_MINUTES_BENCHMARKS = {
  key: {
    id: 'key',
    label: 'שחקן מפתח',
    minutesPct: { target: 82, range: [70, 95] },
    startsPct: { target: 78, range: [65, 95] },
  },
  core: {
    id: 'core',
    label: 'שחקן מרכזי',
    minutesPct: { target: 60, range: [50, 70] },
    startsPct: { target: 58, range: [40, 75] },
  },
  rotation: {
    id: 'rotation',
    label: 'רוטציה',
    minutesPct: { target: 38, range: [25, 50] },
    startsPct: { target: 28, range: [10, 45] },
  },
  fringe: {
    id: 'fringe',
    label: 'אחרון בסגל',
    minutesPct: { target: 12, range: [0, 25] },
    startsPct: { target: 8, range: [0, 20] },
  },
}

export const PLAYER_ASSISTS_BENCHMARKS = {
  S: {
    scorer: { target: 4, range: [2, 6] },
    doubleDigitScorer: { target: 3, range: [1, 5] },
    supportScorer: { target: 2, range: [0, 4] },
    occasionalScorer: { target: 1, range: [0, 2] },
    none: { target: 0, range: [0, 1] },
  },
  AC: {
    scorer: { target: 8, range: [5, 11] },
    doubleDigitScorer: { target: 7, range: [4, 10] },
    supportScorer: { target: 5, range: [3, 8] },
    occasionalScorer: { target: 3, range: [1, 5] },
    none: { target: 1, range: [0, 2] },
  },
  WING: {
    scorer: { target: 7, range: [4, 10] },
    doubleDigitScorer: { target: 6, range: [3, 9] },
    supportScorer: { target: 5, range: [2, 8] },
    occasionalScorer: { target: 3, range: [1, 5] },
    none: { target: 1, range: [0, 2] },
  },
  CM: {
    scorer: { target: 6, range: [3, 9] },
    doubleDigitScorer: { target: 5, range: [2, 8] },
    supportScorer: { target: 4, range: [2, 6] },
    occasionalScorer: { target: 2, range: [0, 4] },
    none: { target: 1, range: [0, 2] },
  },
  DM: {
    scorer: { target: 4, range: [2, 6] },
    doubleDigitScorer: { target: 3, range: [1, 5] },
    supportScorer: { target: 2, range: [0, 4] },
    occasionalScorer: { target: 1, range: [0, 3] },
    none: { target: 0, range: [0, 2] },
  },
  DEF: {
    scorer: { target: 3, range: [1, 5] },
    doubleDigitScorer: { target: 2, range: [0, 4] },
    supportScorer: { target: 2, range: [0, 3] },
    occasionalScorer: { target: 1, range: [0, 2] },
    none: { target: 0, range: [0, 1] },
  },
  GK: {
    none: { target: 0, range: [0, 0] },
  },
}

export const PLAYER_DEFENSE_BENCHMARKS = {
  S: {
    goalsAgainstResponsibilityPct: { target: 0, range: [0, 5] },
  },
  AC: {
    goalsAgainstResponsibilityPct: { target: 10, range: [5, 15] },
  },
  WING: {
    goalsAgainstResponsibilityPct: { target: 15, range: [8, 22] },
  },
  CM: {
    goalsAgainstResponsibilityPct: { target: 35, range: [25, 45] },
  },
  DM: {
    goalsAgainstResponsibilityPct: { target: 55, range: [45, 70] },
  },
  DEF: {
    goalsAgainstResponsibilityPct: { target: 80, range: [70, 95] },
  },
  GK: {
    goalsAgainstResponsibilityPct: { target: 100, range: [90, 100] },
    cleanSheetPct: { target: 35, range: [25, 45] },
  },
}

export const PLAYER_GOAL_TIER_RULES = {
  top: {
    key: {
      S: '15+',
      AC: '10-14',
      WING: '10-14',
      CM: '5-9',
      DM: '1-4',
      DEF: '1-4',
      GK: '0',
    },
    core: {
      S: '10-14',
      AC: '5-9',
      WING: '5-9',
      CM: '1-4',
      DM: '1-4',
      DEF: '1-4',
      GK: '0',
    },
    rotation: {
      S: '5-9',
      AC: '1-4',
      WING: '1-4',
      CM: '1-4',
      DM: '1-4',
      DEF: '1-4',
      GK: '0',
    },
    fringe: {
      S: '1-4',
      AC: '1-4',
      WING: '1-4',
      CM: '0',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
  },
  midTop: {
    key: {
      S: '10-14',
      AC: '10-14',
      WING: '5-9',
      CM: '5-9',
      DM: '1-4',
      DEF: '1-4',
      GK: '0',
    },
    core: {
      S: '5-9',
      AC: '5-9',
      WING: '5-9',
      CM: '1-4',
      DM: '1-4',
      DEF: '1-4',
      GK: '0',
    },
    rotation: {
      S: '1-4',
      AC: '1-4',
      WING: '1-4',
      CM: '1-4',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
    fringe: {
      S: '1-4',
      AC: '1-4',
      WING: '1-4',
      CM: '0',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
  },
  midLow: {
    key: {
      S: '5-9',
      AC: '5-9',
      WING: '5-9',
      CM: '1-4',
      DM: '1-4',
      DEF: '1-4',
      GK: '0',
    },
    core: {
      S: '5-9',
      AC: '1-4',
      WING: '1-4',
      CM: '1-4',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
    rotation: {
      S: '1-4',
      AC: '1-4',
      WING: '1-4',
      CM: '0',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
    fringe: {
      S: '1-4',
      AC: '0',
      WING: '0',
      CM: '0',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
  },
  bottom: {
    key: {
      S: '5-9',
      AC: '1-4',
      WING: '1-4',
      CM: '1-4',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
    core: {
      S: '1-4',
      AC: '1-4',
      WING: '1-4',
      CM: '0',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
    rotation: {
      S: '1-4',
      AC: '0',
      WING: '0',
      CM: '0',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
    fringe: {
      S: '0',
      AC: '0',
      WING: '0',
      CM: '0',
      DM: '0',
      DEF: '0',
      GK: '0',
    },
  },
}

const toNumber = (value, fallback = null) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const roundNumber = (value, digits = 2) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Number(n.toFixed(digits))
}

const clean = (value) => {
  return value == null ? '' : String(value).trim()
}

const normalizeTargetPositionProfile = (value) => {
  const id = clean(value)
  const aliases = {
    midHigh: 'midTop',
  }

  if (aliases[id]) return aliases[id]

  return PLAYER_GOAL_TIER_RULES[id] ? id : ''
}

const normalizeSquadRole = (value) => {
  const id = clean(value)
  return PLAYER_ROLE_MINUTES_BENCHMARKS[id] ? id : ''
}

const normalizePositionGroup = (value) => {
  const id = clean(value)
  return PLAYER_TARGET_POSITION_GROUPS[id] ? id : ''
}

const getPrimaryPositionCode = (player = {}) => {
  if (player?.primaryPosition) return clean(player.primaryPosition)

  if (Array.isArray(player?.positions) && player.positions.length > 0) {
    const first = player.positions[0]

    if (typeof first === 'string') return clean(first)
    if (first?.code) return clean(first.code)
    if (first?.id) return clean(first.id)
  }

  return clean(
    player?.position ||
      player?.positionCode ||
      player?.mainPosition ||
      player?.generalPosition?.code
  )
}

export const resolvePlayerTargetPositionGroup = (input = {}) => {
  const explicit = normalizePositionGroup(
    input?.positionGroup ||
      input?.targetPositionGroup ||
      input?.benchmarkPositionGroup
  )

  if (explicit) return PLAYER_TARGET_POSITION_GROUPS[explicit]

  const code = clean(
    typeof input === 'string'
      ? input
      : input?.positionCode || getPrimaryPositionCode(input?.player || input)
  )

  if (!code) return null

  const found = Object.keys(PLAYER_TARGET_POSITION_GROUPS).find((groupId) => {
    return PLAYER_TARGET_POSITION_GROUPS[groupId].positionCodes.includes(code)
  })

  if (found) return PLAYER_TARGET_POSITION_GROUPS[found]

  const layerKey = clean(input?.layerKey || input?.positionLayer)
  const fromLayer = Object.keys(PLAYER_TARGET_POSITION_GROUPS).find((groupId) => {
    return PLAYER_TARGET_POSITION_GROUPS[groupId].layerKey === layerKey
  })

  if (fromLayer) return PLAYER_TARGET_POSITION_GROUPS[fromLayer]

  const layerEntries = Object.entries(POSITION_LAYERS || {})

  for (let i = 0; i < layerEntries.length; i++) {
    const [nextLayerKey, positions] = layerEntries[i]
    const exists = (positions || []).some((position) => position.code === code)

    if (exists) {
      const layerGroup = Object.keys(PLAYER_TARGET_POSITION_GROUPS).find(
        (groupId) => {
          return PLAYER_TARGET_POSITION_GROUPS[groupId].layerKey === nextLayerKey
        }
      )

      if (layerGroup) return PLAYER_TARGET_POSITION_GROUPS[layerGroup]
    }
  }

  return null
}

const getGoalTierFromRule = ({
  targetPositionProfile,
  squadRole,
  positionGroup,
} = {}) => {
  const profileId = normalizeTargetPositionProfile(targetPositionProfile)
  const roleId = normalizeSquadRole(squadRole)
  const groupId = normalizePositionGroup(positionGroup)

  const tierLabel =
    PLAYER_GOAL_TIER_RULES?.[profileId]?.[roleId]?.[groupId] || '0'

  const tierId = GOAL_TIER_BY_EXCEL_LABEL[tierLabel] || 'none'

  return PLAYER_GOAL_TIERS[tierId]
}

const addRangeTargets = (a = {}, b = {}) => {
  const aMax = a.range?.[1]
  const bMax = b.range?.[1]

  return {
    target: toNumber(a.target, 0) + toNumber(b.target, 0),
    range: [
      toNumber(a.range?.[0], 0) + toNumber(b.range?.[0], 0),
      aMax === null || bMax === null
        ? null
        : toNumber(aMax, 0) + toNumber(bMax, 0),
    ],
  }
}

const getLeagueNumGames = ({ team = {}, player = {}, leagueNumGames } = {}) => {
  return (
    toNumber(leagueNumGames) ||
    toNumber(team?.leagueNumGames) ||
    toNumber(player?.team?.leagueNumGames) ||
    PLAYER_TARGET_BENCHMARK_DEFAULTS.leagueNumGames
  )
}

const getLeagueGameTime = ({ team = {}, player = {}, leagueGameTime } = {}) => {
  return (
    toNumber(leagueGameTime) ||
    toNumber(team?.leagueGameTime) ||
    toNumber(player?.team?.leagueGameTime) ||
    PLAYER_TARGET_BENCHMARK_DEFAULTS.leagueGameTime
  )
}

const addPerGameTarget = ({ target = {}, leagueNumGames } = {}) => {
  const games = toNumber(leagueNumGames, 0)

  return {
    ...target,
    perGameTarget:
      games > 0 ? roundNumber(toNumber(target.target, 0) / games, 2) : 0,
  }
}

const buildMinutesTargets = ({
  roleBenchmark,
  leagueNumGames,
  leagueGameTime,
} = {}) => {
  const seasonMinutes = leagueNumGames * leagueGameTime
  const minutesPct = roleBenchmark?.minutesPct || { target: 0, range: [0, 0] }
  const startsPct = roleBenchmark?.startsPct || { target: 0, range: [0, 0] }

  return {
    minutesPct,
    minutes: {
      target: roundNumber(seasonMinutes * (minutesPct.target / 100), 0),
      range: [
        roundNumber(seasonMinutes * (minutesPct.range[0] / 100), 0),
        roundNumber(seasonMinutes * (minutesPct.range[1] / 100), 0),
      ],
    },
    startsPct,
    starts: {
      target: roundNumber(leagueNumGames * (startsPct.target / 100), 0),
      range: [
        roundNumber(leagueNumGames * (startsPct.range[0] / 100), 0),
        roundNumber(leagueNumGames * (startsPct.range[1] / 100), 0),
      ],
    },
  }
}

export const buildPlayerTargetBenchmark = ({
  player = {},
  team = {},
  targetPositionProfile,
  squadRole,
  positionGroup,
  positionCode,
  leagueNumGames,
  leagueGameTime,
} = {}) => {
  const profileId = normalizeTargetPositionProfile(
    targetPositionProfile ||
      team?.targetPositionProfile ||
      team?.targetProfileId
  )

  const roleId = normalizeSquadRole(
    squadRole ||
      player?.squadRole ||
      player?.role ||
      player?.playerRole
  )

  const resolvedPositionGroup = resolvePlayerTargetPositionGroup({
    player,
    positionGroup,
    positionCode,
  })

  const groupId = resolvedPositionGroup?.id || ''
  const roleBenchmark = PLAYER_ROLE_MINUTES_BENCHMARKS[roleId] || null
  const goalTier = getGoalTierFromRule({
    targetPositionProfile: profileId,
    squadRole: roleId,
    positionGroup: groupId,
  })

  const goals = goalTier || PLAYER_GOAL_TIERS.none
  const assists =
    PLAYER_ASSISTS_BENCHMARKS?.[groupId]?.[goals.id] ||
    PLAYER_ASSISTS_BENCHMARKS?.[groupId]?.none ||
    { target: 0, range: [0, 0] }

  const actualLeagueNumGames = getLeagueNumGames({
    team,
    player,
    leagueNumGames,
  })

  const actualLeagueGameTime = getLeagueGameTime({
    team,
    player,
    leagueGameTime,
  })

  const goalContributions = addRangeTargets(goals, assists)
  const minutes = buildMinutesTargets({
    roleBenchmark,
    leagueNumGames: actualLeagueNumGames,
    leagueGameTime: actualLeagueGameTime,
  })

  return {
    hasBenchmark: Boolean(profileId && roleId && groupId),

    targetPositionProfile: profileId,
    squadRole: roleId,
    positionGroup: groupId,
    positionGroupLabel: resolvedPositionGroup?.label || '',
    layerKey: resolvedPositionGroup?.layerKey || '',

    leagueNumGames: actualLeagueNumGames,
    leagueGameTime: actualLeagueGameTime,

    goals: addPerGameTarget({
      target: {
        tier: goals.id,
        label: goals.label,
        target: goals.target,
        range: goals.range,
      },
      leagueNumGames: actualLeagueNumGames,
    }),

    assists: addPerGameTarget({
      target: assists,
      leagueNumGames: actualLeagueNumGames,
    }),

    goalContributions: addPerGameTarget({
      target: goalContributions,
      leagueNumGames: actualLeagueNumGames,
    }),

    minutes,

    defense:
      PLAYER_DEFENSE_BENCHMARKS[groupId] || {
        goalsAgainstResponsibilityPct: { target: 0, range: [0, 0] },
      },
  }
}

export const categorizePlayerGoals = (goals) => {
  const n = toNumber(goals, 0)

  if (n >= 16) return PLAYER_GOAL_TIERS.scorer
  if (n >= 11) return PLAYER_GOAL_TIERS.doubleDigitScorer
  if (n >= 6) return PLAYER_GOAL_TIERS.supportScorer
  if (n >= 1) return PLAYER_GOAL_TIERS.occasionalScorer

  return PLAYER_GOAL_TIERS.none
}

export const compareValueToRange = ({
  value,
  benchmark,
} = {}) => {
  const n = toNumber(value)
  const min = toNumber(benchmark?.range?.[0])
  const max = toNumber(benchmark?.range?.[1])
  const target = toNumber(benchmark?.target)

  if (!Number.isFinite(n)) {
    return {
      status: 'missing',
      gap: null,
      target,
      range: benchmark?.range || null,
    }
  }

  if (Number.isFinite(min) && n < min) {
    return {
      status: 'below',
      gap: roundNumber(n - min),
      target,
      range: benchmark?.range || null,
    }
  }

  if (Number.isFinite(max) && n > max) {
    return {
      status: 'above',
      gap: roundNumber(n - max),
      target,
      range: benchmark?.range || null,
    }
  }

  return {
    status: 'inRange',
    gap: Number.isFinite(target) ? roundNumber(n - target) : null,
    target,
    range: benchmark?.range || null,
  }
}

export const compareAssignedPlayerTargetsToBenchmark = ({
  assignedTargets = {},
  benchmark = {},
} = {}) => {
  return {
    goals: compareValueToRange({
      value: assignedTargets?.goals ?? assignedTargets?.goalsTarget,
      benchmark: benchmark?.goals,
    }),
    assists: compareValueToRange({
      value: assignedTargets?.assists ?? assignedTargets?.assistsTarget,
      benchmark: benchmark?.assists,
    }),
    goalContributions: compareValueToRange({
      value:
        assignedTargets?.goalContributions ??
        assignedTargets?.goalContributionsTarget,
      benchmark: benchmark?.goalContributions,
    }),
    minutesPct: compareValueToRange({
      value: assignedTargets?.minutesPct,
      benchmark: benchmark?.minutes?.minutesPct,
    }),
    startsPct: compareValueToRange({
      value: assignedTargets?.startsPct,
      benchmark: benchmark?.minutes?.startsPct,
    }),
  }
}
