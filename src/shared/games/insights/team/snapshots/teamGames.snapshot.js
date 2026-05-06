// shared/games/insights/team/snapshots/teamGames.snapshot.js

import { buildGamesView } from '../../../games.view.logic.js'

import {
  filterLeaguePlayedGames,
  buildResultBreakdown,
  buildGoalsSummary,
  buildGroupedInsights,
  buildRecentWindow,
  buildStreaks,
} from '../../games.insights.shared.js'

import {
  calcPercent,
  calcProjection,
  roundNumber,
} from '../../shared/index.js'

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const normalizeText = (value) => {
  return String(value || '').trim().toLowerCase()
}

const getGameObject = (row = {}) => {
  return row?.game || row
}

const resolveGameType = (row = {}) => {
  const game = getGameObject(row)

  return normalizeText(
    row?.type ||
      row?.gameType ||
      row?.competitionType ||
      game?.type ||
      game?.gameType ||
      game?.competitionType ||
      ''
  )
}

const isLeagueGame = (row = {}) => {
  const type = resolveGameType(row)

  if (!type) return true

  return (
    type === 'league' ||
    type === 'ליגה' ||
    type === 'leaguegame' ||
    type === 'league_game'
  )
}

const isPlayedRow = (row = {}) => {
  const game = getGameObject(row)

  const status = normalizeText(
    row?.status ||
      row?.gameStatus ||
      game?.status ||
      game?.gameStatus ||
      ''
  )

  if (
    status === 'played' ||
    status === 'done' ||
    status === 'שוחק' ||
    status === 'הסתיים'
  ) {
    return true
  }

  if (
    row?.played === true ||
    row?.isPlayed === true ||
    game?.played === true ||
    game?.isPlayed === true
  ) {
    return true
  }

  return false
}

const buildLeagueRows = (rows = []) => {
  return rows.filter(isLeagueGame)
}

const buildLeagueUpcomingRows = (rows = []) => {
  return rows.filter((row) => isLeagueGame(row) && !isPlayedRow(row))
}

const buildCalculationFields = ({
  leagueRows = [],
  leaguePlayedGames = [],
  leagueUpcomingGames = [],
  result = {},
  goals = {},
}) => {
  const playedGames = toNumber(result?.totalPlayed || leaguePlayedGames.length)
  const totalGames = leagueRows.length
  const remainingGames = leagueUpcomingGames.length

  const points = toNumber(result?.points)
  const goalsFor = toNumber(goals?.gf)
  const goalsAgainst = toNumber(goals?.ga)

  const maxPoints = playedGames * 3
  const totalMaxPoints = totalGames * 3

  const pointsRate = calcPercent(points, maxPoints)

  const pointsPerGame = roundNumber(
    playedGames > 0 ? points / playedGames : 0,
    2
  )

  const goalsForPerGame = roundNumber(
    playedGames > 0 ? goalsFor / playedGames : 0,
    2
  )

  const goalsAgainstPerGame = roundNumber(
    playedGames > 0 ? goalsAgainst / playedGames : 0,
    2
  )

  return {
    isReady: playedGames > 0,

    playedGames,
    totalGames,
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
      currentGames: playedGames,
      totalGames,
      digits: 1,
    }),

    projectedGoalsFor: calcProjection({
      currentValue: goalsFor,
      currentGames: playedGames,
      totalGames,
      digits: 1,
    }),

    projectedGoalsAgainst: calcProjection({
      currentValue: goalsAgainst,
      currentGames: playedGames,
      totalGames,
      digits: 1,
    }),
  }
}

export const buildTeamGamesSnapshot = ({ rows = [], normalizeRow }) => {
  const view = buildGamesView(rows, normalizeRow)

  const allRows = Array.isArray(view?.rows) ? view.rows : []
  const leagueRows = buildLeagueRows(allRows)

  const playedRows = Array.isArray(view?.playedGames) ? view.playedGames : []
  const upcomingRows = Array.isArray(view?.upcomingGames)
    ? view.upcomingGames
    : []

  const leaguePlayedGames = filterLeaguePlayedGames(playedRows)
  const leagueUpcomingGames = buildLeagueUpcomingRows(upcomingRows)

  const result = buildResultBreakdown(leaguePlayedGames)
  const goals = buildGoalsSummary(leaguePlayedGames)
  const grouped = buildGroupedInsights(leaguePlayedGames)

  const calculation = buildCalculationFields({
    leagueRows,
    leaguePlayedGames,
    leagueUpcomingGames,
    result,
    goals,
  })

  return {
    source: 'games',
    sourceLabel: 'נתוני משחקים',
    level: 'medium',
    calculationKind: 'gamesOnly',

    state: view.state,

    rows: allRows,
    leagueRows,

    playedRows,
    playedGames: leaguePlayedGames,
    leaguePlayedGames,

    upcomingRows,
    upcomingGames: leagueUpcomingGames,
    leagueUpcomingGames,

    nextGame: view.nextGame,

    ...calculation,

    totals: {
      playedGames: calculation.playedGames,
      totalGames: calculation.totalGames,
      remainingGames: calculation.remainingGames,

      points: calculation.points,
      maxPoints: calculation.maxPoints,
      totalMaxPoints: calculation.totalMaxPoints,

      goalsFor: calculation.goalsFor,
      goalsAgainst: calculation.goalsAgainst,
      goalDifference: calculation.goalDifference,
    },

    result,
    goals,

    grouped: {
      byHomeOrAway: grouped.byHomeOrAway,
      byType: grouped.byType,
      byDifficulty: grouped.byDifficulty,
    },

    trends: {
      recent: buildRecentWindow(leaguePlayedGames, 5),
      streaks: buildStreaks(leaguePlayedGames),
    },

    schedule: {
      upcomingCount: leagueUpcomingGames.length,
      nextGame: view.nextGame,
    },
  }
}
