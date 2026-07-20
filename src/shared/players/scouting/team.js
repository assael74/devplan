// src/shared/players/scouting/team.js

import {
  DRILLDOWN_STATUS,
  SCOUT_LEVEL,
  TEAM_FILTER,
} from './ids.js'

import {
  SCOUT_PROFILES,
} from './profiles.js'

const toNum = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const pickNum = (...values) => {
  for (const value of values) {
    const n = toNum(value, null)
    if (Number.isFinite(n)) return n
  }

  return null
}

const round = (value, digits = 3) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return Number(n.toFixed(digits))
}

const avg = (values = []) => {
  const nums = values.filter((value) => Number.isFinite(value))
  if (!nums.length) return null

  return nums.reduce((sum, value) => sum + value, 0) / nums.length
}

const pctEdge = (value, base) => {
  const n = Number(value)
  const b = Number(base)

  return Number.isFinite(n) && b > 0 ? round((n - b) / b) : null
}

const defenseEdge = (teamAgainst, leagueAgainst) => {
  const team = Number(teamAgainst)
  const league = Number(leagueAgainst)

  return Number.isFinite(team) && league > 0 ? round((league - team) / league) : null
}

const getSearchDistance = ({ sourceLevel, targetLevel }) => {
  const source = Number(sourceLevel)
  const target = Number(targetLevel)

  if (!Number.isFinite(source) || !Number.isFinite(target)) return 0

  return source - target
}

const getScoutLevelByDistance = distance => {
  if (distance < 0) return SCOUT_LEVEL.ABOVE
  if (distance === 0) return SCOUT_LEVEL.SAME

  return SCOUT_LEVEL.BELOW
}

const getGames = (row = {}) => {
  return pickNum(row.gamesPlayed, row.playedGames, row.matchesPlayed, row.games, row.played, row.p)
}

const getGoalsFor = (row = {}) => {
  return pickNum(row.goalsFor, row.leagueGoalsFor, row.gf, row.teamGoals, row.goals)
}

const getGoalsAgainst = (row = {}) => {
  return pickNum(row.goalsAgainst, row.leagueGoalsAgainst, row.ga, row.against)
}

const perGame = (value, games) => {
  const n = Number(value)
  const g = Number(games)

  return Number.isFinite(n) && g > 0 ? round(n / g) : null
}

const POSITIVE_TEAM_RATE = 100
const CLEAR_POSITIVE_TEAM_RATE = 115
const GOALS_BYPASS_TOTAL = 10

const getTeamScoutSide = ({ team = {}, side = '' } = {}) => {
  const scout = team.teamScout || team.scout || {}

  return team[side] || scout[side] || team.teamPerformance?.[side] || null
}

const getTeamScoutRate = ({ team = {}, side = '' } = {}) => {
  const sideData = getTeamScoutSide({ team, side }) || {}

  return pickNum(
    sideData.priorityRate,
    sideData.scoutPriorityRate,
    sideData.qualityRate,
    sideData.combinedRate,
    sideData.anomalyRate
  )
}

const isTeamScoutSidePositive = ({ team = {}, side = '', threshold = POSITIVE_TEAM_RATE } = {}) => {
  const rate = getTeamScoutRate({ team, side })

  return Number.isFinite(rate) && rate >= threshold
}

export const passesPlayerScoutTeamFilter = ({
  profile = {},
  team = {},
  metrics = {},
} = {}) => {
  const filter = profile.teamFilter
  const goals = Number(metrics.goals)
  const attackPositive = isTeamScoutSidePositive({ team, side: 'offense' })
  const defensePositive = isTeamScoutSidePositive({ team, side: 'defense' })
  const attackClear = isTeamScoutSidePositive({
    team,
    side: 'offense',
    threshold: CLEAR_POSITIVE_TEAM_RATE,
  })
  const defenseClear = isTeamScoutSidePositive({
    team,
    side: 'defense',
    threshold: CLEAR_POSITIVE_TEAM_RATE,
  })
  const goalsBypassOk = Number.isFinite(goals) && goals >= GOALS_BYPASS_TOTAL

  if (!filter || filter === TEAM_FILTER.ANY) return true
  if (filter === TEAM_FILTER.ATTACK_POSITIVE) return attackPositive
  if (filter === TEAM_FILTER.DEFENSE_POSITIVE) return defensePositive
  if (filter === TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10) {
    return attackPositive || goalsBypassOk
  }
  if (filter === TEAM_FILTER.ANY_POSITIVE) return attackPositive || defensePositive
  if (filter === TEAM_FILTER.CLEAR_POSITIVE) return attackClear || defenseClear

  return false
}

