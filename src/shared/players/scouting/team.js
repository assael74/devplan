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
  const performanceThreshold = Number.isFinite(Number(settings.performanceThreshold))
    ? Number(settings.performanceThreshold)
    : null

  return {
    perspective: settings.perspective || 'default',
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

  const attackThreshold = settings.attackPerformanceThreshold
  const defenseThreshold = settings.defensePerformanceThreshold
  const attackActive = attackThreshold !== null && attackThreshold !== undefined
  const defenseActive = defenseThreshold !== null && defenseThreshold !== undefined
  const attack = Number(metrics.attackEdge)
  const defense = Number(metrics.defenseEdge)
  const attackOk = attackActive && Number.isFinite(attack) && attack >= attackThreshold
  const defenseOk = defenseActive && Number.isFinite(defense) && defense >= defenseThreshold

  if (!attackActive && !defenseActive) return false
  if (attackActive && !attackOk) return false
  if (defenseActive && !defenseOk) return false

  if (filter === TEAM_FILTER.DEFENSE_POSITIVE) return defenseOk
  if (filter === TEAM_FILTER.ANY_POSITIVE) return true
  if (filter === TEAM_FILTER.CLEAR_POSITIVE) return true

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
    return teamFilterPasses({ filter: profile.teamFilter, metrics, settings: cfg })
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
