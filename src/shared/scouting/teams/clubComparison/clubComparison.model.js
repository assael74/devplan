// src/shared/scouting/teams/clubComparison/clubComparison.model.js

export const CLUB_COMPARISON_VERSION = '2.0.0'
export const CLUB_COMPARISON_MIN_PEERS = 3
export const CLUB_COMPARISON_MIN_GAMES = 8
export const CLUB_COMPARISON_PRIORITY_LEVELS = ['low', 'neutral', 'positive', 'high', 'elite']

export const CLUB_COMPARISON_METRICS = Object.freeze([
  { key: 'leagueLevel', family: 'competition', threshold: 1, requiresGames: false },
  { key: 'successRate', family: 'performance', threshold: 15, requiresGames: true, sameLeagueLevel: true },
  { key: 'offense', family: 'performance', threshold: 2, requiresGames: true },
  { key: 'defense', family: 'performance', threshold: 2, requiresGames: true },
  { key: 'professionalRate', family: 'squad', threshold: 15, requiresGames: true, minPlayerGap: 3 },
  { key: 'underuseRate', family: 'squad', threshold: 15, requiresGames: true, minPlayerGap: 3 },
])

export const comparisonNumber = value => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export const clubComparisonSeasonOrder = seasonId => {
  const match = String(seasonId || '').match(/^(\d{4})_(\d{4})$/)
  return match && Number(match[2]) === Number(match[1]) + 1 ? Number(match[1]) : null
}