export const buildTeamScoutMetrics = ({ team = {}, league = {} } = {}) => {
  const games = getGames(team)
  const goalsFor = getGoalsFor(team)
  const goalsAgainst = getGoalsAgainst(team)
  const goalsForPerGame = perGame(goalsFor, games)
  const goalsAgainstPerGame = perGame(goalsAgainst, games)
  const avgGoalsForPerGame = pickNum(league.avgGoalsForPerGame)
  const avgGoalsAgainstPerGame = pickNum(league.avgGoalsAgainstPerGame)

  return {
    games,
    goalsFor,
    goalsAgainst,
    goalsForPerGame,
    goalsAgainstPerGame,
    attackEdge: pctEdge(goalsForPerGame, avgGoalsForPerGame),
    defenseEdge: defenseEdge(goalsAgainstPerGame, avgGoalsAgainstPerGame),
  }
}

export const buildLeagueScoutContext = (rows = []) => {
  const items = rows.map((row) => {
    const games = getGames(row)

    return {
      goalsForPerGame: perGame(getGoalsFor(row), games),
      goalsAgainstPerGame: perGame(getGoalsAgainst(row), games),
    }
  })

  return {
    teamsCount: rows.length,
    avgGoalsForPerGame: round(avg(items.map((item) => item.goalsForPerGame))),
    avgGoalsAgainstPerGame: round(avg(items.map((item) => item.goalsAgainstPerGame))),
  }
}

export const normalizeScoutSettings = (settings = {}) => {
  const hasValue = (value) => value !== null && value !== undefined && value !== ''
  const searchDistance = Number.isFinite(Number(settings.searchDistance))
    ? Number(settings.searchDistance)
    : getSearchDistance({
      sourceLevel: settings.sourceLeagueLevel,
      targetLevel: settings.targetLeagueLevel,
    })
  const performanceThreshold = Number.isFinite(Number(settings.performanceThreshold))
    ? Number(settings.performanceThreshold)
    : null
  const deepAttackPerformanceThreshold = Number.isFinite(Number(settings.deepAttackPerformanceThreshold))
    ? Number(settings.deepAttackPerformanceThreshold)
    : 0.2
  const deepDefensePerformanceThreshold = Number.isFinite(Number(settings.deepDefensePerformanceThreshold))
    ? Number(settings.deepDefensePerformanceThreshold)
    : 0.2

  return {
    perspective: settings.perspective || 'default',
    sourceLeagueLevel: Number.isFinite(Number(settings.sourceLeagueLevel))
      ? Number(settings.sourceLeagueLevel)
      : null,
    targetLeagueLevel: Number.isFinite(Number(settings.targetLeagueLevel))
      ? Number(settings.targetLeagueLevel)
      : null,
    searchDistance,
    activeScoutLevel: getScoutLevelByDistance(searchDistance),
    performanceThreshold,
    attackPerformanceThreshold: hasValue(settings.attackPerformanceThreshold) &&
      Number.isFinite(Number(settings.attackPerformanceThreshold))
      ? Number(settings.attackPerformanceThreshold)
      : performanceThreshold,
    defensePerformanceThreshold: hasValue(settings.defensePerformanceThreshold) &&
      Number.isFinite(Number(settings.defensePerformanceThreshold))
      ? Number(settings.defensePerformanceThreshold)
      : performanceThreshold,
    clearPerformanceThreshold: Number.isFinite(Number(settings.clearPerformanceThreshold))
      ? Number(settings.clearPerformanceThreshold)
      : 0.1,
    deepAttackPerformanceThreshold,
    deepDefensePerformanceThreshold,
    deepClearPerformanceThreshold: Number.isFinite(Number(settings.deepClearPerformanceThreshold))
      ? Number(settings.deepClearPerformanceThreshold)
      : 0.2,
    includeUniversal: settings.includeUniversal !== false,
    enabledLevels: Array.isArray(settings.enabledLevels) && settings.enabledLevels.length
      ? settings.enabledLevels
      : [SCOUT_LEVEL.BELOW, SCOUT_LEVEL.SAME],
  }
}

const levelEnabled = ({ profile, settings }) => {
  const levels = Array.isArray(profile.searchLevels) ? profile.searchLevels : []
  if (!levels.length) return true

  return levels.some((level) => settings.enabledLevels.includes(level))
}

