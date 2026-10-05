// src/features/playersDatabase/domain/stats/validation.js

import { validatePlayerStatsAgainstLeague } from '../validation/playerStatsLeague.validation.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const nonNegative = (value, field, playerId) => {
  const numberValue = numberOrNull(value)
  if (numberValue === null || numberValue < 0) {
    const error = new Error(`Invalid Stats ${field} for ${playerId}`)
    error.code = 'STATS_INPUT_INVALID'
    throw error
  }
  return numberValue
}

export const buildStatsLeagueContext = ({ league = {}, seasonId = '', teamId = '' } = {}) => {
  const season = object(object(league.seasonsById)[seasonId])
  const team = object(object(object(season.table).teamsById)[teamId])
  const officialTable = object(team.officialTable)
  const teamGamePlayed = numberOrNull(officialTable.teamGamePlayed)
  const goalsFor = numberOrNull(officialTable.goalsFor)
  const goalsAgainst = numberOrNull(officialTable.goalsAgainst)
  const gameDurationMinutes = numberOrNull(season.gameDurationMinutes)

  if (!clean(season.seasonKey) || !clean(season.seasonStatus)) {
    const error = new Error('Canonical League season is required for Stats Load')
    error.code = 'STATS_LEAGUE_SEASON_NOT_FOUND'
    throw error
  }
  if (!clean(team.clubId)) {
    const error = new Error('Canonical League team is required for Stats Load')
    error.code = 'STATS_LEAGUE_TEAM_NOT_FOUND'
    throw error
  }
  if (teamGamePlayed === null || goalsFor === null || goalsAgainst === null || gameDurationMinutes === null || gameDurationMinutes <= 0) {
    const error = new Error('Canonical League performance is incomplete for Stats Load')
    error.code = 'STATS_LEAGUE_CONTEXT_INCOMPLETE'
    throw error
  }

  return {
    season,
    team,
    teamGamePlayed,
    goalsFor,
    goalsAgainst,
    gameDurationMinutes,
    teamMinutes: teamGamePlayed * gameDurationMinutes,
    seasonStatus: clean(season.seasonStatus),
  }
}

const statsValidationErrorCode = code => {
  if (String(code).includes('starts') || String(code).includes('sub_')) {
    return 'STATS_APPEARANCE_CAPACITY_EXCEEDED'
  }
  if (String(code).includes('games')) return 'STATS_GAMES_EXCEED_LEAGUE'
  if (String(code).includes('minutes')) return 'STATS_MINUTES_EXCEED_LEAGUE'
  if (String(code).includes('goals')) return 'STATS_GOALS_EXCEED_LEAGUE'
  return 'STATS_INPUT_INVALID'
}

export const validateStatsRowsAgainstLeague = ({
  players = [],
  leagueContext = {},
  ageGroupId = '',
} = {}) => {
  const rows = Array.isArray(players) ? players : []

  rows.forEach(row => {
    const playerId = clean(row.playerId || row.externalPlayerId || row.fullName) || 'player'
    nonNegative(row.games, 'games', playerId)
    nonNegative(row.starts, 'starts', playerId)
    nonNegative(row.goals, 'goals', playerId)
    nonNegative(row.minutes, 'minutes', playerId)
    nonNegative(row.substituteIn, 'substituteIn', playerId)
    nonNegative(row.substitutedOut, 'substitutedOut', playerId)
    nonNegative(row.yellowCards, 'yellowCards', playerId)
  })

  const validation = validatePlayerStatsAgainstLeague({
    players: rows,
    teamPerformance: {
      teamGamePlayed: leagueContext.teamGamePlayed,
      goalsFor: leagueContext.goalsFor,
      goalsAgainst: leagueContext.goalsAgainst,
      gameDurationMinutes: leagueContext.gameDurationMinutes,
    },
    ageGroupId,
  })
  const blockingIssue = validation.issues.find(issue => issue.blocking !== false)
  if (blockingIssue) {
    const error = new Error(blockingIssue.message)
    error.code = statsValidationErrorCode(blockingIssue.code)
    throw error
  }

  return {
    valid: true,
    teamGamePlayed: Number(leagueContext.teamGamePlayed),
    goalsFor: Number(leagueContext.goalsFor),
    goalsAgainst: Number(leagueContext.goalsAgainst),
    gameDurationMinutes: Number(leagueContext.gameDurationMinutes),
    teamMinutes: Number(leagueContext.teamMinutes),
  }
}
