// src/shared/teams/scoring/scoring.context.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Context Builder
|--------------------------------------------------------------------------
|
| אחריות:
| בניית אובייקט context אחיד לחישוב ציון משחק קבוצתי.
|
| חשוב:
| expected values לא מחושבים כאן.
| מקור האמת לציפיות משחק הוא:
| src/shared/teams/expectations
*/

import {
  buildTeamGameExpectations,
} from '../expectations/index.js'

import {
  getGameObject,
  toNumber,
} from './scoring.utils.js'

const getGameId = (row = {}) => {
  const game = getGameObject(row)

  return (
    row?.gameId ||
    game?.id ||
    game?.gameId ||
    ''
  )
}

const isFilledScoreValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const pickScoreValue = (...values) => {
  for (const value of values) {
    if (isFilledScoreValue(value)) {
      return value
    }
  }

  return null
}

const resolveGameResult = (game = {}) => {
  const source = getGameObject(game)
  const result = source?.result || {}

  const goalsFor = pickScoreValue(
    source?.goalsFor,
    source?.teamGoals,
    source?.goals,
    source?.scoreFor,
    source?.home === true ? source?.homeGoals : source?.awayGoals,
    result?.goalsFor,
    result?.teamGoals,
    result?.for
  )

  const goalsAgainst = pickScoreValue(
    source?.goalsAgainst,
    source?.rivalGoals,
    source?.opponentGoals,
    source?.against,
    source?.scoreAgainst,
    source?.home === true ? source?.awayGoals : source?.homeGoals,
    result?.goalsAgainst,
    result?.rivalGoals,
    result?.against
  )

  return {
    goalsFor: toNumber(goalsFor, 0),
    goalsAgainst: toNumber(goalsAgainst, 0),
  }
}

const getResultPoints = ({
  goalsFor,
  goalsAgainst,
}) => {
  if (goalsFor > goalsAgainst) return 3
  if (goalsFor === goalsAgainst) return 1

  return 0
}

export const buildTeamScoringContext = ({
  team,
  game,
  readiness,
} = {}) => {
  const source = getGameObject(game)
  const targets = readiness?.targets || {}

  const expectations = buildTeamGameExpectations({
    team,
    game: source,
    targets,
  })

  const {
    goalsFor,
    goalsAgainst,
  } = resolveGameResult(source)

  const actualPoints = getResultPoints({
    goalsFor,
    goalsAgainst,
  })

  return {
    teamId: team?.id || '',
    gameId: getGameId(game),

    homeAway: expectations?.homeAway || '',
    difficulty: expectations?.difficulty || 'equal',

    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,

    actualPoints,
    expectedPointsForGame: expectations?.expectedPoints ?? 0,

    leagueNumGames:
      expectations?.context?.seasonTargets?.leagueNumGames || 0,

    targetProfileId:
      expectations?.targetProfileId ||
      targets?.resolvedProfileId ||
      targets?.targetProfileId ||
      '',

    targetLabel:
      expectations?.targetLabel ||
      targets?.values?.targetLabel ||
      '',

    seasonTargets: {
      points: expectations?.context?.seasonTargets?.points ?? 0,
      successRate: expectations?.context?.seasonTargets?.successRate ?? 0,
      goalsFor: expectations?.context?.seasonTargets?.goalsFor ?? 0,
      goalsAgainst: expectations?.context?.seasonTargets?.goalsAgainst ?? 0,
      leagueNumGames:
        expectations?.context?.seasonTargets?.leagueNumGames || 0,
    },

    gameTargets: {
      expectedPointsForGame: expectations?.expectedPoints ?? 0,
      targetPointsPerGame: expectations?.base?.pointsPerGame ?? 0,
      targetGoalsForPerGame: expectations?.expectedGoalsFor,
      targetGoalsAgainstPerGame: expectations?.expectedGoalsAgainst,
    },

    expectations,

    targets,
  }
}