const teamFilterPasses = ({ filter, metrics, settings }) => {
  if (filter === TEAM_FILTER.ANY) return true

  const deepSearch = settings.searchDistance >= 2
  const baseAttackActive =
    settings.attackPerformanceThreshold !== null &&
    settings.attackPerformanceThreshold !== undefined
  const baseDefenseActive =
    settings.defensePerformanceThreshold !== null &&
    settings.defensePerformanceThreshold !== undefined
  const attackThreshold = deepSearch
    ? settings.deepAttackPerformanceThreshold
    : settings.attackPerformanceThreshold
  const defenseThreshold = deepSearch
    ? settings.deepDefensePerformanceThreshold
    : settings.defensePerformanceThreshold
  const attackActive = baseAttackActive
  const defenseActive = baseDefenseActive
  const attack = Number(metrics.attackEdge)
  const defense = Number(metrics.defenseEdge)
  const goals = Number(metrics.goals)
  const attackOk = attackActive && Number.isFinite(attack) && attack >= attackThreshold
  const defenseOk = defenseActive && Number.isFinite(defense) && defense >= defenseThreshold
  const goalsBypassOk = Number.isFinite(goals) && goals >= 10

  if (deepSearch) {
    const clearThreshold = settings.deepClearPerformanceThreshold

    if (filter === TEAM_FILTER.DEFENSE_POSITIVE) return defenseOk
    if (filter === TEAM_FILTER.ATTACK_POSITIVE) return attackOk
    if (filter === TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10) {
      return attackOk || goalsBypassOk
    }
    if (filter === TEAM_FILTER.ANY_POSITIVE) return attackOk || defenseOk
    if (filter === TEAM_FILTER.CLEAR_POSITIVE) {
      return (
        (Number.isFinite(attack) && attack >= clearThreshold) ||
        (Number.isFinite(defense) && defense >= clearThreshold)
      )
    }

    return false
  }

  if (!attackActive && !defenseActive) return false
  if (attackActive && !attackOk) return false
  if (defenseActive && !defenseOk) return false

  if (filter === TEAM_FILTER.DEFENSE_POSITIVE) return defenseOk
  if (filter === TEAM_FILTER.ATTACK_POSITIVE) return attackOk
  if (filter === TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10) {
    return attackOk || goalsBypassOk
  }
  if (filter === TEAM_FILTER.ANY_POSITIVE) return attackOk || defenseOk
  if (filter === TEAM_FILTER.CLEAR_POSITIVE) {
    const clearThreshold = deepSearch
      ? settings.deepClearPerformanceThreshold
      : settings.clearPerformanceThreshold

    return attackOk || defenseOk ||
      (Number.isFinite(attack) && attack >= clearThreshold) ||
      (Number.isFinite(defense) && defense >= clearThreshold)
  }

  return false
}

export const passesScoutTeamPerformance = ({ filter, team = {}, signal = {} } = {}) => {
  const attack = Number(team.attackEdge)
  const defense = Number(team.defenseEdge)
  const goals = Number(signal?.metrics?.goals)
  const attackOk = Number.isFinite(attack) && attack >= 0.1
  const defenseOk = Number.isFinite(defense) && defense >= 0.1
  const goalsBypassOk = Number.isFinite(goals) && goals >= 10
  const clearOk =
    (Number.isFinite(attack) && attack >= 0.1) ||
    (Number.isFinite(defense) && defense >= 0.1)

  if (!filter || filter === TEAM_FILTER.ANY) return true
  if (filter === TEAM_FILTER.ATTACK_POSITIVE) return attackOk
  if (filter === TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10) {
    return attackOk || goalsBypassOk
  }
  if (filter === TEAM_FILTER.ANY_POSITIVE) return attackOk || defenseOk
  if (filter === TEAM_FILTER.DEFENSE_POSITIVE) return defenseOk
  if (filter === TEAM_FILTER.CLEAR_POSITIVE) return clearOk

  return false
}

export const buildTeamDrilldown = ({
  team,
  league = {},
  settings,
  profiles = SCOUT_PROFILES,
} = {}) => {
  const cfg = normalizeScoutSettings(settings)
  const metrics = buildTeamScoutMetrics({ team, league })
  const eligible = profiles.filter((profile) => levelEnabled({ profile, settings: cfg }))
  const universal = eligible.filter((profile) => profile.teamFilter === TEAM_FILTER.ANY)
  const contextual = eligible.filter((profile) => profile.teamFilter !== TEAM_FILTER.ANY)
  const matchedContextual = contextual.filter((profile) => {
    return passesPlayerScoutTeamFilter({ profile, team, metrics })
  })
  const universalAllowed = cfg.includeUniversal ? universal : []
  const status = matchedContextual.length
    ? DRILLDOWN_STATUS.STRONG
    : universalAllowed.length
      ? DRILLDOWN_STATUS.OPEN
      : DRILLDOWN_STATUS.HIDDEN

  return {
    teamId: team?.id || team?.teamId || '',
    team,
    status,
    perspective: cfg.perspective,
    settings: cfg,
    metrics,
    profiles: [...matchedContextual, ...universalAllowed],
    contextualProfiles: matchedContextual,
    universalProfiles: universalAllowed,
    blockedContextualProfiles: contextual.filter((profile) => {
      return !matchedContextual.some((item) => item.id === profile.id)
    }),
  }
}

export const buildTeamsDrilldown = ({ rows, settings, profiles = SCOUT_PROFILES } = {}) => {
  const tableRows = Array.isArray(rows) ? rows : []
  const league = buildLeagueScoutContext(tableRows)

  return tableRows.map((team) => buildTeamDrilldown({
    team,
    league,
    settings,
    profiles,
  }))
}
