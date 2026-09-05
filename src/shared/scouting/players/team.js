// src/shared/scouting/players/team.js

import {
  TEAM_FILTER,
} from './ids.js'


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

const POSITIVE_TEAM_SCORE = 60
const GOALS_BYPASS_TOTAL = 10

const hasScoutSideValue = value => Boolean(
  value &&
  typeof value === 'object' &&
  (
    value.priorityLevel ||
    value.scoutPriorityScore !== null && value.scoutPriorityScore !== undefined ||
    value.priority?.level ||
    value.priority?.score !== null && value.priority?.score !== undefined
  )
)

const getTeamScoutSide = ({ team = {}, side = '' } = {}) => {
  const candidates = [
    team[side],
    team.performance?.[side],
    team.teamScout?.[side],
    team.scout?.[side],
    team.teamPerformance?.[side],
    team.domain?.performance?.[side],
    team.performanceView?.[side],
  ]

  return candidates.find(hasScoutSideValue) || null
}

const POSITIVE_PRIORITY_LEVELS = new Set([
  'positive',
  'high',
  'elite',
  'חיובי',
  'עדיפות גבוהה',
  'יעד מוביל',
])

const getTeamScoutScore = ({ team = {}, side = '' } = {}) => {
  const sideData = getTeamScoutSide({ team, side }) || {}

  return pickNum(sideData.scoutPriorityScore, sideData.priority?.score)
}

const getTeamScoutPriorityLevel = ({ team = {}, side = '' } = {}) => {
  const sideData = getTeamScoutSide({ team, side }) || {}

  return String(sideData.priorityLevel || sideData.priority?.level || '').trim().toLowerCase()
}

const isTeamScoutSidePositive = ({ team = {}, side = '' } = {}) => {
  const priorityLevel = getTeamScoutPriorityLevel({ team, side })

  if (priorityLevel) {
    return POSITIVE_PRIORITY_LEVELS.has(priorityLevel)
  }

  const score = getTeamScoutScore({ team, side })
  return Number.isFinite(score) && score >= POSITIVE_TEAM_SCORE
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
  const goalsBypassOk = Number.isFinite(goals) && goals >= GOALS_BYPASS_TOTAL

  if (!filter || filter === TEAM_FILTER.ANY) return true
  if (filter === TEAM_FILTER.ATTACK_POSITIVE) return attackPositive
  if (filter === TEAM_FILTER.DEFENSE_POSITIVE) return defensePositive
  if (filter === TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10) {
    return attackPositive || goalsBypassOk
  }
  if (filter === TEAM_FILTER.ANY_POSITIVE) return attackPositive || defensePositive
  if (filter === TEAM_FILTER.CLEAR_POSITIVE) return attackPositive || defensePositive

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
