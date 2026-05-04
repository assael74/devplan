// shared/games/insights/team/teamLeague.snapshot.js

import {
  calcPercent,
  calcProjection,
  roundNumber,
  toNumber,
} from '../shared/index.js'

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

const hasValue = (value) => {
  return value !== undefined && value !== null && value !== ''
}

export const getMissingTeamLeagueFields = (team) => {
  return TEAM_LEAGUE_REQUIRED_FIELDS.filter((field) => !hasValue(team?.[field]))
}

export const buildTeamLeagueSnapshot = (team) => {
  const missingFields = getMissingTeamLeagueFields(team)
  const isReady = missingFields.length === 0

  const leagueRound = toNumber(team?.leagueRound)
  const leagueNumGames = toNumber(team?.leagueNumGames)

  const points = toNumber(team?.points)
  const goalsFor = toNumber(team?.leagueGoalsFor)
  const goalsAgainst = toNumber(team?.leagueGoalsAgainst)

  const maxPoints = leagueRound * 3
  const totalMaxPoints = leagueNumGames * 3
  const remainingGames = Math.max(leagueNumGames - leagueRound, 0)

  const pointsRate = calcPercent(points, maxPoints)
  const pointsPerGame = roundNumber(leagueRound > 0 ? points / leagueRound : 0, 2)

  const goalsForPerGame = roundNumber(
    leagueRound > 0 ? goalsFor / leagueRound : 0,
    2
  )

  const goalsAgainstPerGame = roundNumber(
    leagueRound > 0 ? goalsAgainst / leagueRound : 0,
    2
  )

  return {
    source: 'team',
    sourceLabel: 'נתוני קבוצה',
    level: 'light',
    calculationKind: 'teamOnly',

    isReady,
    missingFields,

    league: team?.league || '',
    leagueLevel: team?.leagueLevel || '',
    leaguePosition: team?.leaguePosition || '',

    playedGames: leagueRound,
    totalGames: leagueNumGames,
    remainingGames,

    points,
    maxPoints,
    totalMaxPoints,
    pointsRate,
    pointsPerGame,

    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    goalsForPerGame,
    goalsAgainstPerGame,

    projectedTotalPoints: calcProjection({
      currentValue: points,
      currentGames: leagueRound,
      totalGames: leagueNumGames,
      digits: 1,
    }),

    projectedGoalsFor: calcProjection({
      currentValue: goalsFor,
      currentGames: leagueRound,
      totalGames: leagueNumGames,
      digits: 1,
    }),

    projectedGoalsAgainst: calcProjection({
      currentValue: goalsAgainst,
      currentGames: leagueRound,
      totalGames: leagueNumGames,
      digits: 1,
    }),
  }
}
