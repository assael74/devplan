// src/shared/teams/expectations/expectations.scope.js

/*
|--------------------------------------------------------------------------
| Team Expectations / Scope
|--------------------------------------------------------------------------
|
| אחריות:
| בניית ציפיות לרצף משחקים וסיכום expected / actual.
*/

import {
  buildTeamGameExpectations,
} from './expectations.game.js'

import {
  TEAM_EXPECTATIONS_STATUS,
} from './expectations.status.js'

import {
  getGameObject,
  roundNumber,
  toNumber,
} from './expectations.utils.js'

const emptyArray = []

const getActualPoints = ({
  goalsFor,
  goalsAgainst,
}) => {
  if (goalsFor > goalsAgainst) return 3
  if (goalsFor === goalsAgainst) return 1

  return 0
}

const getGameResult = (row = {}) => {
  const game = getGameObject(row)
  const goalsFor = toNumber(game?.goalsFor, null)
  const goalsAgainst = toNumber(game?.goalsAgainst, null)

  return {
    goalsFor,
    goalsAgainst,
    points:
      Number.isFinite(goalsFor) && Number.isFinite(goalsAgainst)
        ? getActualPoints({ goalsFor, goalsAgainst })
        : null,
  }
}

const isUsableExpectation = (item = {}) => {
  return (
    item?.status === TEAM_EXPECTATIONS_STATUS.READY ||
    item?.status === TEAM_EXPECTATIONS_STATUS.PARTIAL
  )
}

const addIfNumber = ({
  total,
  value,
}) => {
  const n = toNumber(value, null)

  return Number.isFinite(n) ? total + n : total
}

export const buildTeamScopeExpectations = ({
  team,
  games,
  targets,
} = {}) => {
  const safeGames = Array.isArray(games) ? games : emptyArray

  const rows = safeGames.map((game) => {
    const expectation = buildTeamGameExpectations({
      team,
      game,
      targets,
    })

    const actual = getGameResult(game)

    return {
      game,
      gameId: expectation?.gameId || '',
      status: expectation?.status || '',
      expectation,
      actual,
    }
  })

  const usableRows = rows.filter((row) => {
    return isUsableExpectation(row.expectation)
  })

  const blockedRows = rows.filter((row) => {
    return row?.expectation?.status === TEAM_EXPECTATIONS_STATUS.BLOCKED
  })

  const totals = usableRows.reduce((acc, row) => {
    const expectation = row.expectation
    const actual = row.actual

    return {
      expectedPoints: addIfNumber({
        total: acc.expectedPoints,
        value: expectation.expectedPoints,
      }),

      expectedGoalsFor: addIfNumber({
        total: acc.expectedGoalsFor,
        value: expectation.expectedGoalsFor,
      }),

      expectedGoalsAgainst: addIfNumber({
        total: acc.expectedGoalsAgainst,
        value: expectation.expectedGoalsAgainst,
      }),

      actualPoints: addIfNumber({
        total: acc.actualPoints,
        value: actual.points,
      }),

      actualGoalsFor: addIfNumber({
        total: acc.actualGoalsFor,
        value: actual.goalsFor,
      }),

      actualGoalsAgainst: addIfNumber({
        total: acc.actualGoalsAgainst,
        value: actual.goalsAgainst,
      }),
    }
  }, {
    expectedPoints: 0,
    expectedGoalsFor: 0,
    expectedGoalsAgainst: 0,
    actualPoints: 0,
    actualGoalsFor: 0,
    actualGoalsAgainst: 0,
  })

  return {
    status: usableRows.length
      ? TEAM_EXPECTATIONS_STATUS.READY
      : TEAM_EXPECTATIONS_STATUS.BLOCKED,

    gamesCount: safeGames.length,
    usableGamesCount: usableRows.length,
    blockedGamesCount: blockedRows.length,

    expectedPoints: roundNumber(totals.expectedPoints, 2),
    expectedGoalsFor: roundNumber(totals.expectedGoalsFor, 2),
    expectedGoalsAgainst: roundNumber(totals.expectedGoalsAgainst, 2),

    actualPoints: roundNumber(totals.actualPoints, 2),
    actualGoalsFor: roundNumber(totals.actualGoalsFor, 2),
    actualGoalsAgainst: roundNumber(totals.actualGoalsAgainst, 2),

    deltas: {
      points: roundNumber(totals.actualPoints - totals.expectedPoints, 2),
      goalsFor: roundNumber(totals.actualGoalsFor - totals.expectedGoalsFor, 2),
      goalsAgainst: roundNumber(totals.expectedGoalsAgainst - totals.actualGoalsAgainst, 2),
    },

    rows,
  }
}
