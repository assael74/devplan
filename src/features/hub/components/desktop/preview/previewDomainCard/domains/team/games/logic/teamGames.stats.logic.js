// preview/previewDomainCard/domains/team/games/logic/teamGames.stats.logic.js

import { n } from '../../../../../../../../../../shared/games/games.summary.logic.js'

const safe = (v) => (v == null ? '' : String(v))

export const TEAM_LEAGUE_REQUIRED_FIELDS = [
  'league',
  'leagueLevel',
  'leaguePosition',
  'points',
  'leagueGoalsFor',
  'leagueRound',
  'leagueNumGames',
  'leagueGoalsAgainst',
]

const hasValue = (value) => value !== undefined && value !== null && value !== ''

const calcPct = (value, total) => {
  const v = n(value)
  const t = n(total)

  if (!t) return 0
  return Math.round((v / t) * 100)
}

const calcProjection = (value, playedGames, totalGames) => {
  const v = n(value)
  const played = n(playedGames)
  const total = n(totalGames)

  if (!played || !total) return 0
  return Number(((v / played) * total).toFixed(1))
}

export function getLeaguePointsSummary(summary) {
  const leagueStats = summary?.leagueStats || null

  if (leagueStats) {
    return {
      leaguePossible: leagueStats?.maxPoints ?? 0,
      leagueAchieved: leagueStats?.points ?? 0,
      leagueSuccessPct: leagueStats?.successPct ?? 0,
    }
  }

  const leaguePoints = summary?.leaguePoints || {}

  return {
    leaguePossible: leaguePoints?.possible ?? 0,
    leagueAchieved: leaguePoints?.achieved ?? 0,
    leagueSuccessPct: leaguePoints?.successPct ?? 0,
  }
}

export const calcLeaguePointsSummaryFromGames = (rows) => {
  const leagueRows = (rows || []).filter((x) => x?.type === 'league')
  const playedLeagueRows = leagueRows.filter((x) => {
    const r = safe(x?.result).trim().toLowerCase()
    return r === 'win' || r === 'draw' || r === 'loss'
  })

  const achieved = playedLeagueRows.reduce((sum, x) => sum + n(x?.points), 0)
  const possible = playedLeagueRows.length * 3
  const successPct = possible > 0 ? Math.round((achieved / possible) * 100) : 0

  return {
    totalGames: leagueRows.length,
    playedGames: playedLeagueRows.length,
    achieved,
    possible,
    successPct,
  }
}

export const buildLeagueStatsFromTeam = (team) => {
  const leagueRound = n(team?.leagueRound)
  const leagueNumGames = n(team?.leagueNumGames)

  const points = n(team?.points)
  const goalsFor = n(team?.leagueGoalsFor)
  const goalsAgainst = n(team?.leagueGoalsAgainst)

  const maxPoints = leagueRound * 3
  const totalMaxPoints = leagueNumGames * 3
  const remainingGames = Math.max(leagueNumGames - leagueRound, 0)

  const missingFields = TEAM_LEAGUE_REQUIRED_FIELDS.filter((field) => !hasValue(team?.[field]))
  const successPct = calcPct(points, maxPoints)

  return {
    source: 'team',
    level: 'light',
    isReady: missingFields.length === 0,
    missingFields,

    league: safe(team?.league),
    leagueLevel: safe(team?.leagueLevel),
    leaguePosition: safe(team?.leaguePosition),

    playedGames: leagueRound,
    totalGames: leagueNumGames,
    remainingGames,

    points,
    maxPoints,
    totalMaxPoints,
    successPct,

    pointsPerGame: leagueRound > 0 ? Number((points / leagueRound).toFixed(2)) : 0,

    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,

    goalsForPerGame: leagueRound > 0 ? Number((goalsFor / leagueRound).toFixed(2)) : 0,
    goalsAgainstPerGame: leagueRound > 0 ? Number((goalsAgainst / leagueRound).toFixed(2)) : 0,

    projectedTotalPoints: calcProjection(points, leagueRound, leagueNumGames),
    projectedGoalsFor: calcProjection(goalsFor, leagueRound, leagueNumGames),
    projectedGoalsAgainst: calcProjection(goalsAgainst, leagueRound, leagueNumGames),
  }
}

export const buildGameStatsFromSummary = ({ summary, rows, built, leaguePoints }) => {
  return {
    source: 'teamGames',
    level: 'medium',

    total: summary?.total ?? 0,
    wins: summary?.wins ?? 0,
    draws: summary?.draws ?? 0,
    losses: summary?.losses ?? 0,
    points: summary?.points ?? 0,
    goalsFor: summary?.gf ?? 0,
    goalsAgainst: summary?.ga ?? 0,
    byType: summary?.byType || {},

    leaguePoints,
    rowsCount: Array.isArray(rows) ? rows.length : 0,
    playedGamesCount: Array.isArray(built?.playedGames) ? built.playedGames.length : 0,
    upcomingGamesCount: Array.isArray(built?.upcomingGames) ? built.upcomingGames.length : 0,
  }
}
