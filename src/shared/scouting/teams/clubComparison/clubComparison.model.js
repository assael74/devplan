// src/shared/scouting/teams/clubComparison/clubComparison.model.js

export const CLUB_COMPARISON_VERSION = '3.0.0'
export const CLUB_COMPARISON_MIN_PEERS = 3
export const CLUB_COMPARISON_MIN_PERFORMANCE_GAMES = 3
export const CLUB_COMPARISON_MIN_REFERENCE_GAMES = 8
export const CLUB_COMPARISON_MIN_SQUAD_GAMES = 8
export const CLUB_COMPARISON_PRIORITY_LEVELS = ['low', 'neutral', 'positive', 'high', 'elite']

export const CLUB_COMPARISON_METRICS = Object.freeze([
  { key: 'leagueLevel', family: 'competition', threshold: 1 },
  { key: 'rankPercentile', family: 'performance', threshold: 25, minGames: CLUB_COMPARISON_MIN_PERFORMANCE_GAMES },
  { key: 'successRate', family: 'performance', threshold: 15, minGames: CLUB_COMPARISON_MIN_PERFORMANCE_GAMES, sameLeagueLevel: true },
  { key: 'goalsForPerGame', family: 'performance', threshold: 1, minGames: CLUB_COMPARISON_MIN_PERFORMANCE_GAMES },
  { key: 'goalsAgainstPerGame', family: 'performance', threshold: 1, minGames: CLUB_COMPARISON_MIN_PERFORMANCE_GAMES },
  { key: 'offense', family: 'performance', threshold: 2, minGames: CLUB_COMPARISON_MIN_PERFORMANCE_GAMES },
  { key: 'defense', family: 'performance', threshold: 2, minGames: CLUB_COMPARISON_MIN_PERFORMANCE_GAMES },
  { key: 'professionalRate', family: 'squad', threshold: 15, minGames: CLUB_COMPARISON_MIN_SQUAD_GAMES, minPlayerGap: 3 },
  { key: 'underuseRate', family: 'squad', threshold: 15, minGames: CLUB_COMPARISON_MIN_SQUAD_GAMES, minPlayerGap: 3 },
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
